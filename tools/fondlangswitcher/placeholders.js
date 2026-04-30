/* eslint-disable import/no-unresolved, max-len, no-restricted-syntax, no-continue */

/**
 * Reads multi-sheet `placeholders.json` and the `language-switcher` tab:
 * rows with columns named by locale (e.g. en, fr) mapping path-without-locale.
 */

const DEFAULT_SHEET = 'language-switcher';

function normalizeSheetPath(p) {
  if (p == null || p === '') return '';
  let s = String(p).trim();
  if (!s.startsWith('/')) s = `/${s}`;
  s = s.replace(/\.html$/i, '');
  if (s.length > 1) s = s.replace(/\/$/, '');
  return s;
}

/** @param {string[]} segments [locale, ...rest] */
export function pathAfterLocale(segments) {
  if (segments.length < 2) return '';
  return normalizeSheetPath(`/${segments.slice(1).join('/')}`);
}

/**
 * @param {unknown} json
 * @param {string} sheetName
 * @returns {{ rows: Record<string, string>[] }}
 */
export function extractLanguageSwitcherRows(json, sheetName) {
  if (!json || typeof json !== 'object') return { rows: [] };

  const sheet = json[sheetName];
  if (sheet && Array.isArray(sheet.data)) {
    return { rows: sheet.data.filter((r) => r && typeof r === 'object') };
  }

  if (json[':type'] === 'sheet' && Array.isArray(json.data)) {
    return { rows: json.data.filter((r) => r && typeof r === 'object') };
  }

  return { rows: [] };
}

/**
 * Column names in language-switcher that hold path strings (e.g. en, fr, zh-cn).
 * Uses any row that has a non-empty string value starting with "/".
 */
export function detectLocaleColumnKeys(rows) {
  const keys = new Set();
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    for (const [k, v] of Object.entries(row)) {
      if (typeof v !== 'string' || !v.trim().startsWith('/')) continue;
      if (!/^[a-z][a-z0-9-]*$/i.test(k) || k.length > 24) continue;
      keys.add(k);
    }
  }
  return [...keys].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

/**
 * Match current path (without leading locale) to a row; build full pathname with target locale.
 * @param {Record<string, string>[]} rows
 * @param {string} fromLoc
 * @param {string} toLoc
 * @param {string} afterLocalePath normalized path after locale, e.g. /fondation-pour-les-arbres-news
 * @returns {string | null} pathname starting with /{toLoc}/...
 */
export function resolvePathWithRows(rows, fromLoc, toLoc, afterLocalePath) {
  const p = normalizeSheetPath(afterLocalePath);
  const fromKey = fromLoc;
  const toKey = toLoc;

  const sorted = rows
    .filter((r) => r[fromKey])
    .sort((a, b) => normalizeSheetPath(b[fromKey]).length - normalizeSheetPath(a[fromKey]).length);

  for (const row of sorted) {
    const base = normalizeSheetPath(row[fromKey]);
    if (!base) continue;
    const baseSlash = `${base}/`;
    if (p === base || p.startsWith(baseSlash)) {
      const targetBase = normalizeSheetPath(row[toKey]);
      if (!targetBase) return null;
      const suffix = p.length > base.length ? p.slice(base.length) : '';
      const merged = normalizeSheetPath(`${targetBase}${suffix}`);
      return `/${toLoc}${merged}`;
    }
  }
  return null;
}

/**
 * @param {string} directoryPrefix path under repo (no leading/trailing slash), or ''
 */
export function buildPlaceholdersUrl(branch, org, repo, tier, directoryPrefix = '') {
  const domain = tier === 'live' ? 'aem.live' : 'aem.page';
  const base = `https://${branch}--${repo}--${org}.${domain}`;
  const sub = directoryPrefix ? `${directoryPrefix.replace(/\/$/, '')}/` : '';
  return `${base}/${sub}placeholders.json`;
}

const ADMIN_PLACEHOLDERS = 'https://admin.da.live/source';

/**
 * Directory prefixes to try for `placeholders.json` (repo-relative), newest parent first after root.
 * Skips the last path segment so a page slug is not used as a folder (e.g. …/en/my-page → try …/en, …, root).
 * @param {string} [sitePath] DA `context.path` (site-relative), e.g. /arbres-fondationsaudemarspiguet/en/foo
 * @returns {string[]} ordered unique prefixes, always starting with ''
 */
export function buildPlaceholderDirectoryCandidates(sitePath) {
  const candidates = [''];
  if (!sitePath || typeof sitePath !== 'string') return candidates;
  const trimmed = sitePath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed) return candidates;
  const parts = trimmed.split('/').filter(Boolean);
  const maxDepth = parts.length > 1 ? parts.length - 1 : parts.length;
  for (let i = 0; i < maxDepth; i += 1) {
    candidates.push(parts.slice(0, i + 1).join('/'));
  }
  return [...new Set(candidates)];
}

function sheetHasLanguageColumns(json, sheetName) {
  const { rows } = extractLanguageSwitcherRows(json, sheetName);
  if (!rows.length) return false;
  return detectLocaleColumnKeys(rows).length > 0;
}

/**
 * @param {string} branch
 * @param {string} org
 * @param {string} repo
 * @param {string} tier
 * @param {string} [sheetName]
 * @param {object | null} [actions] DA SDK actions (`daFetch`) when preview fetch fails.
 * @param {string} [sitePath] site-relative path from DA context — used to find nested `…/placeholders.json`
 */
export async function fetchLanguageSwitcherRows(
  branch,
  org,
  repo,
  tier,
  sheetName = DEFAULT_SHEET,
  actions = null,
  sitePath = '',
) {
  /* eslint-disable no-await-in-loop -- try each candidate placeholders URL in order */
  const parseRows = async (resp, sourceLabel) => {
    if (!resp.ok) throw new Error(`${sourceLabel} HTTP ${resp.status}`);
    const json = await resp.json();
    if (!sheetHasLanguageColumns(json, sheetName)) {
      throw new Error('no language-switcher columns');
    }
    return { rows: extractLanguageSwitcherRows(json, sheetName).rows, url: sourceLabel };
  };

  const dirs = buildPlaceholderDirectoryCandidates(sitePath);
  const errors = [];

  for (const dir of dirs) {
    const previewUrl = buildPlaceholdersUrl(branch, org, repo, tier, dir);
    try {
      const resp = await fetch(previewUrl, { credentials: 'omit' });
      if (resp.ok) {
        try {
          return await parseRows(resp, previewUrl);
        } catch (e) {
          errors.push(`${previewUrl}: ${e.message}`);
        }
      } else {
        errors.push(`${previewUrl}: HTTP ${resp.status}`);
      }
    } catch (e) {
      errors.push(`${previewUrl}: ${e.message}`);
    }

    if (actions?.daFetch) {
      const adminPath = dir ? `${dir}/placeholders.json` : 'placeholders.json';
      const adminUrl = `${ADMIN_PLACEHOLDERS}/${org}/${repo}/${adminPath}`;
      try {
        const resp = await actions.daFetch(adminUrl);
        if (resp.ok) {
          try {
            return await parseRows(resp, adminUrl);
          } catch (e) {
            errors.push(`${adminUrl}: ${e.message}`);
          }
        } else {
          errors.push(`${adminUrl}: HTTP ${resp.status}`);
        }
      } catch (e) {
        errors.push(`${adminUrl}: ${e.message}`);
      }
    }
  }

  const summary = errors.length ? ` Tried: ${errors.slice(0, 4).join('; ')}${errors.length > 4 ? '…' : ''}` : '';
  /* eslint-enable no-await-in-loop */
  throw new Error(
    `Could not load placeholders.json with "${sheetName}" language columns.${summary}`,
  );
}

export { DEFAULT_SHEET };

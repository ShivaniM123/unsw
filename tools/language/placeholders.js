/* eslint-disable import/no-unresolved, max-len, no-restricted-syntax, no-continue */

/**
 * Reads the multi-sheet placeholders.json published by the site (same source as
 * https://da.live/sheet#/org/repo/placeholders ) and uses the "language-switcher"
 * tab: rows with columns named by locale (e.g. en, fr) mapping path-without-locale.
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

export function buildPlaceholdersUrl(branch, org, repo, tier) {
  const domain = tier === 'live' ? 'aem.live' : 'aem.page';
  return `https://${branch}--${repo}--${org}.${domain}/placeholders.json`;
}

const ADMIN_PLACEHOLDERS = 'https://admin.da.live/source';

/**
 * @param {string} branch
 * @param {string} org
 * @param {string} repo
 * @param {string} tier
 * @param {string} [sheetName]
 * @param {object | null} [actions] DA SDK actions (`daFetch`) when preview fetch fails.
 */
export async function fetchLanguageSwitcherRows(branch, org, repo, tier, sheetName = DEFAULT_SHEET, actions = null) {
  const previewUrl = buildPlaceholdersUrl(branch, org, repo, tier);

  const parseRows = async (resp, sourceLabel) => {
    if (!resp.ok) throw new Error(`${sourceLabel} HTTP ${resp.status}`);
    const json = await resp.json();
    return { rows: extractLanguageSwitcherRows(json, sheetName).rows, url: sourceLabel };
  };

  try {
    const resp = await fetch(previewUrl, { credentials: 'omit' });
    if (resp.ok) return await parseRows(resp, previewUrl);
  } catch {
    /* fall through */
  }

  if (actions?.daFetch) {
    const adminUrl = `${ADMIN_PLACEHOLDERS}/${org}/${repo}/placeholders.json`;
    const resp = await actions.daFetch(adminUrl);
    return parseRows(resp, adminUrl);
  }

  throw new Error(
    'Could not load placeholders.json. Use a logged-in da.live session or publish preview.',
  );
}

export { DEFAULT_SHEET };

/* eslint-disable import/no-unresolved, max-len, no-restricted-syntax, no-continue */

const LANG_CONF = '/.da/translate-v2.json';
const ADMIN_SOURCE = 'https://admin.da.live/source';

/**
 * @param {string} loc
 * @returns {string|null}
 */
export function normalizeLocaleKey(loc) {
  if (typeof loc !== 'string') return null;
  const s = loc.trim();
  if (!s) return null;
  return s.replace(/^\//, '').split('/')[0] || null;
}

/**
 * Build switch targets from translate-v2.json (languages + regional locales).
 * Mirrors da-locale-tools/tools/locales/index.js getLangsAndLocales().
 *
 * @param {object} sheet
 * @param {string} defaultSite
 * @returns {Array<{ key: string, location: string, site: string, name: string|null, globalLocation?: string }>}
 */
export function buildSwitchTargets(sheet, defaultSite) {
  const langData = Array.isArray(sheet?.languages?.data) ? sheet.languages.data : [];
  const localeData = Array.isArray(sheet?.locales?.data) ? sheet.locales.data : [];

  const langs = langData
    .filter((row) => row && typeof row === 'object' && row.location)
    .map((row) => {
      const location = String(row.location).trim();
      const key = normalizeLocaleKey(location);
      if (!key) return null;
      return {
        key,
        location,
        site: row.site ? String(row.site).replace(/^\//, '') : defaultSite,
        name: typeof row.name === 'string' && row.name.trim() ? row.name.trim() : null,
      };
    })
    .filter(Boolean);

  const regional = [];
  for (const row of localeData) {
    if (!row || typeof row !== 'object') continue;
    for (const lang of langs) {
      const location = row.location
        ? `${lang.location}-${String(row.location).replace(/^\//, '')}`
        : lang.location;
      const key = normalizeLocaleKey(location);
      if (!key) continue;
      regional.push({
        key,
        location,
        site: row.site ? String(row.site).replace(/^\//, '') : lang.site,
        name: lang.name,
        globalLocation: lang.location,
      });
    }
  }

  const byKey = new Map();
  for (const entry of [...langs, ...regional]) {
    if (!byKey.has(entry.key.toLowerCase())) byKey.set(entry.key.toLowerCase(), entry);
  }
  return [...byKey.values()].sort((a, b) =>
    a.key.localeCompare(b.key, undefined, { sensitivity: 'base' }),
  );
}

/**
 * @param {string[]} segments path after org/repo
 * @param {string[]} langKeys
 * @returns {number}
 */
export function findLocaleSegmentIndex(segments, langKeys) {
  const sorted = [...langKeys].sort((a, b) => b.length - a.length);
  const set = new Set(sorted.map((k) => k.toLowerCase()));
  for (let i = 0; i < segments.length; i += 1) {
    if (set.has(segments[i].toLowerCase())) return i;
  }
  return -1;
}

/**
 * @param {Array<{ key: string, site: string }>} targets
 * @param {string} key
 * @param {string} defaultSite
 */
export function siteForTargetKey(targets, key, defaultSite) {
  const found = targets.find((t) => t.key.toLowerCase() === key.toLowerCase());
  return found?.site || defaultSite;
}

/**
 * @param {string} org
 * @param {string} repo
 * @param {object|null} actions DA SDK actions (daFetch)
 * @param {{ ttlMs?: number, global?: string|null, token?: string|null }} options
 * @returns {Promise<{ targets: object[], keys: string[] }|null>}
 */
export async function loadTranslateSwitchConfig(org, repo, actions, options = {}) {
  const { ttlMs = 300000, global: globalOverride, token } = options;
  const globalParam = globalOverride ?? new URLSearchParams(window.location.search).get('global');
  const cacheKey = `tv2:${org}:${repo}:${globalParam || 'local'}`;

  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const entry = JSON.parse(raw);
      if (entry?.expires > Date.now() && Array.isArray(entry.targets) && entry.targets.length) {
        return { targets: entry.targets, keys: entry.keys };
      }
    }
  } catch {
    /* ignore */
  }

  const configPath = globalParam || `/${org}/${repo}`;
  const url = `${ADMIN_SOURCE}${configPath}${LANG_CONF}`;

  let resp;
  if (actions?.daFetch) {
    resp = await actions.daFetch(url);
  } else {
    const fetchOpts = token ? { headers: { Authorization: `Bearer ${token}` } } : { credentials: 'omit' };
    resp = await fetch(url, fetchOpts);
  }

  if (!resp?.ok) return null;

  let sheet;
  try {
    sheet = await resp.json();
  } catch {
    return null;
  }

  const targets = buildSwitchTargets(sheet, repo);
  if (!targets.length) return null;

  const keys = targets.map((t) => t.key);
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ targets, keys, expires: Date.now() + Number(ttlMs) }),
    );
  } catch {
    /* sessionStorage unavailable */
  }

  return { targets, keys };
}

export { LANG_CONF };

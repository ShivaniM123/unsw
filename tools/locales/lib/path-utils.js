import { pathAfterLocale, resolvePathWithRows } from './language-switcher.js';
import { pathnameToSegments, buildDaHashUrl } from './da-url.js';

export function canonLocale(segment, keys) {
  if (!segment || !keys?.length) return null;
  return keys.find((k) => k.toLowerCase() === segment.toLowerCase()) ?? null;
}

/**
 * If placeholders language-switcher maps current DA path → target lang, returns "/fr/..." else null.
 */
export function tryPlaceholderLanguagePath({ path, rows, keys, toLang }) {
  if (!rows?.length || !keys?.length || !path) return null;
  const parts = String(path).replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return null;

  const fromKey = canonLocale(parts[0], keys);
  if (!fromKey) return null;

  const toSeg = String(toLang.location || '')
    .replace(/^\//, '')
    .split('/')
    .filter(Boolean)[0];
  if (!toSeg) return null;
  const toKey = canonLocale(toSeg, keys);
  if (!toKey || toKey.toLowerCase() === fromKey.toLowerCase()) return null;

  const afterLoc = pathAfterLocale(parts);
  return resolvePathWithRows(rows, fromKey, toKey, afterLoc);
}

/**
 * All DA edit URLs for other locale columns (same logic as extension "open all").
 * @param {string} view
 * @param {string} org
 * @param {string} site repo key
 * @param {string} contextPath DA context.path (locale-first under repo)
 * @param {Record<string, string>[]} rows
 * @param {string[]} keys
 */
export function allPlaceholderEditUrls(view, org, site, contextPath, rows, keys) {
  if (!rows?.length || !keys?.length || keys.length <= 2) return [];
  const parts = String(contextPath).replace(/^\//, '').split('/').filter(Boolean);
  if (!parts.length) return [];
  const fromKey = canonLocale(parts[0], keys);
  if (!fromKey) return [];
  const afterLoc = pathAfterLocale(parts);
  const urls = [];
  for (const toKey of keys) {
    if (toKey.toLowerCase() === fromKey.toLowerCase()) continue;
    const rp = resolvePathWithRows(rows, fromKey, toKey, afterLoc);
    if (!rp) continue;
    urls.push(buildDaHashUrl(view, org, site, pathnameToSegments(rp)));
  }
  return urls;
}

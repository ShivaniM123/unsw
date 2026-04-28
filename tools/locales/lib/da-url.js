/**
 * Aligned with da-locale-hopper/shared.js — DA hash URLs and AEM preview URLs.
 * Used so Locales tool builds the same edit/preview links as the Language Hopper extension.
 */

const DA_HOSTS = ['da.live', 'www.da.live', 'stage.da.live'];
const DA_VIEWS = new Set(['edit', 'sheet', 'browse', 'config', 'media']);

/** @param {string} hash */
export function extractHashPath(hash) {
  if (!hash) return null;
  const parts = hash.split('#');
  const hashPath = parts.find((p) => p.startsWith('/'));
  return hashPath || null;
}

/**
 * @param {URL} url
 * @returns {{ kind: 'da', view: string, org: string, repo: string, segments: string[] } | { kind: 'aem', branch: string, org: string, repo: string, segments: string[] } | null}
 */
export function parseCurrentPage(url) {
  const host = url.hostname.toLowerCase();

  if (DA_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    const view = url.pathname.replace(/^\//, '').split('/')[0] || 'browse';
    if (!DA_VIEWS.has(view)) return null;
    const hashPath = extractHashPath(url.hash);
    if (!hashPath || hashPath.startsWith('/old_hash') || hashPath.startsWith('/access_token')) return null;
    const segments = hashPath
      .replace(/^\//, '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    if (segments.length < 3) return null;
    const [org, repo, ...rest] = segments;
    return { kind: 'da', view, org, repo, segments: rest };
  }

  const helix = host.match(/^(.+?)--(.+?)--([^.]+)\.(aem|hlx)\.(page|live)$/i);
  if (helix) {
    const [, branch, repo, org] = helix;
    const segments = url.pathname.replace(/^\//, '').split('/').filter(Boolean);
    return { kind: 'aem', branch, org, repo, segments };
  }

  return null;
}

export function buildAemPreviewUrl(branch, org, repo, pathSegments, tier) {
  const path = pathSegments.length ? `/${pathSegments.join('/')}` : '/';
  const domain = tier === 'live' ? 'aem.live' : 'aem.page';
  return `https://${branch}--${repo}--${org}.${domain}${path}`;
}

export function buildDaHashUrl(view, org, repo, pathSegments) {
  const rest = pathSegments.length ? `/${pathSegments.join('/')}` : '';
  return `https://da.live/${view}#/${org}/${repo}${rest}`;
}

/** @param {string} pathname must start with / */
export function pathnameToSegments(pathname) {
  return pathname.replace(/^\//, '').split('/').filter(Boolean);
}

/**
 * Path segments after org/repo from a full hash path like /org/repo/en/page
 * @param {string} org
 * @param {string} repo
 * @param {string} fullPath leading /org/repo/...
 */
export function segmentsAfterOrgRepo(org, repo, fullPath) {
  const parts = String(fullPath).replace(/^\//, '').split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] === org && parts[1] === repo) return parts.slice(2);
  return parts;
}

/**
 * @param {string} view
 * @param {string} org
 * @param {string} repo
 * @param {string} fullPath /org/repo/locale/...
 */
export function buildDaUrlFromFullPath(view, org, repo, fullPath) {
  return buildDaHashUrl(view, org, repo, segmentsAfterOrgRepo(org, repo, fullPath));
}

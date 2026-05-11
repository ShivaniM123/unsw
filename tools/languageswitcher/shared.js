/* eslint-disable import/no-unresolved, max-len, object-curly-newline */

/**
 * URL parsing aligned with da-live `pathDetails.js`:
 * - Hash path: #/org/repo/rest/of/path
 * - Preview: https://main--{repo}--{org}.aem.page|live/...
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
    const segments = hashPath.replace(/^\//, '').split('/').filter(Boolean);
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
 * Build a da.live URL from DA SDK context for parseCurrentPage().
 * context.path is site-relative (e.g. /en/staff/page), not /org/repo/en/… — see jump-links / meta-id tools.
 * @param {{ path?: string, view?: string, org?: string, repo?: string, site?: string }} context
 * @returns {URL | null}
 */
export function contextToDaUrl(context) {
  const repo = context?.repo || context?.site;
  if (!context?.path || !context.org || !repo) return null;
  const viewRaw = context.view || 'edit';
  const view = viewRaw.replace(/^\//, '').split('/')[0] || 'edit';
  let path = context.path.startsWith('/') ? context.path : `/${context.path}`;
  const prefix = `/${context.org}/${repo}`;
  if (path === prefix || path.startsWith(`${prefix}/`)) {
    /* already full hash path */
  } else {
    path = `${prefix}${path}`;
  }
  return new URL(`https://da.live/${view}#${path}`);
}

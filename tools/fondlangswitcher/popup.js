/* eslint-disable import/no-unresolved, max-len */
/* eslint-disable operator-linebreak, object-curly-newline */
/* eslint-disable no-restricted-syntax, no-continue, prefer-destructuring */
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  parseCurrentPage,
  buildAemPreviewUrl,
  buildDaHashUrl,
  pathnameToSegments,
  contextToDaUrl,
} from './shared.js';
import {
  fetchLanguageSwitcherRows,
  resolvePathWithRows,
  pathAfterLocale,
  DEFAULT_SHEET,
  detectLocaleColumnKeys,
} from './placeholders.js';

const PRIMARY_LABEL_WITH_PICKER = 'Open page for selected language';

/** @param {string} targetLocale locale column id (e.g. fr, zh-cn) */
function primaryLabelSingleTarget(targetLocale) {
  return `Open page in ${targetLocale}`;
}

/** Sheet name, branch, preview tier, etc. Language list comes from placeholders `language-switcher`. */
const SETTINGS = {
  tier: 'page',
  branch: 'main',
  target: 'da-edit',
  daView: 'edit',
  placeholderSheetName: DEFAULT_SHEET,
  placeholderCacheTtlMs: 300000,
};

const DA_VIEWS = new Set(['edit', 'sheet', 'browse', 'config', 'media']);

function pickDaView(context) {
  const v = context?.view;
  if (typeof v === 'string' && DA_VIEWS.has(v.replace(/^\//, '').split('/')[0])) {
    return v.replace(/^\//, '').split('/')[0];
  }
  return SETTINGS.daView;
}

function readCache(cacheKey) {
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry?.expires > Date.now() && Array.isArray(entry.rows)) return entry.rows;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(cacheKey, rows, ttlMs) {
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ rows, expires: Date.now() + ttlMs }),
    );
  } catch {
    /* ignore */
  }
}

function setUi(status, previewUrl, canOpen, actions, opts = {}) {
  const { openDisabled = false } = opts;
  const showLangRow = opts.showLangRow === true;
  const showOpenAll = opts.showOpenAll === true;
  const openAllDisabled = opts.openAllDisabled === true;
  const statusEl = document.getElementById('status');
  const previewEl = document.getElementById('preview');
  const previewBlock = document.getElementById('previewBlock');
  const actionsEl = document.getElementById('actions');
  const langRow = document.getElementById('langRow');
  const openBtn = document.getElementById('open');
  const openAllBtn = document.getElementById('openAll');

  statusEl.textContent = status;
  statusEl.hidden = !String(status || '').trim() && Boolean(previewUrl);
  langRow.hidden = !showLangRow;

  if (previewUrl) {
    previewBlock.hidden = false;
    previewEl.textContent = previewUrl;
  } else {
    previewBlock.hidden = true;
  }

  actionsEl.hidden = !(canOpen || showOpenAll);
  openBtn.hidden = !canOpen;
  openBtn.disabled = !canOpen || openDisabled;
  openBtn.textContent =
    typeof opts.openPrimaryLabel === 'string' && opts.openPrimaryLabel.trim()
      ? opts.openPrimaryLabel.trim()
      : PRIMARY_LABEL_WITH_PICKER;
  openBtn.onclick = () => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
    if (typeof actions?.closeLibrary === 'function') {
      actions.closeLibrary();
    }
  };

  openAllBtn.hidden = !showOpenAll;
  openAllBtn.disabled = openAllDisabled;
  openAllBtn.onclick =
    showOpenAll && typeof opts.openAllClick === 'function' ? opts.openAllClick : null;
}

function canonLocale(segment, keys) {
  if (!segment || !keys?.length) return null;
  return keys.find((k) => k.toLowerCase() === segment.toLowerCase()) ?? null;
}

function cachePathKey(sitePath) {
  const s = (sitePath || '').replace(/^\/+|\/+$/g, '').replace(/\//g, '>');
  return s || 'root';
}

async function loadPlaceholderRows(org, repo, branch, tier, sheetName, ttlMs, actions, sitePath) {
  const pathKey = cachePathKey(sitePath);
  const cacheKey = `ph:${org}:${repo}:${branch}:${tier}:${sheetName}:${pathKey}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;
  const { rows } = await fetchLanguageSwitcherRows(
    branch,
    org,
    repo,
    tier,
    sheetName,
    actions,
    sitePath || '',
  );
  writeCache(cacheKey, rows, Number(ttlMs) || 300000);
  return rows;
}

/** First segment that matches a language column (paths like …/site/en/page). */
function findLocaleSegmentIndex(segments, langKeys) {
  const set = new Set(langKeys.map((k) => k.toLowerCase()));
  for (let i = 0; i < segments.length; i += 1) {
    if (set.has(segments[i].toLowerCase())) return i;
  }
  return -1;
}

/** Keep folders before locale + tail from resolved `/lang/...`. */
function mergeResolvedSegments(locIndex, segments, resolvedPath) {
  const tail = pathnameToSegments(resolvedPath);
  return [...segments.slice(0, locIndex), ...tail];
}

function fillLangSelect(keys, currentKey) {
  const sel = document.getElementById('langSelect');
  sel.replaceChildren();
  const others = keys.filter((k) => k.toLowerCase() !== currentKey.toLowerCase());
  for (const k of others) {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = k;
    sel.appendChild(o);
  }
  if (others.length) sel.value = others[0];
}

function buildDest(parsed, org, repo, newSegments, useBranch, tier, target, daView) {
  const openOnDa = parsed.kind === 'da' || target === 'da-edit';
  if (openOnDa) {
    const view = parsed.kind === 'da' ? parsed.view : daView;
    return buildDaHashUrl(view, org, repo, newSegments);
  }
  return buildAemPreviewUrl(useBranch, org, repo, newSegments, tier);
}

/**
 * Prefer `language-switcher` row match; if none, swap locale and keep the same suffix
 * (e.g. /fr/newsletter → /en/newsletter). Add a sheet row when EN/FR slugs differ.
 */
function resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc) {
  const fromSheet = resolvePathWithRows(rows, fromLoc, toLoc, afterLoc);
  if (fromSheet) return fromSheet;
  let rest = '';
  if (typeof afterLoc === 'string' && afterLoc.length > 0) {
    if (afterLoc.startsWith('/')) {
      rest = afterLoc;
    } else {
      rest = `/${afterLoc.replace(/^\//, '')}`;
    }
  }
  return `/${toLoc}${rest}`;
}

async function main() {
  const { context, actions } = await DA_SDK;
  setUi('Loading placeholders…', null, false, actions, { showLangRow: false });

  const pageUrl = contextToDaUrl({
    org: context.org,
    repo: context.repo || context.site,
    path: context.path,
    view: pickDaView(context),
  });
  if (!pageUrl) {
    setUi(
      'Missing page context (org, repo, path). Open this tool from the Library while a document page is open.',
      null,
      false,
      actions,
    );
    return;
  }

  const parsed = parseCurrentPage(pageUrl);
  if (!parsed) {
    setUi('Could not parse this page (need /org/repo/locale/… in context.path).', null, false, actions);
    return;
  }

  const { tier, branch, target, daView, placeholderSheetName, placeholderCacheTtlMs } = SETTINGS;
  const { org, repo } = parsed;
  const segments = [...parsed.segments];

  if (!segments.length) {
    setUi('Path must include a locale folder after org/repo.', null, false, actions);
    return;
  }

  const useBranch = parsed.kind === 'aem' ? parsed.branch : branch;
  /** Library iframe often omits `context.path`; hash segments are always after org/repo. */
  const sitePath = (() => {
    let p = typeof context.path === 'string' ? context.path.trim() : '';
    const prefix = `/${org}/${repo}`;
    if (p === prefix || p.startsWith(`${prefix}/`)) {
      p = p.slice(prefix.length);
      if (p && !p.startsWith('/')) p = `/${p}`;
    }
    if (!p && segments.length) {
      p = `/${segments.join('/')}`;
    }
    if (p && !p.startsWith('/')) p = `/${p}`;
    return p;
  })();

  let rows;
  try {
    rows = await loadPlaceholderRows(
      org,
      repo,
      useBranch,
      tier,
      placeholderSheetName || DEFAULT_SHEET,
      Number(placeholderCacheTtlMs) || 300000,
      actions,
      sitePath,
    );
  } catch (e) {
    setUi(`Could not load placeholders.json (${e.message}).`, null, false, actions);
    return;
  }

  const langKeys = detectLocaleColumnKeys(rows);
  if (langKeys.length === 0) {
    setUi(
      'No path columns found in language-switcher (values should start with /, e.g. en, fr).',
      null,
      false,
      actions,
    );
    return;
  }

  const locIndex = findLocaleSegmentIndex(segments, langKeys);
  if (locIndex < 0) {
    setUi(
      `No folder in this path matches a language column (${langKeys.join(', ')}).`,
      null,
      false,
      actions,
    );
    return;
  }
  const urlSeg = segments[locIndex];
  const afterLoc = pathAfterLocale(segments.slice(locIndex));

  const showLangPicker = langKeys.length >= 3;

  if (langKeys.length === 1) {
    document.getElementById('langRow').hidden = true;
    const [only] = langKeys;
    if (urlSeg.toLowerCase() === only.toLowerCase()) {
      setUi(
        `Already on ${only}. Add another language column to map paths, or open a page in a different locale folder.`,
        null,
        false,
        actions,
      );
      return;
    }
    const newSegments = [...segments.slice(0, locIndex), only, ...segments.slice(locIndex + 1)];
    const dest = buildDest(parsed, org, repo, newSegments, useBranch, tier, target, daView);
    setUi('', dest, true, actions, {
      showLangRow: false,
      openPrimaryLabel: primaryLabelSingleTarget(only),
    });
    return;
  }

  const fromLoc = canonLocale(urlSeg, langKeys);
  if (!fromLoc) {
    setUi(
      `This page’s locale folder is "${urlSeg}" but placeholders only define: ${langKeys.join(', ')}.`,
      null,
      false,
      actions,
    );
    return;
  }

  const sel = document.getElementById('langSelect');

  function countResolvableOtherLocales() {
    let n = 0;
    for (const toLoc of langKeys) {
      if (toLoc.toLowerCase() === fromLoc.toLowerCase()) continue;
      if (resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc)) n += 1;
    }
    return n;
  }

  function openAllLanguagePages() {
    const urls = [];
    for (const toLoc of langKeys) {
      if (toLoc.toLowerCase() === fromLoc.toLowerCase()) continue;
      const resolvedPath = resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc);
      const newSegments = mergeResolvedSegments(locIndex, segments, resolvedPath);
      urls.push(buildDest(parsed, org, repo, newSegments, useBranch, tier, target, daView));
    }
    for (const u of urls) {
      window.open(u, '_blank', 'noopener,noreferrer');
    }
    if (urls.length && typeof actions?.closeLibrary === 'function') {
      actions.closeLibrary();
    }
  }

  const openAllOpts = () => ({
    showOpenAll: langKeys.length > 2,
    openAllDisabled: countResolvableOtherLocales() === 0,
    openAllClick: openAllLanguagePages,
  });

  const applyDestination = (toLoc) => {
    if (toLoc.toLowerCase() === fromLoc.toLowerCase()) {
      setUi('Choose a language different from the current page.', null, true, actions, {
        showLangRow: showLangPicker,
        openDisabled: true,
        openPrimaryLabel: PRIMARY_LABEL_WITH_PICKER,
        ...openAllOpts(),
      });
      return;
    }

    const resolvedPath = resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc);
    const newSegments = mergeResolvedSegments(locIndex, segments, resolvedPath);
    const dest = buildDest(parsed, org, repo, newSegments, useBranch, tier, target, daView);
    setUi('', dest, true, actions, {
      showLangRow: showLangPicker,
      openDisabled: false,
      openPrimaryLabel: showLangPicker
        ? PRIMARY_LABEL_WITH_PICKER
        : primaryLabelSingleTarget(toLoc),
      ...openAllOpts(),
    });
  };

  if (showLangPicker) {
    fillLangSelect(langKeys, fromLoc);
    sel.addEventListener('change', () => applyDestination(sel.value));
    applyDestination(sel.value);
  } else {
    const other = langKeys.find((k) => k.toLowerCase() !== fromLoc.toLowerCase());
    applyDestination(other);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = `Error: ${err.message || String(err)}`;
    statusEl.hidden = false;
  }
});

/* eslint-disable import/no-unresolved, max-len */
/* eslint-disable operator-linebreak, object-curly-newline */
/* eslint-disable no-restricted-syntax, no-continue, prefer-destructuring */
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  parseCurrentPage,
  buildAemPreviewUrl,
  buildDaHashUrl,
  contextToDaUrl,
} from './shared.js';

const PRIMARY_LABEL_WITH_PICKER = 'Open page for selected language';

/** @param {string} targetLocale locale column id (e.g. fr, zh-cn) */
function primaryLabelSingleTarget(targetLocale) {
  return `Open page in ${targetLocale}`;
}

const TRANSLATE_CONF = '/.da/translate-v2.json';

/** Branch, preview tier, etc. Language list comes from translate-v2.json. */
const SETTINGS = {
  tier: 'page',
  branch: 'main',
  target: 'da-edit',
  daView: 'edit',
  translateCacheTtlMs: 300000,
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

function normalizeLocaleKey(loc) {
  if (typeof loc !== 'string') return null;
  const s = loc.trim();
  if (!s) return null;
  return s.replace(/^\//, '').split('/')[0] || null;
}

async function loadTranslateConfig(org, repo, ttlMs, actions) {
  const cacheKey = `translate:${org}:${repo}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const url = `https://admin.da.live/source/${org}/${repo}${TRANSLATE_CONF}`;
  const resp = actions?.daFetch ? await actions.daFetch(url) : await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error(`translate-v2.json HTTP ${resp.status}`);
  const json = await resp.json();

  const rows = Array.isArray(json?.languages?.data)
    ? json.languages.data.filter((r) => r && typeof r === 'object')
    : [];

  writeCache(cacheKey, rows, Number(ttlMs) || 300000);
  return rows;
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

async function main() {
  const { context, actions } = await DA_SDK;
  setUi('Loading languages…', null, false, actions, { showLangRow: false });

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

  const { tier, branch, target, daView, translateCacheTtlMs } = SETTINGS;
  const { org, repo } = parsed;
  const segments = [...parsed.segments];

  if (!segments.length) {
    setUi('Path must include a locale folder after org/repo.', null, false, actions);
    return;
  }

  const useBranch = parsed.kind === 'aem' ? parsed.branch : branch;
  const urlSeg = segments[0];

  let langRows;
  try {
    langRows = await loadTranslateConfig(org, repo, Number(translateCacheTtlMs) || 300000, actions);
  } catch (e) {
    setUi(`Could not load ${TRANSLATE_CONF} (${e.message}).`, null, false, actions);
    return;
  }

  const langs = langRows
    .map((r) => ({
      name: typeof r.name === 'string' && r.name.trim() ? r.name.trim() : null,
      key: normalizeLocaleKey(r.location),
      repo: typeof r.site === 'string' && r.site.trim() ? r.site.trim().replace(/^\//, '') : repo,
    }))
    .filter((l) => l.key);

  const langKeys = [...new Set(langs.map((l) => l.key))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  if (langKeys.length === 0) {
    setUi(
      `No languages found in ${TRANSLATE_CONF} (expected languages.data rows with "location" like "/en", "/fr").`,
      null,
      false,
      actions,
    );
    return;
  }

  const showLangPicker = langKeys.length >= 3;

  if (langKeys.length === 1) {
    document.getElementById('langRow').hidden = true;
    const [only] = langKeys;
    if (urlSeg.toLowerCase() === only.toLowerCase()) {
      setUi(
        `Already on ${only}. Add another language row in ${TRANSLATE_CONF}, or open a page in a different locale folder.`,
        null,
        false,
        actions,
      );
      return;
    }
    const newSegments = [only, ...segments.slice(1)];
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
      `This page’s locale folder is "${urlSeg}" but ${TRANSLATE_CONF} defines: ${langKeys.join(', ')}.`,
      null,
      false,
      actions,
    );
    return;
  }

  const sel = document.getElementById('langSelect');

  function langRepoForKey(key) {
    return langs.find((l) => l.key.toLowerCase() === key.toLowerCase())?.repo || repo;
  }

  function countOtherLocales() {
    return langKeys.filter((k) => k.toLowerCase() !== fromLoc.toLowerCase()).length;
  }

  function openAllLanguagePages() {
    const urls = [];
    for (const toLoc of langKeys) {
      if (toLoc.toLowerCase() === fromLoc.toLowerCase()) continue;
      const newSegments = [toLoc, ...segments.slice(1)];
      urls.push(buildDest(parsed, org, langRepoForKey(toLoc), newSegments, useBranch, tier, target, daView));
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
    openAllDisabled: countOtherLocales() === 0,
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

    const newSegments = [toLoc, ...segments.slice(1)];
    const dest = buildDest(parsed, org, langRepoForKey(toLoc), newSegments, useBranch, tier, target, daView);
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

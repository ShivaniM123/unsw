/* eslint-disable import/no-unresolved, max-len, operator-linebreak, object-curly-newline */
/* eslint-disable no-restricted-syntax, no-continue, prefer-destructuring, no-console */
import DA_SDK from 'https://da.live/nx/utils/sdk.js';
import {
  parseCurrentPage,
  buildAemPreviewUrl,
  buildDaHashUrl,
  pathnameToSegments,
  contextToDaUrl,
} from './locale-url-helper.js';
import {
  fetchLanguageSwitcherRows,
  resolvePathWithRows,
  pathAfterLocale,
  DEFAULT_SHEET,
  detectLocaleColumnKeys,
} from './placeholders.js';
import {
  loadTranslateSwitchConfig,
  findLocaleSegmentIndex as findTranslateSegmentIndex,
  siteForTargetKey,
} from './translate-v2.js';

const PRIMARY_LABEL_WITH_PICKER = 'Open page for selected language';
let resolvedDaPageUrl = '';

const SETTINGS = {
  tier: 'page',
  branch: 'main',
  target: 'da-edit',
  daView: 'edit',
  placeholderSheetName: DEFAULT_SHEET,
  placeholderCacheTtlMs: 300000,
  translateCacheTtlMs: 300000,
};

const DA_VIEWS = new Set(['edit', 'sheet', 'browse', 'config', 'media']);

function pickDaView(context) {
  const v = context?.view;
  if (typeof v !== 'string') return SETTINGS.daView;
  const head = v.replace(/^\//, '').split('/')[0];
  return DA_VIEWS.has(head) ? head : SETTINGS.daView;
}

function getUi() {
  return {
    statusEl: document.getElementById('status'),
    previewEl: document.getElementById('preview'),
    previewBlock: document.getElementById('previewBlock'),
    sourceBlock: document.getElementById('sourceBlock'),
    sourceEl: document.getElementById('da-source-url-field'),
    actionsEl: document.getElementById('actions'),
    langRow: document.getElementById('langRow'),
    langCombobox: document.getElementById('langCombobox'),
    langTrigger: document.getElementById('langSelectTrigger'),
    langMenu: document.getElementById('langSelectMenu'),
    langValue: document.getElementById('langSelectValue'),
    openBtn: document.getElementById('open'),
    openAllBtn: document.getElementById('openAll'),
  };
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry?.expires > Date.now() && Array.isArray(entry.rows)) return entry.rows;
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(key, rows, ttlMs) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ rows, expires: Date.now() + ttlMs }));
  } catch {
    /* sessionStorage unavailable */
  }
}

function displayUrl(u) {
  if (u == null || u === '') return '';
  if (typeof u === 'string') return u.trim();
  if (typeof u === 'object' && typeof u.href === 'string') return u.href.trim();
  return String(u).trim();
}

function openUrlsInNewTabs(urls) {
  urls.filter(Boolean).forEach((href) => {
    window.open(typeof href === 'string' ? href : String(href), '_blank', 'noopener,noreferrer');
  });
}

function scheduleCloseLibrary(actions) {
  if (typeof actions?.closeLibrary === 'function') window.setTimeout(() => actions.closeLibrary(), 300);
}

function setUi(ui, status, previewUrl, canOpen, actions, opts = {}) {
  const showLangRow = opts.showLangRow === true;
  const showOpenAll = opts.showOpenAll === true;
  const sourceUrlText = displayUrl(opts.sourceUrl) || displayUrl(resolvedDaPageUrl);

  ui.statusEl.textContent = status;
  ui.statusEl.hidden = !String(status || '').trim() && Boolean(previewUrl);
  ui.langRow.hidden = !showLangRow;

  if (sourceUrlText) {
    ui.sourceBlock.hidden = false;
    ui.sourceEl.textContent = sourceUrlText;
  } else {
    ui.sourceBlock.hidden = true;
    ui.sourceEl.textContent = '';
  }

  if (previewUrl) {
    ui.previewBlock.hidden = false;
    ui.previewEl.textContent = previewUrl;
  } else {
    ui.previewBlock.hidden = true;
    ui.previewEl.textContent = '';
  }

  ui.actionsEl.hidden = !(canOpen || showOpenAll);
  ui.openBtn.hidden = !canOpen;
  ui.openBtn.disabled = !canOpen || opts.openDisabled === true;
  ui.openBtn.textContent =
    typeof opts.openPrimaryLabel === 'string' && opts.openPrimaryLabel.trim()
      ? opts.openPrimaryLabel.trim()
      : PRIMARY_LABEL_WITH_PICKER;
  ui.openBtn.onclick = () => {
    if (!previewUrl) return;
    openUrlsInNewTabs([previewUrl]);
    scheduleCloseLibrary(actions);
  };

  ui.openAllBtn.hidden = !showOpenAll;
  ui.openAllBtn.disabled = false;
  ui.openAllBtn.onclick =
    showOpenAll && typeof opts.openAllClick === 'function' ? opts.openAllClick : null;
}

function setPanelTwoLanguagesMode(isTwo) {
  document.querySelector('.ls-panel')?.classList.toggle('ls-panel-two-languages', Boolean(isTwo));
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
  const cacheKey = `ph:${org}:${repo}:${branch}:${tier}:${sheetName}:${cachePathKey(sitePath)}`;
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

function buildDest(parsed, org, repo, newSegments, useBranch, tier, target, daView) {
  if (parsed.kind === 'da' || target === 'da-edit') {
    const view = parsed.kind === 'da' ? parsed.view : daView;
    return buildDaHashUrl(view, org, repo, newSegments);
  }
  return buildAemPreviewUrl(useBranch, org, repo, newSegments, tier);
}

function resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc) {
  const fromSheet = resolvePathWithRows(rows, fromLoc, toLoc, afterLoc);
  if (fromSheet) return fromSheet;
  let rest = '';
  if (typeof afterLoc === 'string' && afterLoc.length > 0) {
    rest = afterLoc.startsWith('/') ? afterLoc : `/${afterLoc.replace(/^\//, '')}`;
  }
  return `/${toLoc}${rest}`;
}

function resolveSitePath(contextPath, org, repo, segments) {
  let p = typeof contextPath === 'string' ? contextPath.trim() : '';
  const prefix = `/${org}/${repo}`;
  if (p === prefix || p.startsWith(`${prefix}/`)) {
    p = p.slice(prefix.length);
    if (p && !p.startsWith('/')) p = `/${p}`;
  }
  if (!p && segments.length) p = `/${segments.join('/')}`;
  if (p && !p.startsWith('/')) p = `/${p}`;
  return p;
}

function mergeResolvedSegments(locIndex, segments, resolvedPath) {
  return [...segments.slice(0, locIndex), ...pathnameToSegments(resolvedPath)];
}

let langComboboxOutsideCloseWired = false;
let langMenuResizeListener = null;
let langMenuCloseTimer = null;

/** Must match `.lang-select-menu` transition duration (close cleanup runs after paint). */
const LANG_MENU_TRANSITION_MS = 200;

function initLangCombobox(ui, keys, currentKey, onPickLocale) {
  const others = keys.filter((k) => k.toLowerCase() !== currentKey.toLowerCase());
  const first = others[0];
  if (!first) return;

  if (!ui.langCombobox || !ui.langTrigger || !ui.langMenu) {
    onPickLocale(first);
    return;
  }

  const finishClose = () => {
    langMenuCloseTimer = null;
    ui.langMenu.style.cssText = '';
    if (ui.langMenu.parentNode === document.body) {
      ui.langCombobox.appendChild(ui.langMenu);
    }
    ui.langMenu.setAttribute('aria-hidden', 'true');
  };

  const closeMenu = () => {
    if (langMenuResizeListener) {
      window.removeEventListener('resize', langMenuResizeListener);
      langMenuResizeListener = null;
    }
    ui.langTrigger.setAttribute('aria-expanded', 'false');
    const wasOpen = ui.langMenu.classList.contains('lang-select-menu-open');
    ui.langMenu.classList.remove('lang-select-menu-open');
    clearTimeout(langMenuCloseTimer);
    langMenuCloseTimer = null;
    if (!wasOpen) {
      finishClose();
      return;
    }
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 0
      : LANG_MENU_TRANSITION_MS;
    langMenuCloseTimer = setTimeout(finishClose, delay);
  };

  const placeMenuBelowTrigger = () => {
    const r = ui.langTrigger.getBoundingClientRect();
    const gap = 4;
    const spaceBelow = window.innerHeight - r.bottom - gap - 8;
    const maxH = Math.max(100, spaceBelow);
    const s = ui.langMenu.style;
    s.position = 'fixed';
    s.left = `${r.left}px`;
    s.width = `${r.width}px`;
    s.top = `${r.bottom + gap}px`;
    s.bottom = 'auto';
    s.right = 'auto';
    s.marginTop = '0';
    s.marginBottom = '0';
    s.maxHeight = `${maxH}px`;
    s.zIndex = '2147483647';
  };

  const openMenu = () => {
    clearTimeout(langMenuCloseTimer);
    langMenuCloseTimer = null;
    ui.langTrigger.setAttribute('aria-expanded', 'true');
    ui.langMenu.setAttribute('aria-hidden', 'false');
    ui.langMenu.scrollTop = 0;
    ui.langMenu.classList.remove('lang-select-menu-open');
    if (ui.langMenu.parentNode !== document.body) {
      document.body.appendChild(ui.langMenu);
    }
    const afterPlace = () => {
      placeMenuBelowTrigger();
      requestAnimationFrame(() => {
        ui.langMenu.classList.add('lang-select-menu-open');
      });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(afterPlace);
    });
    if (langMenuResizeListener) window.removeEventListener('resize', langMenuResizeListener);
    langMenuResizeListener = placeMenuBelowTrigger;
    window.addEventListener('resize', placeMenuBelowTrigger, { passive: true });
  };

  const setTriggerLabel = (loc) => {
    if (ui.langValue) ui.langValue.textContent = loc;
  };

  ui.langMenu.replaceChildren();
  others.forEach((k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-select-option';
    b.setAttribute('role', 'option');
    b.textContent = k;
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeMenu();
      setTriggerLabel(k);
      onPickLocale(k);
    });
    ui.langMenu.appendChild(b);
  });

  const onDocPointerDown = (e) => {
    if (ui.langTrigger.getAttribute('aria-expanded') !== 'true') return;
    const t = e.target;
    if (ui.langCombobox.contains(t) || ui.langMenu.contains(t)) return;
    closeMenu();
  };

  ui.langTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ui.langTrigger.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  if (!langComboboxOutsideCloseWired) {
    document.addEventListener('pointerdown', onDocPointerDown, true);
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return;
        if (ui.langTrigger.getAttribute('aria-expanded') === 'true') closeMenu();
      },
      true,
    );
    langComboboxOutsideCloseWired = true;
  }

  setTriggerLabel(first);
  onPickLocale(first);
}

/**
 * Shared UI once langKeys and urlForLocale are defined.
 */
function runLanguageSwitcher(ui, actions, show, langKeys, fromLoc, urlForLocale, configLabel) {
  setPanelTwoLanguagesMode(langKeys.length === 2);
  const showLangPicker = langKeys.length >= 3;

  if (langKeys.length === 1) {
    ui.langRow.hidden = true;
    const [only] = langKeys;
    if (fromLoc && fromLoc.toLowerCase() === only.toLowerCase()) {
      show(
        `Already on ${only}. Add another language in ${configLabel}, or open a page in a different locale folder.`,
        null,
        false,
      );
      return;
    }
    show('', urlForLocale(only), true, {
      showLangRow: false,
      openPrimaryLabel: `Open page in ${only}`,
    });
    return;
  }

  if (!fromLoc) {
    show(
      `This page’s locale folder does not match any language defined in ${configLabel} (${langKeys.join(', ')}).`,
      null,
      false,
    );
    return;
  }

  const openAllOpts = () => ({
    showOpenAll: langKeys.length > 2,
    openAllClick: () => {
      const urls = langKeys
        .filter((to) => to.toLowerCase() !== fromLoc.toLowerCase())
        .map(urlForLocale);
      openUrlsInNewTabs(urls);
      if (urls.length) scheduleCloseLibrary(actions);
    },
  });

  const applyDestination = (toLoc) => {
    if (toLoc.toLowerCase() === fromLoc.toLowerCase()) {
      show('Choose a language different from the current page.', null, true, {
        showLangRow: showLangPicker,
        openDisabled: true,
        openPrimaryLabel: PRIMARY_LABEL_WITH_PICKER,
        ...openAllOpts(),
      });
      return;
    }
    show('', urlForLocale(toLoc), true, {
      showLangRow: showLangPicker,
      openPrimaryLabel: showLangPicker
        ? PRIMARY_LABEL_WITH_PICKER
        : `Open page in ${toLoc}`,
      ...openAllOpts(),
    });
  };

  if (showLangPicker) {
    initLangCombobox(ui, langKeys, fromLoc, applyDestination);
  } else {
    applyDestination(langKeys.find((k) => k.toLowerCase() !== fromLoc.toLowerCase()));
  }
}

async function main() {
  const { context, actions, token } = await DA_SDK;
  const ui = getUi();
  setPanelTwoLanguagesMode(false);

  const pageUrl = contextToDaUrl({
    org: context.org,
    repo: context.repo || context.site,
    path: context.path,
    view: pickDaView(context),
  });

  if (!pageUrl) {
    resolvedDaPageUrl = '';
    setUi(
      ui,
      'Missing page context (org, repo, path). Open this tool from the Library while a document page is open.',
      null,
      false,
      actions,
    );
    return;
  }

  resolvedDaPageUrl = pageUrl.href;
  const uiSrc = { sourceUrl: pageUrl.href };
  const show = (status, previewUrl, canOpen, extra = {}) => setUi(
    ui,
    status,
    previewUrl,
    canOpen,
    actions,
    { ...uiSrc, ...extra },
  );

  show('Loading language configuration…', null, false, { showLangRow: false });

  const parsed = parseCurrentPage(pageUrl);
  if (!parsed) {
    show('Could not parse this page (need /org/repo/locale/… in context.path).', null, false);
    return;
  }

  const {
    tier,
    branch,
    target,
    daView,
    placeholderSheetName,
    placeholderCacheTtlMs,
    translateCacheTtlMs,
  } = SETTINGS;
  const { org, repo } = parsed;
  const segments = [...parsed.segments];

  if (!segments.length) {
    show('Path must include a locale folder after org/repo.', null, false);
    return;
  }

  const useBranch = parsed.kind === 'aem' ? parsed.branch : branch;

  const translateConfig = await loadTranslateSwitchConfig(org, repo, actions, {
    ttlMs: Number(translateCacheTtlMs) || 300000,
    token,
  });

  if (translateConfig?.keys?.length) {
    const { targets, keys: langKeys } = translateConfig;
    const locIndex = findTranslateSegmentIndex(segments, langKeys);
    if (locIndex < 0) {
      show(
        `No folder in this path matches translate-v2 languages (${langKeys.join(', ')}).`,
        null,
        false,
      );
      return;
    }

    const urlSeg = segments[locIndex];
    const fromLoc = canonLocale(urlSeg, langKeys);

    const urlForLocale = (toLoc) => {
      const newSegments = [...segments.slice(0, locIndex), toLoc, ...segments.slice(locIndex + 1)];
      const destRepo = siteForTargetKey(targets, toLoc, repo);
      return buildDest(parsed, org, destRepo, newSegments, useBranch, tier, target, daView);
    };

    runLanguageSwitcher(ui, actions, show, langKeys, fromLoc, urlForLocale, '/.da/translate-v2.json');
    return;
  }

  const translateError = translateConfig?.error;
  const sitePath = resolveSitePath(context.path, org, repo, segments);

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
    const translatePart = translateError ? `${translateError}. ` : '';
    show(
      `${translatePart}Could not load placeholders.json (${e.message}).`,
      null,
      false,
    );
    return;
  }

  const langKeys = detectLocaleColumnKeys(rows);
  if (!langKeys.length) {
    show(
      'No languages found in translate-v2.json or placeholders language-switcher sheet.',
      null,
      false,
    );
    return;
  }

  const locIndex = findTranslateSegmentIndex(segments, langKeys);
  if (locIndex < 0) {
    show(`No folder in this path matches a language column (${langKeys.join(', ')}).`, null, false);
    return;
  }

  const urlSeg = segments[locIndex];
  const afterLoc = pathAfterLocale(segments.slice(locIndex));
  const fromLoc = canonLocale(urlSeg, langKeys);

  const pathCache = new Map();
  const getResolvedPath = (toLoc) => {
    const k = toLoc.toLowerCase();
    if (!pathCache.has(k)) pathCache.set(k, resolvePathWithFallback(rows, fromLoc, toLoc, afterLoc));
    return pathCache.get(k);
  };

  const urlForLocale = (toLoc) => buildDest(
    parsed,
    org,
    repo,
    mergeResolvedSegments(locIndex, segments, getResolvedPath(toLoc)),
    useBranch,
    tier,
    target,
    daView,
  );

  runLanguageSwitcher(ui, actions, show, langKeys, fromLoc, urlForLocale, 'placeholders.json');
}

main().catch((err) => {
  console.error(err);
  const el = document.getElementById('status');
  if (el) {
    el.textContent = `Error: ${err.message || String(err)}`;
    el.hidden = false;
  }
});

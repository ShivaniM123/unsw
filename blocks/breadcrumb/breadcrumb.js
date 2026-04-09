function formatSegment(segment) {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function addSeparator(li) {
  const sep = document.createElement('span');
  sep.className = 'breadcrumb-sep';
  sep.setAttribute('aria-hidden', 'true');
  sep.innerHTML = '<svg width="8" height="12" viewBox="0 0 8 12"><path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>';
  li.append(sep);
}

/**
 * Builds breadcrumb navigation from the current page URL path.
 * Generates: UNSW > Staff > Page Title
 * @param {Element} block The breadcrumb block element
 */
export default async function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'breadcrumb-nav';

  const ol = document.createElement('ol');

  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);

  // Remove 'content' prefix if present (local dev)
  if (segments[0] === 'content') segments.shift();

  // Home crumb
  const homeLi = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.textContent = 'UNSW';
  homeLi.append(homeLink);
  addSeparator(homeLi);
  ol.append(homeLi);

  // Middle crumbs from path segments (all except last)
  for (let i = 0; i < segments.length - 1; i += 1) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/${segments.slice(0, i + 1).join('/')}`;
    a.textContent = formatSegment(segments[i]);
    li.append(a);
    addSeparator(li);
    ol.append(li);
  }

  // Last crumb (current page - no link)
  if (segments.length > 0) {
    const lastLi = document.createElement('li');
    lastLi.setAttribute('aria-current', 'page');
    const pageTitle = document.querySelector('h1')?.textContent?.trim()
      || formatSegment(segments[segments.length - 1]);
    lastLi.textContent = pageTitle;
    ol.append(lastLi);
  }

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Makes the main nav row sticky when scrolled past the utility bar.
 * On desktop: utility bar scrolls away, main nav sticks to top.
 * @param {Element} navWrapper The nav wrapper element
 */
function initStickyHeader(navWrapper) {
  const nav = navWrapper.querySelector('nav');
  let spacer = null;

  const handleScroll = () => {
    if (!isDesktop.matches) {
      navWrapper.classList.remove('nav-sticky');
      if (spacer) spacer.style.display = 'none';
      return;
    }

    const toolsBar = nav.querySelector('.nav-tools');
    const toolsHeight = toolsBar ? toolsBar.offsetHeight : 49;

    if (window.scrollY > toolsHeight) {
      if (!navWrapper.classList.contains('nav-sticky')) {
        // Create spacer to prevent content jump
        if (!spacer) {
          spacer = document.createElement('div');
          spacer.className = 'nav-sticky-spacer';
          navWrapper.parentElement.insertBefore(spacer, navWrapper);
        }
        spacer.style.height = `${navWrapper.offsetHeight}px`;
        spacer.style.display = 'block';
        navWrapper.classList.add('nav-sticky');
      }
    } else {
      navWrapper.classList.remove('nav-sticky');
      if (spacer) spacer.style.display = 'none';
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  isDesktop.addEventListener('change', handleScroll);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/header';
  let fragment = await loadFragment(navPath);

  // Fallback for local dev where content is under /content/
  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment('/content/header');
  }

  if (!fragment) return;

  // Build nav off-DOM to minimize CLS
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Classify the 3 sections: brand, sections, tools
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // --- Brand section ---
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const logoImg = navBrand.querySelector('img');
    const firstLink = navBrand.querySelector('a');
    const href = firstLink ? firstLink.href : '/';

    const wrapper = navBrand.querySelector('.default-content-wrapper');
    if (wrapper) wrapper.innerHTML = '';

    const logoLink = document.createElement('a');
    logoLink.href = href;
    logoLink.className = 'nav-logo-link';
    logoLink.setAttribute('aria-label', 'UNSW Sydney homepage');

    if (logoImg) {
      logoImg.classList.add('nav-logo');
      logoImg.width = 151;
      logoImg.height = 64;
      logoImg.loading = 'eager';
      logoLink.append(logoImg);
    }

    if (wrapper) {
      wrapper.append(logoLink);
    } else {
      navBrand.innerHTML = '';
      navBrand.append(logoLink);
    }
  }

  // --- Sections (main nav links) ---
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });
  }

  // --- Tools (utility bar) ---
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    navTools.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });
    navTools.querySelectorAll('a').forEach((a) => {
      const text = a.textContent.trim();

      if (text.toLowerCase() === 'contact us') {
        const icon = document.createElement('span');
        icon.className = 'envelope-icon';
        icon.innerHTML = '<img src="/icons/envelope.svg" alt="" width="16" height="12">';
        a.prepend(icon);
      } else {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        const icon = document.createElement('span');
        icon.className = 'external-icon';
        icon.innerHTML = '<img src="/icons/external-link.svg" alt="opens in a new tab" width="10" height="10">';
        a.append(icon);
      }
    });
  }

  // --- Search button ---
  const searchBtn = document.createElement('div');
  searchBtn.className = 'nav-search';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.setAttribute('aria-label', 'Search');
  searchButton.innerHTML = '<span class="icon icon-search"><img src="/icons/search.svg" alt="" loading="eager"></span>';
  searchBtn.append(searchButton);

  // --- Hamburger for mobile ---
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  // Assemble nav
  nav.prepend(hamburger);
  nav.append(searchBtn);
  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) {
      toggleMenu(nav, false);
      nav.querySelector('.nav-hamburger button')?.focus();
    }
  });

  // Atomic DOM swap
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.textContent = '';
  block.append(navWrapper);

  // Initialize sticky header behavior
  initStickyHeader(navWrapper);
}

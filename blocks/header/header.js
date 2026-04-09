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

    // Rebuild brand as a clean logo link
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
    // Remove button classes from section links
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });
  }

  // --- Tools (utility bar) ---
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    // Remove button classes from tool links
    navTools.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });
    // Mark external links
    navTools.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('http') && !href.includes('unsw.edu.au/about-us')) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
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

  // Always start collapsed - CSS handles desktop visibility
  nav.setAttribute('aria-expanded', 'false');

  // On resize, close mobile menu if switching to desktop
  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
    }
  });

  // Close on escape
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
}

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/*
 * ===== DROPDOWN MENU DATA =====
 * Edit the sections below to update dropdown content.
 * Each nav item can have columns and optional CTA buttons.
 *
 * Column format: { title: 'Heading', items: [['Link text', '/path'], ...] }
 * CTA format: ['Button text', '/path', 'primary' or 'secondary']
 */
const NAV_DROPDOWNS = {
  Study: {
    columns: [
      { title: 'Study options', items: [['Explore degrees', '/study/find-a-degree-or-course'], ['Help me choose', '/study/find-the-right-course-or-degree-quiz'], ['Professional development', '/study/professional-development'], ['Online', '/study/professional-development/online-postgraduate-programs']] },
      { title: 'Discover UNSW', items: [['Undergraduate study', '/study/undergraduate'], ['Postgraduate study', '/study/postgraduate'], ['International students', '/study/international-students'], ['Higher Degree Research', '/research/hdr'], ['Our campus', '/study/discover/campus']] },
      { title: 'How to apply', items: [['Domestic undergraduate', '/study/how-to-apply/undergraduate'], ['Domestic postgraduate', '/study/how-to-apply/postgraduate'], ['International', '/study/how-to-apply/international'], ['Fees', '/study/how-to-apply/fees'], ['Scholarships', '/study/how-to-apply/scholarships']] },
      { title: 'Help centre', items: [['Ask a question', '/study/help/contact-us'], ['Received an offer?', '/study/help/offer'], ['Information for parents', '/study/help/parents'], ['Information for educators', '/study/help/educators']] },
    ],
    ctas: [['Apply now', '/study/how-to-apply', 'primary'], ['Connect with us', '/study/connect-with-us', 'secondary']],
  },
  Research: {
    columns: [
      { title: 'Research strengths', items: [['Clean energy', '/research/research-strengths/clean-energy'], ['Technology for good', '/research/research-strengths/tech-for-good'], ['Healthier lifespans', '/research/research-strengths/healthier-lifespans']] },
      { title: 'Partner with us', items: [['Research & development', '/research/partner-with-us/research-and-development'], ['Grant funding', '/research/partner-with-us/grant-funding'], ['Case studies', '/research/partner-with-us/case-studies']] },
      { title: 'Facilities & infrastructure', items: [['Find a facility', '/research/facilities-and-infrastructure/find-a-facility'], ['Find an instrument', '/research/facilities-and-infrastructure/find-an-instrument']] },
      { title: 'Higher degree research', items: [['Find a supervisor', '/research/hdr/find-a-supervisor'], ['Scholarships', '/research/hdr/scholarships'], ['Application process', '/research/hdr/application']] },
    ],
    ctas: [['Partner with us', '/research/partner-with-us', 'primary'], ['Find a supervisor', '/research/hdr/find-a-supervisor', 'secondary']],
  },
  Faculties: {
    columns: [
      { title: 'Our faculties', items: [['Arts, Design & Architecture', '/arts-design-architecture'], ['Business School', '/business'], ['Engineering', '/engineering'], ['Law & Justice', '/law-justice'], ['Medicine & Health', '/medicine-health'], ['Science', '/science'], ['UNSW Canberra', '/canberra']] },
    ],
  },
  'Engage with us': {
    columns: [
      { title: 'Engage with UNSW', items: [['Social media', '/about-us/social-media'], ['Community outreach', '/about-us/collaboration/community'], ['Global engagement', '/about-us/global-engagement']] },
      { title: 'Giving', items: [['Overview', '/giving'], ['Why give to UNSW', '/giving/why-give-to-unsw'], ['Areas to support', '/giving/areas-to-support']] },
      { title: 'Alumni', items: [['Overview', '/alumni'], ['Alumni essentials', '/alumni/alumni-essentials'], ['Get involved', '/alumni/get-involved']] },
      { title: 'Industry partnerships', items: [['Partner with us', '/research/partner-with-us'], ['Funding opportunities', '/research/partner-with-us/grant-funding']] },
    ],
  },
  'About us': {
    columns: [
      { title: 'Our story', items: [['Leadership & governance', '/about-us/our-story/governance-leadership'], ['Our strategy', '/strategy'], ['Our culture', '/about-us/respect-diversity/our-culture']] },
      { title: 'Our impact', items: [['Societal impact', '/about-us/innovation-impact/social-impact'], ['Innovation', '/about-us/innovation-impact/innovation-discoveries'], ['Enterprise', '/about-us/innovation-impact/enterprise-commercialisation']] },
      { title: 'Collaboration', items: [['Community', '/about-us/collaboration/community'], ['Industry', '/about-us/collaboration/industry']] },
      { title: 'Excellence', items: [['Education', '/about-us/excellence/education'], ['Research', '/about-us/excellence/research'], ['Rankings & reputation', '/about-us/excellence/rankings-reputation']] },
    ],
  },
};

function buildDropdownPanel(data) {
  const panel = document.createElement('div');
  panel.className = 'nav-dropdown-panel';

  const colsWrap = document.createElement('div');
  colsWrap.className = 'nav-dropdown-cols';
  data.columns.forEach((col) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'nav-dropdown-col';
    const heading = document.createElement('strong');
    heading.textContent = col.title;
    colDiv.append(heading);
    const ul = document.createElement('ul');
    col.items.forEach(([text, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      li.append(a);
      ul.append(li);
    });
    colDiv.append(ul);
    colsWrap.append(colDiv);
  });
  panel.append(colsWrap);

  if (data.ctas && data.ctas.length > 0) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'nav-dropdown-ctas';
    data.ctas.forEach(([text, href, variant]) => {
      const a = document.createElement('a');
      a.href = href;
      a.className = `nav-cta nav-cta-${variant}`;
      a.innerHTML = `<span>${text}</span><span class="nav-cta-arrow">\u203A</span>`;
      ctaWrap.append(a);
    });
    panel.append(ctaWrap);
  }

  return panel;
}

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

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

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/header';
  let fragment = await loadFragment(navPath);

  if (!fragment || !fragment.firstElementChild) {
    fragment = await loadFragment('/content/header');
  }
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // --- Brand ---
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
    if (wrapper) wrapper.append(logoLink);
    else { navBrand.innerHTML = ''; navBrand.append(logoLink); }
  }

  // --- Sections with dropdowns ---
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll('.button').forEach((btn) => {
      btn.className = '';
      const bc = btn.closest('.button-container');
      if (bc) bc.className = '';
    });

    const topItems = navSections.querySelectorAll('.default-content-wrapper > ul > li');
    topItems.forEach((li) => {
      const link = li.querySelector(':scope > a');
      const linkText = link?.textContent?.trim();
      const dropdownData = NAV_DROPDOWNS[linkText];

      if (dropdownData) {
        li.classList.add('nav-drop');
        li.setAttribute('aria-expanded', 'false');
        const panel = buildDropdownPanel(dropdownData);
        li.append(panel);

        li.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            topItems.forEach((item) => item.setAttribute('aria-expanded', 'false'));
            li.setAttribute('aria-expanded', 'true');
          }
        });
        li.addEventListener('mouseleave', () => {
          if (isDesktop.matches) li.setAttribute('aria-expanded', 'false');
        });

        if (link) {
          link.addEventListener('click', (e) => {
            if (!isDesktop.matches) {
              e.preventDefault();
              const expanded = li.getAttribute('aria-expanded') === 'true';
              topItems.forEach((item) => item.setAttribute('aria-expanded', 'false'));
              li.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            }
          });
        }
      }
    });
  }

  // --- Tools ---
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

  // --- Search button + overlay ---
  const searchBtn = document.createElement('div');
  searchBtn.className = 'nav-search';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.setAttribute('aria-label', 'Search');
  searchButton.innerHTML = '<span class="icon icon-search"><img src="/icons/search.svg" alt="" loading="eager"></span>';
  searchBtn.append(searchButton);

  const searchOverlay = document.createElement('div');
  searchOverlay.className = 'nav-search-overlay';
  searchOverlay.setAttribute('role', 'search');
  searchOverlay.innerHTML = `
    <div class="nav-search-bar">
      <form class="nav-search-form" action="https://www.unsw.edu.au/search" method="get">
        <input type="text" name="q" placeholder="Type in a search term" class="nav-search-input" aria-label="Type in a search term">
      </form>
      <button type="button" class="nav-search-close" aria-label="Close search">
        <svg viewBox="0 0 24 24" fill="none"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
      </button>
    </div>
  `;
  searchOverlay.style.display = 'none';

  searchButton.addEventListener('click', () => {
    searchOverlay.style.display = 'flex';
    searchOverlay.querySelector('.nav-search-input')?.focus();
  });
  searchOverlay.querySelector('.nav-search-close')?.addEventListener('click', () => {
    searchOverlay.style.display = 'none';
  });
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) searchOverlay.style.display = 'none';
  });

  // --- Hamburger ---
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  nav.prepend(hamburger);
  nav.append(searchBtn);
  nav.append(searchOverlay);
  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => {
    if (isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (searchOverlay.style.display !== 'none') {
        searchOverlay.style.display = 'none';
      } else if (nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) {
        toggleMenu(nav, false);
        nav.querySelector('.nav-hamburger button')?.focus();
      }
    }
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.textContent = '';
  block.append(navWrapper);

  initStickyHeader(navWrapper);
}

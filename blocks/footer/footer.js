import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Builds the branding section with logo and site URL.
 * @param {Element} brandingDiv The source div containing logo and URL
 * @returns {Element} The decorated branding section
 */
function buildBranding(brandingDiv) {
  const section = document.createElement('div');
  section.className = 'footer-branding';

  const link = brandingDiv.querySelector('a');
  const img = brandingDiv.querySelector('img');

  if (link && img) {
    const brandLink = document.createElement('a');
    brandLink.href = link.href;
    brandLink.setAttribute('aria-label', 'UNSW Sydney');

    const logo = document.createElement('img');
    logo.src = img.src;
    logo.alt = img.alt || 'UNSW Sydney';
    logo.className = 'footer-logo';
    logo.loading = 'lazy';
    brandLink.append(logo);

    const urlSpan = document.createElement('span');
    urlSpan.className = 'footer-url';
    urlSpan.textContent = 'UNSW.edu.au';
    brandLink.append(urlSpan);

    section.append(brandLink);
  }

  return section;
}

/**
 * Builds the navigation columns from headings and lists.
 * @param {Element} navDiv The source div containing nav headings and lists
 * @returns {Element} The decorated nav section
 */
function buildNav(navDiv) {
  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer');

  const headings = navDiv.querySelectorAll('h2');
  headings.forEach((heading, index) => {
    const container = document.createElement('div');
    container.className = 'footer-nav-column';

    const h2 = document.createElement('h2');
    h2.className = 'footer-nav-heading';
    h2.textContent = heading.textContent;
    h2.setAttribute('role', 'button');
    h2.setAttribute('aria-expanded', 'false');
    h2.setAttribute('aria-controls', `footer-nav-${index + 1}`);
    h2.tabIndex = 0;
    container.append(h2);

    // Find the UL that follows this heading
    let nextEl = heading.nextElementSibling;
    while (nextEl && nextEl.tagName !== 'UL' && nextEl.tagName !== 'H2') {
      nextEl = nextEl.nextElementSibling;
    }
    if (nextEl && nextEl.tagName === 'UL') {
      const ul = nextEl.cloneNode(true);
      ul.id = `footer-nav-${index + 1}`;
      ul.className = 'footer-nav-list';
      container.append(ul);
    }

    nav.append(container);
  });

  return nav;
}

/**
 * Builds the organization details section.
 * @param {Element} orgDiv The source div containing org details
 * @returns {Element} The decorated org details section
 */
function buildOrgDetails(orgDiv) {
  const section = document.createElement('div');
  section.className = 'footer-org-details';

  const paragraphs = orgDiv.querySelectorAll('p');
  if (paragraphs.length >= 1) {
    const address = document.createElement('div');
    address.className = 'footer-address';
    address.innerHTML = paragraphs[0].innerHTML;
    section.append(address);
  }
  if (paragraphs.length >= 2) {
    const provider = document.createElement('div');
    provider.className = 'footer-provider';
    provider.innerHTML = paragraphs[1].innerHTML;
    section.append(provider);
  }

  return section;
}

/**
 * Builds the partners logo section.
 * @param {Element} partnersDiv The source div containing partner logos
 * @returns {Element} The decorated partners section
 */
function buildPartners(partnersDiv) {
  const section = document.createElement('div');
  section.className = 'footer-partners';

  const links = partnersDiv.querySelectorAll('a');
  links.forEach((link) => {
    const img = link.querySelector('img');
    if (img) {
      const a = document.createElement('a');
      a.href = link.href;
      a.target = '_self';
      a.rel = 'noopener noreferrer';

      const partnerImg = document.createElement('img');
      partnerImg.src = img.src;
      partnerImg.alt = img.alt;
      partnerImg.loading = 'lazy';
      a.append(partnerImg);

      section.append(a);
    }
  });

  return section;
}

/**
 * Builds the Acknowledgement of Country section.
 * @param {Element} ackDiv The source div containing acknowledgement content
 * @returns {Element} The decorated acknowledgement section
 */
function buildAcknowledgement(ackDiv) {
  const section = document.createElement('div');
  section.className = 'footer-acknowledgement';

  const flags = document.createElement('div');
  flags.className = 'footer-flags';
  const flagImgs = ackDiv.querySelectorAll('img');
  flagImgs.forEach((img) => {
    const flagImg = document.createElement('img');
    flagImg.src = img.src;
    flagImg.alt = img.alt;
    flagImg.loading = 'lazy';
    flags.append(flagImg);
  });
  section.append(flags);

  const text = document.createElement('div');
  text.className = 'footer-ack-text';

  const heading = ackDiv.querySelector('h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent;
    text.append(h2);
  }

  const paragraphs = ackDiv.querySelectorAll('p');
  paragraphs.forEach((p) => {
    // Skip paragraphs that only contain images
    if (p.querySelector('picture') && !p.textContent.trim()) return;
    const newP = document.createElement('p');
    newP.innerHTML = p.innerHTML;
    text.append(newP);
  });

  section.append(text);
  return section;
}

/**
 * Builds the social links and legal section.
 * @param {Element} socialDiv The source div containing social and legal links
 * @returns {Element} The decorated social/legal section
 */
function buildSocialLegal(socialDiv) {
  const section = document.createElement('div');
  section.className = 'footer-social-legal';

  const lists = socialDiv.querySelectorAll('ul');

  // Social links (first UL)
  if (lists.length >= 1) {
    const socialContainer = document.createElement('div');
    socialContainer.className = 'footer-social';

    const heading = socialDiv.querySelector('h2');
    if (heading) {
      const label = document.createElement('span');
      label.className = 'footer-social-label';
      label.textContent = heading.textContent;
      socialContainer.append(label);
    }

    const socialList = document.createElement('ul');
    socialList.className = 'footer-social-list';
    lists[0].querySelectorAll('li').forEach((li) => {
      const newLi = document.createElement('li');
      const a = li.querySelector('a');
      if (a) {
        const newA = document.createElement('a');
        newA.href = a.href;
        newA.target = '_blank';
        newA.rel = 'nofollow';

        let icon = a.querySelector('.icon');
        const linkText = a.textContent.trim();

        // If no icon span exists (AEM strips them), create one from link text
        if (!icon) {
          const iconName = linkText.toLowerCase().replace(/\s+/g, '-');
          icon = document.createElement('span');
          icon.className = `icon icon-${iconName}`;
        } else {
          icon = icon.cloneNode(true);
        }
        newA.append(icon);

        // Extract platform name for sr-only text
        const srSpan = document.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = `Follow UNSW on ${linkText}`;
        newA.append(srSpan);

        newLi.append(newA);
      }
      socialList.append(newLi);
    });
    socialContainer.append(socialList);
    section.append(socialContainer);
  }

  // Legal links (second UL)
  if (lists.length >= 2) {
    const legalList = document.createElement('ul');
    legalList.className = 'footer-legal';
    lists[1].querySelectorAll('li').forEach((li) => {
      const newLi = document.createElement('li');
      newLi.innerHTML = li.innerHTML;
      legalList.append(newLi);
    });
    section.append(legalList);
  }

  return section;
}

/**
 * Adds accordion toggle behavior for mobile nav columns.
 * @param {Element} footer The footer element
 */
function addMobileToggle(footer) {
  footer.querySelectorAll('.footer-nav-heading').forEach((heading) => {
    const handler = () => {
      const expanded = heading.getAttribute('aria-expanded') === 'true';
      // Close all others
      footer.querySelectorAll('.footer-nav-heading').forEach((h) => {
        h.setAttribute('aria-expanded', 'false');
      });
      if (!expanded) {
        heading.setAttribute('aria-expanded', 'true');
      }
    };
    heading.addEventListener('click', handler);
    heading.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-wrapper';

  // Get all content divs from the fragment
  const divs = [...fragment.querySelectorAll(':scope > div > div')];

  if (divs.length >= 6) {
    // Section 1: Branding + Nav + Org Details (dark section)
    const mainSection = document.createElement('div');
    mainSection.className = 'footer-main';

    const branding = buildBranding(divs[0]);
    const nav = buildNav(divs[1]);
    const orgDetails = buildOrgDetails(divs[2]);

    const mainContent = document.createElement('div');
    mainContent.className = 'footer-main-content';
    mainContent.append(orgDetails);
    mainContent.append(nav);

    mainSection.append(branding);
    mainSection.append(mainContent);
    footer.append(mainSection);

    // Section 2: Partners
    const partners = buildPartners(divs[3]);
    footer.append(partners);

    // Section 3: Bottom yellow section
    const bottomSection = document.createElement('div');
    bottomSection.className = 'footer-bottom';

    const acknowledgement = buildAcknowledgement(divs[4]);
    bottomSection.append(acknowledgement);

    const socialLegal = buildSocialLegal(divs[5]);
    bottomSection.append(socialLegal);

    footer.append(bottomSection);

    // Add mobile toggle behavior
    addMobileToggle(footer);
  }

  block.append(footer);
  await decorateIcons(block);
}

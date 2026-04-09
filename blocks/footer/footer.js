import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function buildBranding(brandingDiv) {
  const section = document.createElement('div');
  section.className = 'footer-branding';

  const link = brandingDiv.querySelector('a');
  const img = brandingDiv.querySelector('img');

  if (link && img) {
    const brandLink = document.createElement('a');
    brandLink.href = link.href;
    brandLink.setAttribute('aria-label', 'UNSW Sydney homepage');

    const logo = document.createElement('img');
    logo.src = img.src;
    logo.alt = img.alt || 'UNSW Sydney';
    logo.className = 'footer-logo';
    logo.loading = 'lazy';
    logo.width = 144;
    logo.height = 61;
    brandLink.append(logo);

    const urlSpan = document.createElement('span');
    urlSpan.className = 'footer-url';
    urlSpan.textContent = 'UNSW.edu.au';
    brandLink.append(urlSpan);

    section.append(brandLink);
  }

  return section;
}

function buildNav(navDiv) {
  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer navigation');

  const headings = navDiv.querySelectorAll('h2');
  headings.forEach((heading, index) => {
    const container = document.createElement('div');
    container.className = 'footer-nav-column';

    const h3 = document.createElement('h3');
    h3.className = 'footer-nav-heading';
    h3.textContent = heading.textContent;
    h3.setAttribute('role', 'button');
    h3.setAttribute('aria-expanded', 'false');
    h3.setAttribute('aria-controls', `footer-nav-${index + 1}`);
    h3.tabIndex = 0;
    container.append(h3);

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

function buildPartners(partnersDiv) {
  const section = document.createElement('div');
  section.className = 'footer-partners';

  const links = partnersDiv.querySelectorAll('a');
  links.forEach((link) => {
    const img = link.querySelector('img');
    if (img) {
      const a = document.createElement('a');
      a.href = link.href;
      a.rel = 'noopener noreferrer';

      const partnerImg = document.createElement('img');
      partnerImg.src = img.src;
      partnerImg.alt = img.alt;
      partnerImg.loading = 'lazy';
      partnerImg.width = img.width || 176;
      partnerImg.height = img.height || 64;
      a.append(partnerImg);

      section.append(a);
    }
  });

  return section;
}

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
    flagImg.width = 108;
    flagImg.height = 72;
    flags.append(flagImg);
  });
  section.append(flags);

  const text = document.createElement('div');
  text.className = 'footer-ack-text';

  const heading = ackDiv.querySelector('h2');
  if (heading) {
    const h3 = document.createElement('h3');
    h3.textContent = heading.textContent;
    text.append(h3);
  }

  const paragraphs = ackDiv.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (p.querySelector('picture') && !p.textContent.trim()) return;
    const newP = document.createElement('p');
    newP.innerHTML = p.innerHTML;
    text.append(newP);
  });

  section.append(text);
  return section;
}

function buildSocialLegal(socialDiv) {
  const section = document.createElement('div');
  section.className = 'footer-social-legal';

  const lists = socialDiv.querySelectorAll('ul');

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
        newA.rel = 'noopener noreferrer';

        let icon = a.querySelector('.icon');
        const linkText = a.textContent.trim();

        if (!icon) {
          const iconName = linkText.toLowerCase().replace(/\s+/g, '-');
          icon = document.createElement('span');
          icon.className = `icon icon-${iconName}`;
        } else {
          icon = icon.cloneNode(true);
        }
        newA.append(icon);

        const srSpan = document.createElement('span');
        srSpan.className = 'sr-only';
        srSpan.textContent = `Follow UNSW on ${linkText}`;
        newA.append(srSpan);

        newA.setAttribute('aria-label', `Follow UNSW on ${linkText}`);
        newLi.append(newA);
      }
      socialList.append(newLi);
    });
    socialContainer.append(socialList);
    section.append(socialContainer);
  }

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

function addMobileToggle(footer) {
  footer.querySelectorAll('.footer-nav-heading').forEach((heading) => {
    const handler = () => {
      const expanded = heading.getAttribute('aria-expanded') === 'true';
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

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // Build the entire footer off-DOM first to avoid CLS
  const footer = document.createElement('div');
  footer.className = 'footer-wrapper';

  const divs = [...fragment.querySelectorAll(':scope > div > div')];

  if (divs.length >= 6) {
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

    const partners = buildPartners(divs[3]);
    footer.append(partners);

    const bottomSection = document.createElement('div');
    bottomSection.className = 'footer-bottom';

    const acknowledgement = buildAcknowledgement(divs[4]);
    bottomSection.append(acknowledgement);

    const socialLegal = buildSocialLegal(divs[5]);
    bottomSection.append(socialLegal);

    footer.append(bottomSection);

    addMobileToggle(footer);
  }

  // Decorate icons off-DOM before inserting
  await decorateIcons(footer);

  // Single atomic DOM swap to minimize CLS
  block.textContent = '';
  block.append(footer);
}

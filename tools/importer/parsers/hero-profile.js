/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-profile. Base: hero.
 * Source: https://www.unsw.edu.au/staff/-keith--chee-ooi
 * Selectors from captured DOM: .profile-page-header
 */
export default function parse(element, { document }) {
  // Row 1: Profile image (single cell)
  const profileImg = element.querySelector('img.profile-image');

  // Row 2: All text content in a single cell
  const contentWrapper = document.createElement('div');

  const heading = element.querySelector('h1.profile-heading');
  if (heading) contentWrapper.append(heading);

  // Title (Professor)
  const titleContainer = element.querySelector('.heading-title-container > .profile-title');
  if (titleContainer) {
    const p = document.createElement('p');
    p.textContent = titleContainer.textContent.trim();
    contentWrapper.append(p);
  }

  // Qualifications
  const qualDivs = element.querySelectorAll('.heading-text-container > .profile-title');
  if (qualDivs.length > 0) {
    const qualP = qualDivs[0].querySelector('p');
    if (qualP) contentWrapper.append(qualP);
  }

  // Faculty
  const faculty = element.querySelector('.faculty-title');
  if (faculty) {
    const p = document.createElement('p');
    p.textContent = faculty.textContent.trim();
    contentWrapper.append(p);
  }

  // School
  if (qualDivs.length > 1) {
    const schoolText = qualDivs[qualDivs.length - 1].textContent.trim();
    const p = document.createElement('p');
    p.textContent = schoolText;
    contentWrapper.append(p);
  }

  // Social follow links
  const socialLinks = element.querySelectorAll('.uds-social-follow .list a');
  if (socialLinks.length > 0) {
    const socialP = document.createElement('p');
    socialLinks.forEach((link, i) => {
      if (i > 0) socialP.append(' ');
      socialP.append(link);
    });
    contentWrapper.append(socialP);
  }

  const cells = [];
  if (profileImg) cells.push([profileImg]);
  cells.push([contentWrapper]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-profile', cells });
  element.replaceWith(block);
}

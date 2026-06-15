/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-tile variant.
 * Base block: cards
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Selector: .icon-tile.uds-component
 * Generated: 2026-06-05
 *
 * Source structure: .icon-tile-grid > .icon-tile-item elements, each containing
 * a link wrapping an icon image (.image) and tile heading (.tile-heading).
 * Target: Cards block with one row per tile - image cell + title/link cell.
 */
export default function parse(element, { document }) {
  // Extract all tile items from the grid
  const tileItems = element.querySelectorAll('.icon-tile-item');

  const cells = [];

  tileItems.forEach((item) => {
    // Extract the icon image (from picture element or direct img)
    const img = item.querySelector('picture img.image, img.image');

    // Extract the tile heading text
    const headingEl = item.querySelector('.tile-heading');

    // Extract the link (wrapping anchor)
    const link = item.querySelector('a[href]');

    // Build image cell - clone the picture element if available, otherwise use img
    const imageCell = [];
    const picture = item.querySelector('picture');
    if (picture) {
      imageCell.push(picture);
    } else if (img) {
      imageCell.push(img);
    }

    // Build content cell - title and link
    const contentCell = [];
    if (headingEl) {
      // Create a heading element for the title
      const heading = document.createElement('p');
      heading.textContent = headingEl.textContent.trim();
      contentCell.push(heading);
    }
    if (link) {
      // Create a CTA link element
      const cta = document.createElement('a');
      cta.href = link.href || link.getAttribute('href');
      cta.textContent = headingEl ? headingEl.textContent.trim() : 'Learn more';
      contentCell.push(cta);
    }

    // Only add row if we have meaningful content
    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}

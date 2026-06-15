/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-team
 * Base block: cards
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Selector: .grid-image-accordion
 * Generated: 2026-06-05
 *
 * Extracts team member cards from a grid-image-accordion component.
 * Each card has a photo, name, and bio text.
 * Target structure: Cards block with one row per team member [image | name + bio]
 */
export default function parse(element, { document }) {
  // Each team member is in a .grid-column container
  const gridColumns = element.querySelectorAll('.grid-column');

  const cells = [];

  gridColumns.forEach((column) => {
    // Extract the team member image
    const img = column.querySelector('.grid-image img[src]:not([src^="data:"])');

    // Extract the name from the heading
    const heading = column.querySelector('h4.grid-title-heading, .grid-title-heading');

    // Extract bio text from the grid-description area
    const descriptionContainer = column.querySelector('.grid-description');

    // Build the content cell (name + bio)
    const contentCell = [];

    if (heading) {
      // Create a clean heading element for the name
      const nameEl = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = heading.textContent.trim();
      nameEl.appendChild(strong);
      contentCell.push(nameEl);
    }

    // Add bio paragraphs from description, skipping the repeated name
    if (descriptionContainer) {
      const paragraphs = descriptionContainer.querySelectorAll('p');
      paragraphs.forEach((p) => {
        // Skip the paragraph that just repeats the name (bold only, no other content)
        const isBoldNameOnly = p.querySelector('b') && p.textContent.trim() === (heading ? heading.textContent.trim() : '');
        if (!isBoldNameOnly) {
          contentCell.push(p);
        }
      });
    }

    // Only add row if we have meaningful content
    if (img || contentCell.length > 0) {
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team', cells });
  element.replaceWith(block);
}

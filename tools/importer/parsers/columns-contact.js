/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-contact. Base: columns.
 * Source: https://www.unsw.edu.au/staff/-keith--chee-ooi
 * Selectors from captured DOM: .text.uds-component.read-more, .propertytiles
 * Note: Two selectors match sibling elements. First match (read-more) builds full block,
 * second match (propertytiles) is consumed by first and skipped.
 */
export default function parse(element, { document }) {
  // Determine which element we matched
  const isReadMore = element.classList.contains('read-more');
  const isPropertyTiles = element.classList.contains('propertytiles');

  if (isPropertyTiles) {
    // Already consumed by the read-more parser — remove this element
    element.remove();
    return;
  }

  // Column 1: Bio text (use full-text version, not truncated)
  const col1 = document.createElement('div');
  const fullText = element.querySelector('.full-text');
  const truncatedText = element.querySelector('.truncated-text');
  const bioSource = fullText || truncatedText;
  if (bioSource) {
    const paragraphs = bioSource.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text && text !== '\u00a0') {
        col1.append(p);
      }
    });
  }

  // Column 2: Find sibling propertytiles element
  const col2 = document.createElement('div');
  const parent = element.closest('.aem-Grid') || element.parentElement;
  const tilesEl = parent ? parent.querySelector('.propertytiles') : null;
  if (tilesEl) {
    const tiles = tilesEl.querySelectorAll('.property-tile');
    tiles.forEach((tile) => {
      const titleEl = tile.querySelector('.title');
      const textEl = tile.querySelector('.text');
      if (titleEl && textEl) {
        const h3 = document.createElement('h3');
        h3.textContent = titleEl.textContent.trim();
        col2.append(h3);
        const p = document.createElement('p');
        p.textContent = textEl.textContent.trim();
        col2.append(p);
      }
    });
    tilesEl.remove();
  }

  const cells = [[col1, col2]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-quotes
 * Base block: columns
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Description: Columns block for side-by-side testimonial quotes with colored backgrounds.
 * Generated: 2026-06-05
 */
export default function parse(element, { document }) {
  // The source structure is a .column-layout.match-column-height container
  // with two 6-column grid children, each containing a quote card (.cmp-text with <i> quote and attribution <p>)

  // Select the two column containers (direct grid children at 6-col width)
  const columns = element.querySelectorAll(':scope .aem-Grid > .responsivegrid');

  const cells = [];
  const row = [];

  columns.forEach((col) => {
    // Each column contains a .cmp-text div with the quote content
    const cmpText = col.querySelector('.cmp-text');
    const cellContent = [];

    if (cmpText) {
      // Extract all paragraphs (quote in <i> tags and attribution)
      const paragraphs = cmpText.querySelectorAll('p');
      paragraphs.forEach((p) => {
        cellContent.push(p);
      });
    }

    // If we found content, add it as a cell; otherwise add the whole column content
    if (cellContent.length > 0) {
      row.push(cellContent);
    } else {
      // Fallback: use whatever text content is in the column
      const textElements = col.querySelectorAll('p, h2, h3, h4');
      if (textElements.length > 0) {
        row.push(Array.from(textElements));
      } else {
        row.push([col]);
      }
    }
  });

  // The library example shows a single row with two cells (one per column)
  if (row.length > 0) {
    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-quotes', cells });
  element.replaceWith(block);
}

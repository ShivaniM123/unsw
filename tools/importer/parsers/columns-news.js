/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-news block variant (DA format).
 * News article hero: [text | image] two-column layout.
 * Source: https://www.unsw.edu.au/news/2026/03/researcher-spotlight--althea-gibson-
 * Selector: .degree-page-header .page-header
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.media picture, .media img, picture, img');
  const heading = element.querySelector('.content h1, h1');
  const dateEl = element.querySelector('.content .datetime, .datetime');

  // Column 1: text content (heading + date)
  const textCol = document.createElement('div');
  if (heading) {
    textCol.appendChild(heading.cloneNode(true));
  }
  if (dateEl) {
    const dateParagraph = document.createElement('p');
    dateParagraph.textContent = dateEl.textContent.trim();
    textCol.appendChild(dateParagraph);
  }

  // Column 2: portrait image
  const imageCol = document.createElement('div');
  if (image) {
    const pictureEl = image.closest('picture') || image;
    imageCol.appendChild(pictureEl.cloneNode(true));
  }

  // Build cells: single row with two columns [text | image]
  const cells = [[textCol, imageCol]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns (news)', cells });
  element.replaceWith(block);
}

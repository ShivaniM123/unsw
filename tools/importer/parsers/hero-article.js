/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-article
 * Base block: hero
 * Source: https://www.unsw.edu.au/news/2026/03/dr-yu-jing-on-powering-clean-energy-why-future-geoscience-needs-more-women
 * Selector: .degree-page-header .page-header
 * Generated: 2026-06-05
 *
 * Source structure:
 *   div.page-header.background-shape-2
 *     div.content > h1, p (standfirst), div.datetime
 *     div.media > div.media-inner > picture > img
 *
 * Target table (from block library):
 *   Row 1: Hero image (article portrait/headshot)
 *   Row 2: Title (h1) + Subheading (standfirst paragraph) + Published date
 */
export default function parse(element, { document }) {
  // Extract portrait image from .media section
  // Validated selectors: .media-inner > picture exists in source HTML
  const image = element.querySelector('.media-inner picture, .media picture, picture');

  // Extract heading (h1 article title)
  // Validated: .content > h1 exists in source HTML
  const heading = element.querySelector('.content h1, h1');

  // Extract standfirst paragraph (first p in .content)
  // Validated: .content > p exists in source HTML
  const standfirst = element.querySelector('.content > p, .content p');

  // Extract publication date from .datetime div
  // Validated: .content > div.datetime exists in source HTML
  const dateEl = element.querySelector('.content .datetime, .datetime');

  // Build cells array matching block library structure:
  // Row 1: image (portrait/headshot)
  // Row 2: text content (heading + standfirst + date) in a single cell
  const cells = [];

  // Row 1: Image
  if (image) {
    cells.push([image]);
  }

  // Row 2: All text content combined in one cell (single container)
  const contentWrapper = document.createElement('div');
  if (heading) contentWrapper.appendChild(heading);
  if (standfirst) contentWrapper.appendChild(standfirst);
  if (dateEl) {
    // Convert div.datetime to paragraph for clean markdown output
    const dateParagraph = document.createElement('p');
    dateParagraph.textContent = dateEl.textContent.trim();
    contentWrapper.appendChild(dateParagraph);
  }
  if (contentWrapper.children.length > 0) {
    cells.push([contentWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-article
 * Base block: hero
 * Source: https://www.unsw.edu.au/news/2026/03/dr-yu-jing-on-powering-clean-energy-why-future-geoscience-needs-more-women
 * Selector: .degree-page-header .page-header
 * Generated: 2026-05-18
 *
 * Source structure:
 *   div.page-header
 *     div.content > h1, p (standfirst), div.datetime
 *     div.media > div.media-inner > picture > img
 *
 * Target table (from library example):
 *   Row 1: image (portrait/headshot)
 *   Row 2: heading (article title)
 *   Row 3: description (standfirst + publication date)
 */
export default function parse(element, { document }) {
  // Extract portrait image from .media section
  const image = element.querySelector('.media picture, .media-inner picture, .media img, picture');

  // Extract heading (h1 article title)
  const heading = element.querySelector('.content h1, h1, .content h2, h2');

  // Extract standfirst paragraph (first p in .content, not inside .datetime)
  const standfirst = element.querySelector('.content > p, .content p:not(.datetime p)');

  // Extract publication date from .datetime div
  const dateEl = element.querySelector('.content .datetime, .datetime, [class*="date"]');

  // Build cells array matching block JS structure:
  // Row 1: image (portrait)
  // Row 2: text content (heading + standfirst + date)
  const cells = [];

  // Row 1: Image
  if (image) {
    cells.push([image]);
  }

  // Row 2: All text content in a single cell (heading, standfirst, date)
  const textWrapper = document.createElement('div');
  if (heading) {
    textWrapper.appendChild(heading);
  }
  if (standfirst) {
    textWrapper.appendChild(standfirst);
  }
  if (dateEl) {
    const dateParagraph = document.createElement('p');
    dateParagraph.textContent = dateEl.textContent.trim();
    textWrapper.appendChild(dateParagraph);
  }
  if (textWrapper.children.length > 0) {
    cells.push([textWrapper]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}

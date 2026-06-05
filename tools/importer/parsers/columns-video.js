/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-video
 * Base block: columns
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Selector: .column-layout.column-layout--padded-all-medium.column-layout--border-curved.shape-bg-colour--primary-codegrey
 * Generated: 2026-06-05
 *
 * Two-column layout: column 1 contains a YouTube video (iframe with data-src),
 * column 2 contains a heading, descriptive text paragraphs, and a CTA button.
 * Only processes elements that contain a .videoplayer component.
 */
export default function parse(element, { document }) {
  // Only process elements that actually contain a video player
  const videoplayer = element.querySelector('.videoplayer');
  if (!videoplayer) return;

  // Get the responsive grid columns (the two side-by-side content areas)
  const aemGrid = element.querySelector('.aem-Grid');
  const columns = aemGrid ? aemGrid.querySelectorAll(':scope > .responsivegrid') : [];

  // Column 1: Video content - extract YouTube URL from iframe data-src or src
  const col1Content = [];
  if (columns.length > 0) {
    const videoColumn = columns[0];
    const iframe = videoColumn.querySelector('iframe[data-src], iframe.youtube-player, iframe[id^="ytplayer"]');
    if (iframe) {
      const videoUrl = iframe.getAttribute('data-src') || iframe.getAttribute('src');
      if (videoUrl && videoUrl.trim() !== '') {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.textContent = videoUrl;
        col1Content.push(link);
      }
    }
  }

  // Column 2: Text content (heading + paragraphs + CTA button)
  const col2Content = [];
  if (columns.length > 1) {
    const textColumn = columns[1];

    // Extract heading and paragraphs from .cmp-text
    const textContainer = textColumn.querySelector('.cmp-text');
    if (textContainer) {
      const heading = textContainer.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) col2Content.push(heading);
      const paragraphs = textContainer.querySelectorAll(':scope > p');
      paragraphs.forEach((p) => col2Content.push(p));
    }

    // Extract CTA button link from .unsw-brand-button
    const buttonContainer = textColumn.querySelector('.unsw-brand-button');
    if (buttonContainer) {
      const ctaLink = buttonContainer.querySelector('a[href]');
      if (ctaLink) col2Content.push(ctaLink);
    }
  }

  // Build cells: single row with two columns matching the Columns block structure
  const cells = [];
  cells.push([
    col1Content.length > 0 ? col1Content : [''],
    col2Content.length > 0 ? col2Content : [''],
  ]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video', cells });
  element.replaceWith(block);
}

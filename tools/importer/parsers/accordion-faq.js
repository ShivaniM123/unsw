/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq.
 * Base block: accordion.
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Generated: 2026-06-05
 *
 * Extracts accordion items (question/answer pairs) from UNSW accordion components.
 * Each accordion item becomes a row with [question title | answer content].
 */
export default function parse(element, { document }) {
  // Find all accordion list items
  const items = element.querySelectorAll('.accordion-list-item');

  const cells = [];

  items.forEach((item) => {
    // Extract the question title from the accordion heading
    const headingEl = item.querySelector('.accordion-item-heading p, .accordion-item-heading');
    const questionText = headingEl ? headingEl.textContent.trim() : '';

    // Extract the answer content from the accordion-content panel
    const contentPanel = item.querySelector('.accordion-content');
    if (!contentPanel) return;

    // Build answer content: collect text blocks and CTA links
    const answerContainer = document.createElement('div');

    // Get all rich text content from .cmp-text elements
    const textBlocks = contentPanel.querySelectorAll('.cmp-text');
    textBlocks.forEach((textBlock) => {
      // Clone children (p, h5, ul, etc.) preserving semantic HTML
      Array.from(textBlock.children).forEach((child) => {
        answerContainer.appendChild(child.cloneNode(true));
      });
    });

    // Get CTA buttons/links from .unsw-brand-button elements
    const ctaButtons = contentPanel.querySelectorAll('.unsw-brand-button a');
    ctaButtons.forEach((btn) => {
      const link = document.createElement('a');
      link.href = btn.href;
      link.textContent = btn.querySelector('.text') ? btn.querySelector('.text').textContent.trim() : btn.textContent.trim();
      const p = document.createElement('p');
      p.appendChild(link);
      answerContainer.appendChild(p);
    });

    // Create the question cell as a simple text node
    const questionCell = document.createElement('span');
    questionCell.textContent = questionText;

    // Each accordion item becomes one row: [question | answer]
    cells.push([questionCell, answerContainer]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}

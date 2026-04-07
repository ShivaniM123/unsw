/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UNSW section breaks and section metadata.
 * Adds section breaks and section-metadata blocks based on template sections.
 * Selectors from captured DOM of https://www.unsw.edu.au/staff/-keith--chee-ooi
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // Process sections in reverse order to avoid position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = section.selector;
      if (!selector) continue;

      // Find the first element matching the section selector
      const sectionEl = element.querySelector(selector);
      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add section break before non-first sections (only if there is content before)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}

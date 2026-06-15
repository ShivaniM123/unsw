/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UNSW section breaks and section-metadata insertion.
 * Uses payload.template.sections to insert <hr> boundaries and Section Metadata blocks.
 * Runs only in afterTransform - after block parsing has completed.
 * All selectors verified against captured DOM (migration-work/cleaned.html).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload || {};
    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    const { sections } = template;
    const document = element.ownerDocument;

    // Process sections in reverse order to avoid position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (!section.selector) continue;

      // Find the first element matching the section selector
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before non-first sections to create section breaks
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}

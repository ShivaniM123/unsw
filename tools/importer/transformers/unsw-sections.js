/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UNSW section breaks.
 * Inserts section breaks (<hr>) between template sections.
 * Runs only in afterTransform, uses payload.template.sections from page-templates.json.
 *
 * Sections (from page-templates.json):
 *   1. Hero / Article Header - selector: ".column-layout.padded-right" (line 1090 in cleaned.html)
 *   2. Article Body - selector: ".column-layout.padded-left.padded-right" (line 1118 in cleaned.html)
 *
 * Neither section has a style, so no Section Metadata blocks are needed.
 * Only an <hr> is inserted before the second section.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };

    // Process sections in reverse order (skip the first section - no <hr> before it)
    for (let i = sections.length - 1; i >= 1; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);

      if (sectionEl) {
        // If the preceding section has a style, add Section Metadata before the <hr>
        const prevSection = sections[i - 1];
        if (prevSection && prevSection.style) {
          const cells = { style: prevSection.style };
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells,
          });
          sectionEl.parentNode.insertBefore(metadataBlock, sectionEl);
        }

        // Insert <hr> before this section element to create a section break
        const hr = document.createElement('hr');
        sectionEl.parentNode.insertBefore(hr, sectionEl);

        // If this section has a style, add Section Metadata block after it
        if (section.style) {
          const cells = { style: section.style };
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells,
          });
          sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
        }
      }
    }
  }
}

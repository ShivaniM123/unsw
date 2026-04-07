/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-research. Base: tabs.
 * Source: https://www.unsw.edu.au/staff/-keith--chee-ooi
 * Selectors from captured DOM: .tabs.uds-component
 * Tabs block structure: col1 = tab label, col2 = tab content
 */
export default function parse(element, { document }) {
  // Get tab labels from the tab control spans (not accordion buttons)
  const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab .tab-control, .cmp-tabs__tablist .cmp-tabs__tab.cmp-tabs__tab--active .tab-control'));

  // Get tab panels
  const tabPanels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  tabLabels.forEach((label, i) => {
    const labelText = label.textContent.trim();
    if (!labelText) return;

    const panel = tabPanels[i];
    const contentDiv = document.createElement('div');

    if (panel) {
      // Extract accordion items from this tab panel
      const accordionItems = panel.querySelectorAll('.accordion-list-item');

      if (accordionItems.length > 0) {
        accordionItems.forEach((item) => {
          const headingEl = item.querySelector('.accordion-item-heading');
          const contentEl = item.querySelector('.accordion-content');

          if (headingEl) {
            const h3 = document.createElement('h3');
            h3.textContent = headingEl.textContent.trim();
            contentDiv.append(h3);
          }

          if (contentEl) {
            // Extract publication/grant/award items
            const pubItems = contentEl.querySelectorAll('.publication-item');
            if (pubItems.length > 0) {
              pubItems.forEach((pub) => {
                const titleEl = pub.querySelector('.publication-title, h4, h3, .title');
                const detailsEl = pub.querySelector('.publication-details, .details, p');
                if (titleEl) {
                  const p = document.createElement('p');
                  p.innerHTML = '<strong>' + titleEl.textContent.trim() + '</strong>';
                  contentDiv.append(p);
                }
                if (detailsEl && detailsEl !== titleEl) {
                  const p = document.createElement('p');
                  p.textContent = detailsEl.textContent.trim();
                  contentDiv.append(p);
                }
              });
            } else {
              // Fallback: extract text content from accordion content
              const paragraphs = contentEl.querySelectorAll('p, li, h3, h4');
              if (paragraphs.length > 0) {
                paragraphs.forEach((p) => {
                  const text = p.textContent.trim();
                  if (text) contentDiv.append(p);
                });
              } else {
                const text = contentEl.textContent.trim();
                if (text) {
                  const p = document.createElement('p');
                  p.textContent = text;
                  contentDiv.append(p);
                }
              }
            }
          }
        });
      } else {
        // No accordion — extract direct content
        const directContent = panel.querySelectorAll('p, li, h3, h4, table');
        directContent.forEach((el) => {
          const text = el.textContent.trim();
          if (text) contentDiv.append(el);
        });
      }
    }

    cells.push([labelText, contentDiv]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-research', cells });
  element.replaceWith(block);
}

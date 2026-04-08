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
            // Extract publication items (from captured DOM: .publication-item)
            const pubItems = contentEl.querySelectorAll('.publication-item');
            if (pubItems.length > 0) {
              pubItems.forEach((pub) => {
                // Publication info heading e.g. "Book Chapters | 2023"
                const infoEl = pub.querySelector('.publication-item--publication-info');
                if (infoEl) {
                  const h4 = document.createElement('h4');
                  h4.textContent = infoEl.textContent.trim();
                  contentDiv.append(h4);
                }
                // Publication body (author, year, title, source)
                const bodyEl = pub.querySelector('.publication-item--body');
                if (bodyEl) {
                  const p = document.createElement('p');
                  p.textContent = bodyEl.textContent.trim();
                  contentDiv.append(p);
                }
              });
            } else {
              // Fallback: extract all child content from accordion content
              const children = contentEl.querySelectorAll('p, li, h3, h4, div:not(:empty)');
              children.forEach((child) => {
                const text = child.textContent.trim();
                if (text && child.children.length === 0) {
                  const p = document.createElement('p');
                  p.textContent = text;
                  contentDiv.append(p);
                } else if (child.tagName === 'P' || child.tagName === 'LI') {
                  contentDiv.append(child);
                }
              });
            }
          }
        });
      } else {
        // No accordion — extract direct content (grants, awards, etc.)
        const directChildren = panel.querySelectorAll('p, li, h3, h4, ul, ol, table');
        directChildren.forEach((el) => {
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

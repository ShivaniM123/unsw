// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // --- Vanilla tabs logic (class names updated to tabs-research) ---
  const tablist = document.createElement('div');
  tablist.className = 'tabs-research-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-research-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    const button = document.createElement('button');
    button.className = 'tabs-research-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // --- Tabs-research variant: convert h3 headings inside panels to accordions ---
  block.querySelectorAll('.tabs-research-panel').forEach((panel) => {
    const container = panel.querySelector(':scope > div');
    if (!container) return;

    const headings = container.querySelectorAll('h3');
    if (headings.length === 0) return;

    // Group content: each h3 + subsequent siblings until next h3
    const groups = [];
    let currentGroup = null;

    [...container.children].forEach((child) => {
      if (child.tagName === 'H3') {
        currentGroup = { heading: child, content: [] };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.content.push(child);
      }
    });

    // Build accordion structure
    const accordion = document.createElement('div');
    accordion.className = 'tabs-research-accordion';

    groups.forEach((group) => {
      const item = document.createElement('div');
      item.className = 'tabs-research-accordion-item';

      const btn = document.createElement('button');
      btn.className = 'tabs-research-accordion-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-expanded', 'false');

      const heading = document.createElement('span');
      heading.className = 'tabs-research-accordion-heading';
      heading.textContent = group.heading.textContent;

      const icon = document.createElement('span');
      icon.className = 'tabs-research-accordion-icon';

      btn.append(heading);
      btn.append(icon);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'tabs-research-accordion-content';
      contentDiv.setAttribute('aria-hidden', 'true');
      group.content.forEach((el) => contentDiv.append(el));

      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !expanded);
        contentDiv.setAttribute('aria-hidden', expanded);
      });

      item.append(btn);
      item.append(contentDiv);
      accordion.append(item);
    });

    container.replaceChildren(accordion);
  });
}

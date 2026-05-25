export default function decorate(block) {
  const rows = [...block.children];
  const nav = document.createElement('nav');
  nav.className = 'sub-nav-inner';
  nav.setAttribute('aria-label', 'Section navigation');

  let rowIndex = 0;

  // Row 1: optional title (e.g. "Newsroom")
  const firstCell = rows[0]?.querySelector('div');
  if (firstCell && !firstCell.querySelector('ul')) {
    const title = document.createElement('span');
    title.className = 'sub-nav-title';
    title.textContent = firstCell.textContent.trim();
    nav.append(title);
    rowIndex = 1;
  }

  // Next row: navigation links
  if (rows[rowIndex]) {
    const links = rows[rowIndex].querySelector('ul');
    if (links) {
      links.className = 'sub-nav-links';
      nav.append(links);
    }
    rowIndex += 1;
  }

  // Next row: social icons
  if (rows[rowIndex]) {
    const social = rows[rowIndex].querySelector('ul');
    if (social) {
      social.className = 'sub-nav-social';
      nav.append(social);
    }
  }

  block.textContent = '';
  block.append(nav);
}

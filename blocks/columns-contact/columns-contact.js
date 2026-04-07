export default function decorate(block) {
  // --- Vanilla columns logic (class names updated to columns-contact) ---
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-contact-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-contact-img-col');
        }
      }
    });
  });

  // --- Columns-contact variant: label bio and tiles columns ---
  const row = block.querySelector(':scope > div');
  if (row) {
    const colDivs = [...row.children];
    if (colDivs[0]) colDivs[0].classList.add('columns-contact-bio-col');
    if (colDivs[1]) colDivs[1].classList.add('columns-contact-tiles-col');
  }

  // --- Columns-contact variant: Read more/less toggle on bio text ---
  const bioCol = block.querySelector('.columns-contact-bio-col');
  if (bioCol) {
    const paragraphs = [...bioCol.querySelectorAll('p')];
    if (paragraphs.length > 2) {
      const wrapper = document.createElement('div');
      wrapper.className = 'columns-contact-bio';

      paragraphs.forEach((p) => wrapper.append(p));
      wrapper.classList.add('collapsed');

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'columns-contact-toggle';
      toggleBtn.textContent = 'Read more';
      toggleBtn.addEventListener('click', () => {
        const isCollapsed = wrapper.classList.contains('collapsed');
        wrapper.classList.toggle('collapsed');
        toggleBtn.textContent = isCollapsed ? 'Read less' : 'Read more';
      });

      bioCol.append(wrapper);
      bioCol.append(toggleBtn);
    }
  }
}

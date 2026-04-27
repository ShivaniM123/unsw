export default function decorate(block) {
  // --- Vanilla columns logic (class names updated to columns-profile) ---
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-profile-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-profile-img-col');
        }
      }
    });
  });

  // --- Columns-profile variant: label text and image columns ---
  const row = block.querySelector(':scope > div');
  if (row) {
    const colDivs = [...row.children];
    if (colDivs[0]) colDivs[0].classList.add('columns-profile-text-col');
    if (colDivs[1]) colDivs[1].classList.add('columns-profile-image-col');
  }

  // --- Wrap "Follow me" heading + icon list into inline row ---
  const textCol = block.querySelector('.columns-profile-text-col');
  if (textCol) {
    const followH2 = textCol.querySelector('h2');
    const iconList = textCol.querySelector('ul');
    if (followH2 && iconList) {
      const followRow = document.createElement('div');
      followRow.className = 'columns-profile-follow-row';
      followH2.before(followRow);
      followRow.append(followH2);
      followRow.append(iconList);
    }
  }
}

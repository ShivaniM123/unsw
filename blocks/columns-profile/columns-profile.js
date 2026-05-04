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

  // --- Classify paragraphs after H1 based on count ---
  const textCol = block.querySelector('.columns-profile-text-col');
  if (textCol) {
    const h1 = textCol.querySelector('h1');
    if (h1) {
      const afterH1 = [];
      let el = h1.nextElementSibling;
      while (el && el.tagName === 'P') {
        afterH1.push(el);
        el = el.nextElementSibling;
      }
      if (afterH1.length >= 3) {
        afterH1[0].classList.add('profile-qualifications');
        afterH1[1].classList.add('profile-faculty');
        afterH1[2].classList.add('profile-school');
      } else if (afterH1.length === 2) {
        afterH1[0].classList.add('profile-faculty');
        afterH1[1].classList.add('profile-school');
      }
    }

    // --- Wrap "Follow me" heading + icon list into inline row ---
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

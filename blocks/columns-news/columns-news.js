export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-news-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-news-img-col');
        }
      }
    });
  });

  const row = block.querySelector(':scope > div');
  if (row) {
    const colDivs = [...row.children];
    if (colDivs[0]) colDivs[0].classList.add('columns-news-text-col');
    if (colDivs[1]) colDivs[1].classList.add('columns-news-image-col');
  }
}

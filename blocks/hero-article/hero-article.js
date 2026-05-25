export default function decorate(block) {
  const rows = [...block.children];
  const imageRow = rows[0];
  const textRow = rows[1];

  block.innerHTML = '';

  const textCol = document.createElement('div');
  textCol.classList.add('hero-article-text');
  if (textRow) {
    textCol.append(...textRow.querySelector('div').children);
  }

  const imageCol = document.createElement('div');
  imageCol.classList.add('hero-article-image');
  if (imageRow) {
    const picture = imageRow.querySelector('picture');
    if (picture) {
      imageCol.append(picture);
    }
  }

  block.append(textCol, imageCol);

  document.body.classList.add('has-yellow-accent');
}

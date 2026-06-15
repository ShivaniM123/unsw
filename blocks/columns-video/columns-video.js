export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-video-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Convert YouTube links to embedded iframes
      const links = col.querySelectorAll('a');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes('youtube.com/embed')) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('columns-video-embed');
          const iframe = document.createElement('iframe');
          iframe.src = href;
          iframe.setAttribute('allowfullscreen', '');
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          iframe.setAttribute('title', 'YouTube video player');
          wrapper.append(iframe);
          link.replaceWith(wrapper);
          col.classList.add('columns-video-media-col');
        }
      });

      // Mark text column
      if (!col.classList.contains('columns-video-media-col')) {
        const pic = col.querySelector('picture');
        if (pic) {
          col.classList.add('columns-video-img-col');
        } else if (col.querySelector('h4, h3, p')) {
          col.classList.add('columns-video-text-col');
        }
      }
    });
  });
}

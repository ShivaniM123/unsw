/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UNSW site cleanup.
 * Removes non-authorable content: header, footer, breadcrumbs, cookie consent, analytics.
 * Selectors from captured DOM of https://www.unsw.edu.au/staff/-keith--chee-ooi
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Remove cookie consent and tracking overlays (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '.onetrust-pc-dark-filter',
    ]);

    // Remove analytics containers (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#page-analytics',
      '#category-analytics',
    ]);

    // Remove background shape decoration (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.background-shape-container',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Remove header/nav (from captured DOM: .globalheader, .site-header-new)
    WebImporter.DOMUtils.remove(element, [
      '.globalheader',
      '.site-header-new',
      'header',
    ]);

    // Remove footer (from captured DOM: .globalfooter)
    WebImporter.DOMUtils.remove(element, [
      '.globalfooter',
      'footer',
    ]);

    // Remove breadcrumbs (from captured DOM: .breadcrumb, .breadcrumbs)
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumb',
      '.breadcrumbs',
      '.breadcrumbs-wrapper',
    ]);

    // Remove non-authorable social follow and back link (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.back-link',
      '.back-news-profile',
      '.sub-navigation',
    ]);

    // Remove all social follow elements (non-authorable site chrome - from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.socialfollow',
    ]);

    // Remove iframes, links, noscript
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);
  }
}

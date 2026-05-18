/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: UNSW site-wide cleanup.
 * Removes non-authorable content from all UNSW pages before import.
 * All selectors verified against captured DOM in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent banner and overlay (blocks parsing)
    // Found: <div id="onetrust-consent-sdk"> at line 1506
    // Found: <input id="cookieConsentEnabled"> at line 1492
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#cookieConsentEnabled',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome and global elements
    // All selectors from captured DOM:

    // Global header: <div class="globalheader ..."> at line 37, contains <header> at line 39
    // Global footer: <div class="globalfooter ..."> at line 1201, contains <footer> at line 1202
    // Skip-to-content: <div class="skip-to-source ..."> at line 21
    // Skip-to target: <div class="skip-to-target ..."> at line 1080
    // Breadcrumbs: <div class="breadcrumb spacermargin ..."> at line 977
    // Social follow: <div class="socialfollow ..."> at line 1017
    // Back link: <div class="back-link ..."> at line 1071
    // Sub-navigation: <div class="sub-navigation ..."> at line 1069 (empty)
    // Analytics: <div id="page-analytics"> at line 5, <div id="category-analytics"> at line 7
    // Background shape: <div class="background-shape-container"> at line 2
    // Empty author component: <div class="author-v3 ..."> at line 1150 (empty name/title/content)
    // Empty tags component: <div class="tags"> at line 1161 (empty cmp-tag__tags)
    // Empty mentions component: <div class="mentions-component-wrapper ..."> at line 1112 (empty)
    // Decorative spacers: <div class="spacer ..."> at lines 971, 1173
    WebImporter.DOMUtils.remove(element, [
      '.globalheader',
      '.globalfooter',
      'header',
      'footer',
      '.skip-to-source',
      '.skip-to-target',
      '[class*="breadcrumb"][class*="spacermargin"]',
      '.socialfollow',
      '.back-link',
      '.sub-navigation',
      '#page-analytics',
      '#category-analytics',
      '.background-shape-container',
      '.author-v3',
      '.tags',
      '.mentions-component-wrapper',
      '.spacer',
      'noscript',
      'link',
    ]);

    // Remove empty experience-fragment wrappers that contained header/footer/social
    const emptyXFs = element.querySelectorAll('.experience-fragment');
    emptyXFs.forEach((xf) => {
      if (!xf.textContent.trim() || xf.querySelector('.globalheader, .globalfooter, .socialfollow')) {
        xf.remove();
      }
    });
  }
}

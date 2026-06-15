/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-service
 * Base block: hero
 * Source: https://www.unsw.edu.au/student/support/services/equitable-learning-services
 * Selector: .hero-standard.hero-standard--image
 * Generated: 2026-06-05
 */
export default function parse(element, { document }) {
  // Extract hero image from .hero-image picture
  const heroImage = element.querySelector('.hero-image img, .hero-image picture img');

  // Extract heading from h1.hero-title-heading
  // The h1 contains a <p> child with the actual title text
  const headingEl = element.querySelector('h1.hero-title-heading, h1.hero-title-large, .hero-title h1');
  let heading = null;
  if (headingEl) {
    // Create a clean h1 with the text content (source wraps title in a <p> inside h1)
    heading = document.createElement('h1');
    heading.textContent = headingEl.textContent.trim();
  }

  // Extract sub-heading / description from .hero-sub-heading
  const subHeadingEl = element.querySelector('.hero-sub-heading p, .hero-sub-heading');
  let description = null;
  if (subHeadingEl) {
    description = document.createElement('p');
    description.textContent = subHeadingEl.textContent.trim();
  }

  // Extract CTA buttons - links inside .hero-cta
  const ctaLinks = Array.from(element.querySelectorAll('.hero-cta a.uds-brand-button, .hero-cta a[class*="brand-button"]'));
  // Create clean anchor elements preserving href and text
  const ctas = ctaLinks.map((link) => {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    // Extract text from .text div inside the button or fallback to textContent
    const textDiv = link.querySelector('.text');
    a.textContent = textDiv ? textDiv.textContent.trim() : link.textContent.trim();
    return a;
  });

  // Build cells array matching block library structure (single column, one element per row):
  // Row 1: Image (optional)
  // Row 2: Heading
  // Row 3: Description
  // Row 4: CTA button(s)
  const cells = [];

  // Row 1: Hero image (optional)
  if (heroImage) {
    cells.push([heroImage]);
  }

  // Row 2: Heading
  if (heading) {
    cells.push([heading]);
  }

  // Row 3: Description
  if (description) {
    cells.push([description]);
  }

  // Row 4: CTA buttons (all in one row)
  if (ctas.length > 0) {
    const ctaContainer = document.createElement('p');
    ctas.forEach((cta, i) => {
      if (i > 0) ctaContainer.append(document.createTextNode(' '));
      ctaContainer.append(cta);
    });
    cells.push([ctaContainer]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-service', cells });
  element.replaceWith(block);
}

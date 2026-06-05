/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroServiceParser from './parsers/hero-service.js';
import cardsTileParser from './parsers/cards-tile.js';
import columnsVideoParser from './parsers/columns-video.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import columnsQuotesParser from './parsers/columns-quotes.js';
import cardsTeamParser from './parsers/cards-team.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/unsw-cleanup.js';
import sectionsTransformer from './transformers/unsw-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-service': heroServiceParser,
  'cards-tile': cardsTileParser,
  'columns-video': columnsVideoParser,
  'accordion-faq': accordionFaqParser,
  'columns-quotes': columnsQuotesParser,
  'cards-team': cardsTeamParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'student-support-service',
  description: 'UNSW student support service page providing information about equitable learning services, eligibility, and registration',
  urls: [
    'https://www.unsw.edu.au/student/support/services/equitable-learning-services',
  ],
  blocks: [
    {
      name: 'hero-service',
      instances: ['.hero-standard.hero-standard--image'],
    },
    {
      name: 'cards-tile',
      instances: ['.icon-tile.uds-component'],
    },
    {
      name: 'columns-video',
      instances: ['.column-layout.column-layout--padded-all-medium.column-layout--border-curved.shape-bg-colour--primary-codegrey'],
    },
    {
      name: 'accordion-faq',
      instances: ['.accordion.uds-component'],
    },
    {
      name: 'columns-quotes',
      instances: ['.column-layout.match-column-height'],
    },
    {
      name: 'cards-team',
      instances: ['.grid-image-accordion'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.hero-standard.aem-GridColumn',
      style: null,
      blocks: ['hero-service'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Main content with sidebar',
      selector: '.column-layout.uds-component.padded-left.padded-right.aem-GridColumn--default--12',
      style: null,
      blocks: [],
      defaultContent: ['.text.uds-component .cmp-text'],
    },
    {
      id: 'section-3',
      name: 'Icon tiles',
      selector: '.icon-tile.uds-component',
      style: null,
      blocks: ['cards-tile'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Video section',
      selector: '.column-layout.column-layout--padded-all-medium.column-layout--border-curved.shape-bg-colour--primary-codegrey',
      style: null,
      blocks: ['columns-video'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Get in touch',
      selector: '.shape-bg-colour--tertiary-teal',
      style: 'teal',
      blocks: ['accordion-faq', 'columns-quotes'],
      defaultContent: ['.text.uds-component .cmp-text', '.unsw-brand-button.uds-component'],
    },
    {
      id: 'section-6',
      name: 'FAQs',
      selector: '.accordion.uds-component',
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: ['.text.uds-component .cmp-text'],
    },
    {
      id: 'section-7',
      name: 'Meet the team',
      selector: '.grid-image-accordion',
      style: null,
      blocks: ['cards-team'],
      defaultContent: ['.text.uds-component .cmp-text'],
    },
    {
      id: 'section-8',
      name: 'Have a question CTA',
      selector: '.shape-bg-colour--primary-yellow',
      style: 'yellow',
      blocks: [],
      defaultContent: ['.text.uds-component .cmp-text', '.unsw-brand-button.uds-component'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

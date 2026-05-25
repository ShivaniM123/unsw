/* eslint-disable */
/* global WebImporter */

import heroArticleParser from './parsers/hero-article.js';
import unswCleanupTransformer from './transformers/unsw-cleanup.js';
import unswSectionsTransformer from './transformers/unsw-sections.js';

const parsers = {
  'hero-article': heroArticleParser,
};

const PAGE_TEMPLATE = {
  name: 'news-article',
  description: 'UNSW news article page featuring researcher interview about clean energy and geoscience',
  urls: [
    'https://www.unsw.edu.au/news/2026/03/dr-yu-jing-on-powering-clean-energy-why-future-geoscience-needs-more-women',
  ],
  blocks: [
    {
      name: 'hero-article',
      instances: ['.degree-page-header .page-header'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero / Article Header',
      selector: '.column-layout.padded-right',
      style: null,
      blocks: ['hero-article'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Article Body',
      selector: '.column-layout.padded-left.padded-right',
      style: null,
      blocks: [],
      defaultContent: ['.text.uds-component .cmp-text', '.separator.uds-component .cmp-separator'],
    },
  ],
};

const transformers = [
  unswCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [unswSectionsTransformer] : []),
];

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
    const { document, url, html, params } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
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

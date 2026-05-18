/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-news-article.js
  var import_news_article_exports = {};
  __export(import_news_article_exports, {
    default: () => import_news_article_default
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document }) {
    const image = element.querySelector(".media picture, .media-inner picture, .media img, picture");
    const heading = element.querySelector(".content h1, h1, .content h2, h2");
    const standfirst = element.querySelector(".content > p, .content p:not(.datetime p)");
    const dateEl = element.querySelector('.content .datetime, .datetime, [class*="date"]');
    const cells = [];
    if (image) {
      cells.push([image]);
    }
    const textWrapper = document.createElement("div");
    if (heading) {
      textWrapper.appendChild(heading);
    }
    if (standfirst) {
      textWrapper.appendChild(standfirst);
    }
    if (dateEl) {
      const dateParagraph = document.createElement("p");
      dateParagraph.textContent = dateEl.textContent.trim();
      textWrapper.appendChild(dateParagraph);
    }
    if (textWrapper.children.length > 0) {
      cells.push([textWrapper]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/unsw-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#cookieConsentEnabled"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".globalheader",
        ".globalfooter",
        "header",
        "footer",
        ".skip-to-source",
        ".skip-to-target",
        '[class*="breadcrumb"][class*="spacermargin"]',
        ".socialfollow",
        ".back-link",
        ".sub-navigation",
        "#page-analytics",
        "#category-analytics",
        ".background-shape-container",
        ".author-v3",
        ".tags",
        ".mentions-component-wrapper",
        ".spacer",
        "noscript",
        "link"
      ]);
      const emptyXFs = element.querySelectorAll(".experience-fragment");
      emptyXFs.forEach((xf) => {
        if (!xf.textContent.trim() || xf.querySelector(".globalheader, .globalfooter, .socialfollow")) {
          xf.remove();
        }
      });
    }
  }

  // tools/importer/transformers/unsw-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      for (let i = sections.length - 1; i >= 1; i--) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (sectionEl) {
          const prevSection = sections[i - 1];
          if (prevSection && prevSection.style) {
            const cells = { style: prevSection.style };
            const metadataBlock = WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells
            });
            sectionEl.parentNode.insertBefore(metadataBlock, sectionEl);
          }
          const hr = document.createElement("hr");
          sectionEl.parentNode.insertBefore(hr, sectionEl);
          if (section.style) {
            const cells = { style: section.style };
            const metadataBlock = WebImporter.Blocks.createBlock(document, {
              name: "Section Metadata",
              cells
            });
            sectionEl.parentNode.insertBefore(metadataBlock, sectionEl.nextSibling);
          }
        }
      }
    }
  }

  // tools/importer/import-news-article.js
  var parsers = {
    "hero-article": parse
  };
  var PAGE_TEMPLATE = {
    name: "news-article",
    description: "UNSW news article page featuring researcher interview about clean energy and geoscience",
    urls: [
      "https://www.unsw.edu.au/news/2026/03/dr-yu-jing-on-powering-clean-energy-why-future-geoscience-needs-more-women"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: [".degree-page-header .page-header"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero / Article Header",
        selector: ".column-layout.padded-right",
        style: null,
        blocks: ["hero-article"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Article Body",
        selector: ".column-layout.padded-left.padded-right",
        style: null,
        blocks: [],
        defaultContent: [".text.uds-component .cmp-text", ".separator.uds-component .cmp-separator"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_news_article_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_news_article_exports);
})();

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

  // tools/importer/import-student-support-service.js
  var import_student_support_service_exports = {};
  __export(import_student_support_service_exports, {
    default: () => import_student_support_service_default
  });

  // tools/importer/parsers/hero-service.js
  function parse(element, { document }) {
    const heroImage = element.querySelector(".hero-image img, .hero-image picture img");
    const headingEl = element.querySelector("h1.hero-title-heading, h1.hero-title-large, .hero-title h1");
    let heading = null;
    if (headingEl) {
      heading = document.createElement("h1");
      heading.textContent = headingEl.textContent.trim();
    }
    const subHeadingEl = element.querySelector(".hero-sub-heading p, .hero-sub-heading");
    let description = null;
    if (subHeadingEl) {
      description = document.createElement("p");
      description.textContent = subHeadingEl.textContent.trim();
    }
    const ctaLinks = Array.from(element.querySelectorAll('.hero-cta a.uds-brand-button, .hero-cta a[class*="brand-button"]'));
    const ctas = ctaLinks.map((link) => {
      const a = document.createElement("a");
      a.href = link.getAttribute("href");
      const textDiv = link.querySelector(".text");
      a.textContent = textDiv ? textDiv.textContent.trim() : link.textContent.trim();
      return a;
    });
    const cells = [];
    if (heroImage) {
      cells.push([heroImage]);
    }
    if (heading) {
      cells.push([heading]);
    }
    if (description) {
      cells.push([description]);
    }
    if (ctas.length > 0) {
      const ctaContainer = document.createElement("p");
      ctas.forEach((cta, i) => {
        if (i > 0) ctaContainer.append(document.createTextNode(" "));
        ctaContainer.append(cta);
      });
      cells.push([ctaContainer]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function parse2(element, { document }) {
    const tileItems = element.querySelectorAll(".icon-tile-item");
    const cells = [];
    tileItems.forEach((item) => {
      const img = item.querySelector("picture img.image, img.image");
      const headingEl = item.querySelector(".tile-heading");
      const link = item.querySelector("a[href]");
      const imageCell = [];
      const picture = item.querySelector("picture");
      if (picture) {
        imageCell.push(picture);
      } else if (img) {
        imageCell.push(img);
      }
      const contentCell = [];
      if (headingEl) {
        const heading = document.createElement("p");
        heading.textContent = headingEl.textContent.trim();
        contentCell.push(heading);
      }
      if (link) {
        const cta = document.createElement("a");
        cta.href = link.href || link.getAttribute("href");
        cta.textContent = headingEl ? headingEl.textContent.trim() : "Learn more";
        contentCell.push(cta);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video.js
  function parse3(element, { document }) {
    const videoplayer = element.querySelector(".videoplayer");
    if (!videoplayer) return;
    const aemGrid = element.querySelector(".aem-Grid");
    const columns = aemGrid ? aemGrid.querySelectorAll(":scope > .responsivegrid") : [];
    const col1Content = [];
    if (columns.length > 0) {
      const videoColumn = columns[0];
      const iframe = videoColumn.querySelector('iframe[data-src], iframe.youtube-player, iframe[id^="ytplayer"]');
      if (iframe) {
        const videoUrl = iframe.getAttribute("data-src") || iframe.getAttribute("src");
        if (videoUrl && videoUrl.trim() !== "") {
          const link = document.createElement("a");
          link.href = videoUrl;
          link.textContent = videoUrl;
          col1Content.push(link);
        }
      }
    }
    const col2Content = [];
    if (columns.length > 1) {
      const textColumn = columns[1];
      const textContainer = textColumn.querySelector(".cmp-text");
      if (textContainer) {
        const heading = textContainer.querySelector("h1, h2, h3, h4, h5, h6");
        if (heading) col2Content.push(heading);
        const paragraphs = textContainer.querySelectorAll(":scope > p");
        paragraphs.forEach((p) => col2Content.push(p));
      }
      const buttonContainer = textColumn.querySelector(".unsw-brand-button");
      if (buttonContainer) {
        const ctaLink = buttonContainer.querySelector("a[href]");
        if (ctaLink) col2Content.push(ctaLink);
      }
    }
    const cells = [];
    cells.push([
      col1Content.length > 0 ? col1Content : [""],
      col2Content.length > 0 ? col2Content : [""]
    ]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse4(element, { document }) {
    const items = element.querySelectorAll(".accordion-list-item");
    const cells = [];
    items.forEach((item) => {
      const headingEl = item.querySelector(".accordion-item-heading p, .accordion-item-heading");
      const questionText = headingEl ? headingEl.textContent.trim() : "";
      const contentPanel = item.querySelector(".accordion-content");
      if (!contentPanel) return;
      const answerContainer = document.createElement("div");
      const textBlocks = contentPanel.querySelectorAll(".cmp-text");
      textBlocks.forEach((textBlock) => {
        Array.from(textBlock.children).forEach((child) => {
          answerContainer.appendChild(child.cloneNode(true));
        });
      });
      const ctaButtons = contentPanel.querySelectorAll(".unsw-brand-button a");
      ctaButtons.forEach((btn) => {
        const link = document.createElement("a");
        link.href = btn.href;
        link.textContent = btn.querySelector(".text") ? btn.querySelector(".text").textContent.trim() : btn.textContent.trim();
        const p = document.createElement("p");
        p.appendChild(link);
        answerContainer.appendChild(p);
      });
      const questionCell = document.createElement("span");
      questionCell.textContent = questionText;
      cells.push([questionCell, answerContainer]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-quotes.js
  function parse5(element, { document }) {
    const columns = element.querySelectorAll(":scope .aem-Grid > .responsivegrid");
    const cells = [];
    const row = [];
    columns.forEach((col) => {
      const cmpText = col.querySelector(".cmp-text");
      const cellContent = [];
      if (cmpText) {
        const paragraphs = cmpText.querySelectorAll("p");
        paragraphs.forEach((p) => {
          cellContent.push(p);
        });
      }
      if (cellContent.length > 0) {
        row.push(cellContent);
      } else {
        const textElements = col.querySelectorAll("p, h2, h3, h4");
        if (textElements.length > 0) {
          row.push(Array.from(textElements));
        } else {
          row.push([col]);
        }
      }
    });
    if (row.length > 0) {
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-quotes", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-team.js
  function parse6(element, { document }) {
    const gridColumns = element.querySelectorAll(".grid-column");
    const cells = [];
    gridColumns.forEach((column) => {
      const img = column.querySelector('.grid-image img[src]:not([src^="data:"])');
      const heading = column.querySelector("h4.grid-title-heading, .grid-title-heading");
      const descriptionContainer = column.querySelector(".grid-description");
      const contentCell = [];
      if (heading) {
        const nameEl = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = heading.textContent.trim();
        nameEl.appendChild(strong);
        contentCell.push(nameEl);
      }
      if (descriptionContainer) {
        const paragraphs = descriptionContainer.querySelectorAll("p");
        paragraphs.forEach((p) => {
          const isBoldNameOnly = p.querySelector("b") && p.textContent.trim() === (heading ? heading.textContent.trim() : "");
          if (!isBoldNameOnly) {
            contentCell.push(p);
          }
        });
      }
      if (img || contentCell.length > 0) {
        const imageCell = img ? [img] : [];
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-team", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/unsw-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-pc-sdk",
        "#ot-sdk-btn-floating"
      ]);
      WebImporter.DOMUtils.remove(element, [".header-overlay"]);
      WebImporter.DOMUtils.remove(element, [".background-shape-container"]);
      WebImporter.DOMUtils.remove(element, [
        ".spacer",
        '[class*="cmp-spacer"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".globalheader",
        "header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".globalfooter",
        "footer"
      ]);
      WebImporter.DOMUtils.remove(element, [".breadcrumb"]);
      WebImporter.DOMUtils.remove(element, [".sub-navigation"]);
      WebImporter.DOMUtils.remove(element, [".socialfollow"]);
      WebImporter.DOMUtils.remove(element, [".skip-to-source"]);
      WebImporter.DOMUtils.remove(element, [
        "#page-analytics",
        "#category-analytics"
      ]);
      const xfFragments = element.querySelectorAll(".experience-fragment.experiencefragment");
      xfFragments.forEach((xf) => {
        const text = xf.textContent.trim();
        if (!text || text.length < 5) {
          xf.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, ["noscript", "link", "iframe"]);
    }
  }

  // tools/importer/transformers/unsw-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { template } = payload || {};
      if (!template || !template.sections || template.sections.length < 2) {
        return;
      }
      const { sections } = template;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (!section.selector) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-student-support-service.js
  var parsers = {
    "hero-service": parse,
    "cards-tile": parse2,
    "columns-video": parse3,
    "accordion-faq": parse4,
    "columns-quotes": parse5,
    "cards-team": parse6
  };
  var PAGE_TEMPLATE = {
    name: "student-support-service",
    description: "UNSW student support service page providing information about equitable learning services, eligibility, and registration",
    urls: [
      "https://www.unsw.edu.au/student/support/services/equitable-learning-services"
    ],
    blocks: [
      {
        name: "hero-service",
        instances: [".hero-standard.hero-standard--image"]
      },
      {
        name: "cards-tile",
        instances: [".icon-tile.uds-component"]
      },
      {
        name: "columns-video",
        instances: [".column-layout.column-layout--padded-all-medium.column-layout--border-curved.shape-bg-colour--primary-codegrey"]
      },
      {
        name: "accordion-faq",
        instances: [".accordion.uds-component"]
      },
      {
        name: "columns-quotes",
        instances: [".column-layout.match-column-height"]
      },
      {
        name: "cards-team",
        instances: [".grid-image-accordion"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".hero-standard.aem-GridColumn",
        style: null,
        blocks: ["hero-service"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Main content with sidebar",
        selector: ".column-layout.uds-component.padded-left.padded-right.aem-GridColumn--default--12",
        style: null,
        blocks: [],
        defaultContent: [".text.uds-component .cmp-text"]
      },
      {
        id: "section-3",
        name: "Icon tiles",
        selector: ".icon-tile.uds-component",
        style: null,
        blocks: ["cards-tile"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Video section",
        selector: ".column-layout.column-layout--padded-all-medium.column-layout--border-curved.shape-bg-colour--primary-codegrey",
        style: null,
        blocks: ["columns-video"],
        defaultContent: []
      },
      {
        id: "section-5",
        name: "Get in touch",
        selector: ".shape-bg-colour--tertiary-teal",
        style: "teal",
        blocks: ["accordion-faq", "columns-quotes"],
        defaultContent: [".text.uds-component .cmp-text", ".unsw-brand-button.uds-component"]
      },
      {
        id: "section-6",
        name: "FAQs",
        selector: ".accordion.uds-component",
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: [".text.uds-component .cmp-text"]
      },
      {
        id: "section-7",
        name: "Meet the team",
        selector: ".grid-image-accordion",
        style: null,
        blocks: ["cards-team"],
        defaultContent: [".text.uds-component .cmp-text"]
      },
      {
        id: "section-8",
        name: "Have a question CTA",
        selector: ".shape-bg-colour--primary-yellow",
        style: "yellow",
        blocks: [],
        defaultContent: [".text.uds-component .cmp-text", ".unsw-brand-button.uds-component"]
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
  var import_student_support_service_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
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
  return __toCommonJS(import_student_support_service_exports);
})();

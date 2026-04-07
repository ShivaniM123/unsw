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

  // tools/importer/import-staff-profile.js
  var import_staff_profile_exports = {};
  __export(import_staff_profile_exports, {
    default: () => import_staff_profile_default
  });

  // tools/importer/parsers/hero-profile.js
  function parse(element, { document }) {
    const profileImg = element.querySelector("img.profile-image");
    const contentWrapper = document.createElement("div");
    const heading = element.querySelector("h1.profile-heading");
    if (heading) contentWrapper.append(heading);
    const titleContainer = element.querySelector(".heading-title-container > .profile-title");
    if (titleContainer) {
      const p = document.createElement("p");
      p.textContent = titleContainer.textContent.trim();
      contentWrapper.append(p);
    }
    const qualDivs = element.querySelectorAll(".heading-text-container > .profile-title");
    if (qualDivs.length > 0) {
      const qualP = qualDivs[0].querySelector("p");
      if (qualP) contentWrapper.append(qualP);
    }
    const faculty = element.querySelector(".faculty-title");
    if (faculty) {
      const p = document.createElement("p");
      p.textContent = faculty.textContent.trim();
      contentWrapper.append(p);
    }
    if (qualDivs.length > 1) {
      const schoolText = qualDivs[qualDivs.length - 1].textContent.trim();
      const p = document.createElement("p");
      p.textContent = schoolText;
      contentWrapper.append(p);
    }
    const socialLinks = element.querySelectorAll(".uds-social-follow .list a");
    if (socialLinks.length > 0) {
      const socialP = document.createElement("p");
      socialLinks.forEach((link, i) => {
        if (i > 0) socialP.append(" ");
        socialP.append(link);
      });
      contentWrapper.append(socialP);
    }
    const cells = [];
    if (profileImg) cells.push([profileImg]);
    cells.push([contentWrapper]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-profile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  function parse2(element, { document }) {
    const isReadMore = element.classList.contains("read-more");
    const isPropertyTiles = element.classList.contains("propertytiles");
    if (isPropertyTiles) {
      element.remove();
      return;
    }
    const col1 = document.createElement("div");
    const fullText = element.querySelector(".full-text");
    const truncatedText = element.querySelector(".truncated-text");
    const bioSource = fullText || truncatedText;
    if (bioSource) {
      const paragraphs = bioSource.querySelectorAll("p");
      paragraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text && text !== "\xA0") {
          col1.append(p);
        }
      });
    }
    const col2 = document.createElement("div");
    const parent = element.closest(".aem-Grid") || element.parentElement;
    const tilesEl = parent ? parent.querySelector(".propertytiles") : null;
    if (tilesEl) {
      const tiles = tilesEl.querySelectorAll(".property-tile");
      tiles.forEach((tile) => {
        const titleEl = tile.querySelector(".title");
        const textEl = tile.querySelector(".text");
        if (titleEl && textEl) {
          const h3 = document.createElement("h3");
          h3.textContent = titleEl.textContent.trim();
          col2.append(h3);
          const p = document.createElement("p");
          p.textContent = textEl.textContent.trim();
          col2.append(p);
        }
      });
      tilesEl.remove();
    }
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-research.js
  function parse3(element, { document }) {
    const tabLabels = Array.from(element.querySelectorAll(".cmp-tabs__tablist .cmp-tabs__tab .tab-control, .cmp-tabs__tablist .cmp-tabs__tab.cmp-tabs__tab--active .tab-control"));
    const tabPanels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    const cells = [];
    tabLabels.forEach((label, i) => {
      const labelText = label.textContent.trim();
      if (!labelText) return;
      const panel = tabPanels[i];
      const contentDiv = document.createElement("div");
      if (panel) {
        const accordionItems = panel.querySelectorAll(".accordion-list-item");
        if (accordionItems.length > 0) {
          accordionItems.forEach((item) => {
            const headingEl = item.querySelector(".accordion-item-heading");
            const contentEl = item.querySelector(".accordion-content");
            if (headingEl) {
              const h3 = document.createElement("h3");
              h3.textContent = headingEl.textContent.trim();
              contentDiv.append(h3);
            }
            if (contentEl) {
              const pubItems = contentEl.querySelectorAll(".publication-item");
              if (pubItems.length > 0) {
                pubItems.forEach((pub) => {
                  const titleEl = pub.querySelector(".publication-title, h4, h3, .title");
                  const detailsEl = pub.querySelector(".publication-details, .details, p");
                  if (titleEl) {
                    const p = document.createElement("p");
                    p.innerHTML = "<strong>" + titleEl.textContent.trim() + "</strong>";
                    contentDiv.append(p);
                  }
                  if (detailsEl && detailsEl !== titleEl) {
                    const p = document.createElement("p");
                    p.textContent = detailsEl.textContent.trim();
                    contentDiv.append(p);
                  }
                });
              } else {
                const paragraphs = contentEl.querySelectorAll("p, li, h3, h4");
                if (paragraphs.length > 0) {
                  paragraphs.forEach((p) => {
                    const text = p.textContent.trim();
                    if (text) contentDiv.append(p);
                  });
                } else {
                  const text = contentEl.textContent.trim();
                  if (text) {
                    const p = document.createElement("p");
                    p.textContent = text;
                    contentDiv.append(p);
                  }
                }
              }
            }
          });
        } else {
          const directContent = panel.querySelectorAll("p, li, h3, h4, table");
          directContent.forEach((el) => {
            const text = el.textContent.trim();
            if (text) contentDiv.append(el);
          });
        }
      }
      cells.push([labelText, contentDiv]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-research", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/unsw-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        ".onetrust-pc-dark-filter"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#page-analytics",
        "#category-analytics"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".background-shape-container"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        ".globalheader",
        ".site-header-new",
        "header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".globalfooter",
        "footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".breadcrumb",
        ".breadcrumbs",
        ".breadcrumbs-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".back-link",
        ".back-news-profile",
        ".sub-navigation"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".socialfollow"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/unsw-sections.js
  function transform2(hookName, element, payload) {
    if (hookName === "afterTransform") {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = section.selector;
        if (!selector) continue;
        const sectionEl = element.querySelector(selector);
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

  // tools/importer/import-staff-profile.js
  var parsers = {
    "hero-profile": parse,
    "columns-contact": parse2,
    "tabs-research": parse3
  };
  var PAGE_TEMPLATE = {
    name: "staff-profile",
    description: "Staff profile page with biographical information, contact details, research interests, and publications",
    urls: [
      "https://www.unsw.edu.au/staff/-keith--chee-ooi"
    ],
    blocks: [
      {
        name: "hero-profile",
        instances: [".profile-page-header"]
      },
      {
        name: "columns-contact",
        instances: [".text.uds-component.read-more", ".propertytiles"]
      },
      {
        name: "tabs-research",
        instances: [".tabs.uds-component"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Profile Hero",
        selector: ".profile-page-header",
        style: "yellow-accent",
        blocks: ["hero-profile"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Bio and Contact",
        selector: ".column-layout:has(.text.read-more)",
        style: null,
        blocks: ["columns-contact"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Research Tabs",
        selector: ".column-layout:has(.tabs)",
        style: null,
        blocks: ["tabs-research"],
        defaultContent: []
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
    return pageBlocks;
  }
  var import_staff_profile_default = {
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
  return __toCommonJS(import_staff_profile_exports);
})();

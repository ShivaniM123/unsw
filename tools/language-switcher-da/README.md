# Language switcher (DA library tool)

Document Authoring **library** tool — same behavior as the **DA Language Hopper** Chrome extension (`popup.js`, `shared.js`, `placeholders.js`), adapted for **da.live**:

- Reads **`placeholders.json`** and the **`language-switcher`** sheet (see [placeholders](https://docs.da.live/)): tries **`main--{repo}--{org}.aem.page`**, then **`actions.daFetch`** on **`admin.da.live/source/{org}/{repo}/placeholders.json`** if the preview request fails.
- Uses **`DA_SDK`**: `context.org`, `context.repo` (or `context.site`), and **`context.path`** (site-relative, e.g. `/en/staff/page`) to build the hash URL, then **`parseCurrentPage`**.
- **Open** uses `actions.setHref` (navigate the DA shell) and `actions.closeLibrary()`; **Open all** opens multiple tabs with `window.open`.

## Asset paths (`content.da.live` vs `aem.page`)

If the library **path** is a full `https://content.da.live/<org>/<repo>/tools/.../popup.html` URL, **do not** use root-absolute `/tools/...` links inside the HTML for CSS/JS — the browser would request `https://content.da.live/tools/...` (missing org/repo) and the script would **404**, leaving the dialog blank. This project uses **relative** `./popup.css` and `./popup.js` so it works on both `content.da.live` and `main--repo--org.aem.page`.

## Setup (library sheet)

Add a row under **Site CONFIG → library**:

| title | path | experience |
| ----- | ---- | ----------- |
| Language switcher | `/tools/language-switcher-da/popup.html` or `https://content.da.live/<org>/<repo>/tools/language-switcher-da/popup.html` | `dialog` |

Optional icon URL: `https://main--unsw--YOUR_ORG.aem.page/tools/language-switcher-da/` (add an SVG if you want).

## How Tags vs this tool differ

| Tags | Language switcher |
| ---- | ----------------- |
| Fetches `docs/library/tagging.json` via `daFetch` | Fetches published **`placeholders.json`** (HTTP from `.aem.page`) |
| Inserts text into the document with `sendText` | Navigates to another locale URL with `setHref` |
| Data: tag keys/labels | Data: locale columns mapping paths under `language-switcher` |

## Requirements

1. **`placeholders.json`** published with a **`language-switcher`** tab (same model as the extension).
2. **`context.path`** must include a **locale** segment as the first folder (e.g. `/en/staff/...` — DA gives site-relative paths; the tool prefixes `/<org>/<repo>` when building the hash URL).
3. **`SETTINGS`** in `popup.js` — adjust `tier` (`page` vs `live`), `branch`, `target` (`da-edit` vs preview-only), or sheet name if you renamed the tab.

## Files

- `popup.html` — shell + loads DA SDK and `popup.js`
- `popup.js` — orchestration (was Chrome `popup.js` logic)
- `popup.css` — styles (same as extension `popup.css`, slightly wider `max-width` for dialog)
- `shared.js` — URL parsing / `buildDaHashUrl` / `buildAemPreviewUrl` (+ `contextToDaUrl` for DA)
- `placeholders.js` — sheet parsing and `fetchLanguageSwitcherRows` (preview fetch + `daFetch` fallback)

# Language switcher (DA library tool)

Document Authoring **library** tool — same behavior as the **DA Language Hopper** Chrome extension, adapted for **da.live**:

- Reads **`/.da/translate-v2.json`** (the same config used by the Locales tool) via **`actions.daFetch`** from **`admin.da.live/source/{org}/{repo}/.da/translate-v2.json`**. The language list comes from `languages.data[]` rows (must contain `location` like `/en`, `/fr`).
- Uses **`DA_SDK`**: `context.org`, `context.repo` (or `context.site`), and **`context.path`** (site-relative, e.g. `/en/staff/page`) to build the hash URL, then **`parseCurrentPage`**.
- **Open page for selected language** opens the destination in a **new tab** via `window.open` and then `actions.closeLibrary()`. **Open all** opens multiple tabs with `window.open`.

## Library `path` (CONFIG sheet) — use a repo path, not `content.da.live`

In the DA **library** configuration ([setup library](https://docs.da.live/administrators/guides/setup-library#config-sheet)), the **`path`** column is a **path inside your connected site / GitHub repo**, not a browser URL you copy from the address bar.

**Correct — what to type in the sheet:**

| title | path | experience |
| ----- | ---- | ----------- |
| Language switcher | `/tools/language/popup.html` | `dialog` |

DA resolves that path for the current org/repo (e.g. `shivanim123` / `unsw`) when opening the tool. You do **not** enter `https://content.da.live/shivanim123/unsw/...` in **`path`**; that full URL is not how the library is meant to be configured and will not match how DA lists or loads tools.

**Wrong for this HTML tool:** `https://content.da.live/shivanim123/unsw/tools/language/popup.html`

That URL is **not** where Edge Delivery serves arbitrary repo files. **`content.da.live`** is used for **synced content** (pages, sheets, `docs/library/*.json`, etc.). Your **Blocks / Templates / Tags** rows point at **`…/docs/library/*.json`** on `content.da.live` because those JSON catalogs live there. A **library HTML tool** from the GitHub repo is instead loaded from your **preview host**:

`https://main--<repo>--<org>.aem.page/tools/language/popup.html`

For `shivanim123` / `unsw` (Helix order is **`main--{repo}--{org}`**):

`https://main--unsw--shivanim123.aem.page/tools/language/popup.html`

**Check:** paste that **`.aem.page`** URL in the browser. If it **404s**, the files are not on the **`main`** branch GitHub repo that Code Sync uses (or the path is wrong). Fix GitHub first; **`content.da.live/.../tools/.../popup.html` will never appear** for this setup — that is expected, not a bug in the tool.

**If your CONFIG sheet requires a full URL** for HTML tools (some teams do), use the **`.aem.page`** link above — **not** `content.da.live`.

Optional **icon** column: same preview origin, e.g. `https://main--unsw--shivanim123.aem.page/tools/language/some-icon.svg` (add an SVG in the repo if needed).

## Blank white dialog

If the library opens an **empty** panel after you set **`path`** to `popup.html`, it is often because the iframe has **no height** and percentage-based layout **collapsed**. This tool sets **`html` / `body` height and flex** in **`popup.css`** (including **`min-height: 200px`** on `html`) and loads scripts **at the end of `<body>`** so the shell still paints. Sync the latest `popup.html` / `popup.css` and try again.

## Inside `popup.html` (CSS / JS)

Use **relative** `./popup.css` and `./popup.js` so that when DA loads the tool from any host, assets stay under the same folder as `popup.html`. Do **not** use root-only paths like `/tools/.../popup.js` on `content.da.live` (they would miss `/shivanim123/unsw/`).

## How Tags vs this tool differ

| Tags | Language switcher |
| ---- | ----------------- |
| Fetches `docs/library/tagging.json` via `daFetch` | Fetches published **`placeholders.json`** (HTTP from `.aem.page`) |
| Inserts text into the document with `sendText` | Opens the locale URL in a **new tab** (`window.open`) |
| Data: tag keys/labels | Data: locale columns mapping paths under `language-switcher` |

## Requirements

1. **`/.da/translate-v2.json`** exists and contains a `languages` tab with `data` rows that include at least:
   - `name` (optional, used for display only)
   - `location` (required; e.g. `/en`, `/fr`)
   - `site` (optional; repo override for multi-site setups)
2. **`context.path`** must include a **language folder** as the first segment (e.g. `/en/staff/...`).
3. **`SETTINGS`** in `popup.js` — adjust `tier` (`page` vs `live`), `branch`, `target` (`da-edit` vs preview-only).

## Files

- `popup.html` — shell + loads DA SDK and `popup.js`
- `popup.js` — orchestration (was Chrome `popup.js` logic)
- `popup.css` — styles (same as extension `popup.css`, slightly wider `max-width` for dialog)
- `shared.js` — URL parsing / `buildDaHashUrl` / `buildAemPreviewUrl` (+ `contextToDaUrl` for DA)
- `placeholders.js` — sheet parsing and `fetchLanguageSwitcherRows` (preview fetch + `daFetch` fallback)

# DA Language Hopper

A library dialog for Adobe Document Authoring (DA) that switches between **localized pages** using the **`language-switcher`** sheet inside published **`placeholders.json`**. Language folders are driven by the sheet—nothing is hardcoded in the tool.

## Features

- **Sheet-driven languages**: Columns such as `en`, `fr`, `ko` come from the loaded `placeholders.json`; add a column and `/…` path values to support a new locale folder.
- **Smart path resolution**: Uses `language-switcher` rows first (longest matching base wins), then falls back to swapping the locale segment and keeping the same slug suffix when no row matches.
- **Source and destination URLs**: Shows the current document URL and the computed target URL with wrapping for long paths.
- **Open one or all**: Primary button opens the selected language in a **new tab** (same path as “Open all”). **Open all language pages** appears whenever there is **more than one** locale column so every other locale opens in its **own** tab.
- **Library context**: Reads DA SDK `context` (`org`, `repo` / `site`, `path`, `view`); if `path` is missing in the iframe, falls back to hash segments after `org/repo`.
- **Fetches placeholders**: Preview host (`main--{repo}--{org}.aem.page`), then optional `daFetch` to `admin.da.live/source/.../placeholders.json` per candidate folder.

## Usage

1. **Add the tool** under `tools/fondlangswitcher/` in your DA repo (`popup.html`, `popup.js`, `popup.css`, `placeholders.js`, `shared.js`).
2. **Publish `placeholders.json`** that includes a **`language-switcher`** tab (name configurable in `popup.js`). Columns are locale keys; cells are paths **starting with `/`** so the tool can detect columns:

   ```json
   {
     "language-switcher": {
       "data": [
         {
           "en": "/example-path-en",
           "fr": "/example-path-fr",
           "ko": "/example-path-ko"
         }
       ]
     }
   }
   ```

   - Column names must match **locale folder segments** in your URLs (e.g. `…/en/page`, `…/fr/page`).
   - Use additional rows when slugs differ per language; otherwise the tool may fall back to same slug under another folder.

3. **Register the tool** in site **_CONFIG_ → library** (see **Integration**).
4. **Open a localized page** in DA so the path includes `/{org}/{repo}/…/{locale}/…`.
5. **Open DA Language Hopper** from the Library. Confirm **Source URL**, pick another language if a dropdown appears, then **Open page for selected language** (or **Open all language pages** when available).

## File Overview

- `popup.html` – Shell, Spectrum styles, loads `popup.css` and `popup.js`.
- `popup.js` – DA SDK, UI state, open / open-all actions, cache for fetched rows.
- `popup.css` – Layout and DA-themed styling.
- `placeholders.js` – Fetch candidates for `placeholders.json`, parse `language-switcher`, path resolution helpers.
- `shared.js` – `contextToDaUrl`, `parseCurrentPage`, preview / DA hash URL builders.

## Integration

- **DA SDK**: Uses `https://da.live/nx/utils/sdk.js` for context and optional `daFetch`.
- **No build step**: Plain ES modules, CSS, and HTML.
- **Dependencies**: DA SDK only; browser must support modules, `fetch`, and `sessionStorage` (session cache for placeholder rows).

### Configuration

> Site _CONFIG_ > _library_

| title | path | icon | ref | format | experience |
| ----- | ---- | ---- | --- | ------ | ---------- |
| `DA Language Hopper` | `/tools/fondlangswitcher/popup.html` | | | | `dialog` |

Add an **icon** URL if you host a SVG under `tools/fondlangswitcher/` (optional). See [Setup library](https://docs.da.live/administrators/guides/setup-library#config-sheet).

## Customization

- **Styling**: Edit `popup.css` (panel border, buttons, URL blocks).
- **Sheet name / branch / tier**: Adjust `SETTINGS` in `popup.js` (`placeholderSheetName`, `branch`, `tier`, `placeholderCacheTtlMs`, etc.).
- **Labels / button text**: Edit `popup.html` and strings in `popup.js`.

## Development

- From the `unsw` package root: run **`npm run lint`** (ESLint / Stylelint as configured).
- ES modules and modern browser APIs only.

## Troubleshooting

- **Wrong languages listed** (e.g. only `en`, `fr`, `sp`): The first successfully loaded `placeholders.json` wins; a root-level file can hide a site-specific sheet. Align or remove conflicting files.
- **“No folder matches a language column”**: Add a column whose name matches the locale **folder segment** in the URL, with at least one `/…` path value in a row.
- **Source URL odd or empty**: Ensure `context.path` or the editor hash includes the full path after `org/repo`.
- **Stale UI after deploy**: Hard-refresh or append a cache-busting query on `popup.html` / `popup.js` in the library path.

## License

[MIT](../../../LICENSE) (or your project’s license)

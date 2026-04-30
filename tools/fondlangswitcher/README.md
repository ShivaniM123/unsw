# Fond language switcher (DA library tool)

Library dialog that opens **localized DA pages** using the **`language-switcher`** tab inside published **`placeholders.json`** (same model as the original DA Language Hopper flow).

## Data

- **`placeholders.json`** must include a sheet tab named **`language-switcher`** (configurable via `placeholderSheetName` in `popup.js`, default `language-switcher`).
- Columns are **locale keys** (`en`, `fr`, …); cell values are **paths starting with `/`** (path without the leading locale segment in the sheet model).
- Resolves **from → to** using `resolvePathWithRows` so slugs can differ per language (`/en/abc` ↔ `/fr/bnc` when the sheet maps them).

Load order: preview `placeholders.json` from **`main--{repo}--{org}.aem.page`**, then **`actions.daFetch`** on `admin.da.live/source/{org}/{repo}/placeholders.json` if preview fails.

## Library registration

| title | path | experience |
| ----- | ---- | ----------- |
| Fond language switcher | `/tools/fondlangswitcher/popup.html` | `dialog` |

See [setup library](https://docs.da.live/administrators/guides/setup-library#config-sheet).

## UI

Uses Spectrum tokens from `https://da.live/nx/public/sl/styles.css` plus `popup.css` (blue primary, gray surfaces).

## Files

| File | Role |
| ---- | ---- |
| `popup.html` | Shell + sl styles + `popup.css` / `popup.js` |
| `popup.js` | SDK, placeholders rows, open / open all |
| `placeholders.js` | Fetch + parse `language-switcher`, path resolution |
| `shared.js` | URL parsing, `buildDaHashUrl`, `contextToDaUrl` |
| `popup.css` | Layout and DA-themed colors |

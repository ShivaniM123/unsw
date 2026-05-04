# Fond language switcher (DA library tool)

Library dialog that opens **localized DA pages** using the **`language-switcher`** tab inside published **`placeholders.json`** (same model as the original DA Language Hopper flow).

## Data

- **`placeholders.json`** must include a sheet tab named **`language-switcher`** (configurable via `placeholderSheetName` in `popup.js`, default `language-switcher`).
- Columns are **locale keys** (`en`, `fr`, …); cell values are **paths starting with `/`** (path without the leading locale segment in the sheet model).
- Resolves **from → to** using the sheet first; if **no row matches** the current path (e.g. missing `/newsletter`), the tool **falls back** to the same slug under the target locale (`/fr/newsletter` → `/en/newsletter`). For **different slugs per language**, add a row to the sheet so the correct target path is used.

**Where it loads:** tries repo root `placeholders.json`, then each **prefix folder** of the current page path. Path is taken from **`context.path`** when set; if the Library iframe leaves it empty, it falls back to the **hash path after org/repo** (same segments as in the editor URL). If `context.path` includes `/{org}/{repo}/`, that prefix is stripped before probing. Uses the first response that has a usable **`language-switcher`** tab. Preview **`main--{repo}--{org}.aem.page`**, then **`daFetch`** on **`admin.da.live/source/{org}/{repo}/…/placeholders.json`** per candidate.

## Library registration

| title | path | experience |
| ----- | ---- | ----------- |
| Fond language switcher | `/tools/fondlangswitcher/popup.html` | `dialog` |

See [setup library](https://docs.da.live/administrators/guides/setup-library#config-sheet).

## Files

| File | Role |
| ---- | ---- |
| `popup.html` | Shell + sl styles + `popup.css` / `popup.js` |
| `popup.js` | SDK, placeholders rows, open / open all |
| `placeholders.js` | Fetch + parse `language-switcher`, path resolution |
| `shared.js` | URL parsing, `buildDaHashUrl`, `contextToDaUrl` |
| `popup.css` | Layout and DA-themed colors |

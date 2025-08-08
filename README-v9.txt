# Galaxy Map v9 drop-in

This package contains the **v9** canvas/visual updates as discussed:
- asymmetric regions (slim left / wide right) + Unknown Regions spillover
- region names/labels
- corrected ring thresholds so planets aren't all in Deep Core
- slower, smoother zoom with a bigger range
- grid numbers only at the OUTER edges of the page

## Files
- `app.v9.js` — the main script
- `style.v9.css` — minimal style additions (keeps your existing look)
- `README-v9.txt` — this file

## How to deploy (two options)

### A) Keep your current `index.html` as-is (no edits)
1. Rename files **before** copying:
   - `app.v9.js` → `app.v8.1.js`
   - `style.v9.css` → `style.v8.1.css`
2. Overwrite the existing files in your repo root.
3. Commit and push. GitHub Pages will redeploy automatically.

### B) Use versioned filenames
1. Copy `app.v9.js` and `style.v9.css` to your repo root.
2. Edit `index.html` and change the includes:
   ```html
   <link rel="stylesheet" href="style.v9.css">
   <script src="app.v9.js" defer></script>
   ```
3. Commit and push.

## Hooks / compatibility
- The script reads `window.PLANETS` and `window.ROUTES` if present.
- A tiny API is exposed on `window.__GALAXY_V9__`:
  - `setZoom(z)`
  - `setPan(x, y)`
  - `regionOf(x, y)`
  - `jumpTo(name)`

If you want me to wire your existing search/jump UI directly to this API in the repo, ping me and I’ll open a PR.

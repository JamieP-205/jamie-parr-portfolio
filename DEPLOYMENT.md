# Deployment Workflow

- Repository: `JamieP-205/jamie-parr-portfolio`
- Production branch: `main`
- Netlify site: `jamie-parr-portfolio`
- Production URL: `https://jamie-parr-portfolio.netlify.app`
- Base directory: repository root
- Build command: `npm run check:js && npm run check:site`
- Publish directory: `.`
- Functions: none

GitHub is the source of truth. Pull requests and non-production branches use deploy previews;
pushes to `main` deploy to the existing production site.

Before pushing, run `npm ci` and `npm test`. GitHub Actions owns the Chromium
suite; Netlify runs the browser-free JavaScript and structural checks before publishing.

The public CV is generated from `tools/build_cv.py`. Run it with the bundled Python
runtime (with ReportLab available), then copy `output/pdf/jamie_parr_public_cv.pdf`
to `assets/jamie_parr_public_cv.pdf` before testing and publishing.

Private CV variants, personal records, credentials
and local `.env` files must not be committed.

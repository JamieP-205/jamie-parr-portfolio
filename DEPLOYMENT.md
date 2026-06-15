# Deployment Workflow

- Repository: `JamieP-205/jamie-parr-portfolio`
- Production branch: `main`
- Netlify site: `jamie-parr-portfolio`
- Production URL: `https://jamie-parr-portfolio.netlify.app`
- Base directory: repository root
- Build command: `npm test`
- Publish directory: `.`
- Functions: none

GitHub is the source of truth. Pull requests and non-production branches use deploy previews;
pushes to `main` deploy to the existing production site.

Before pushing, run `npm ci` and `npm test`. Private CV variants, personal records, credentials
and local `.env` files must not be committed.

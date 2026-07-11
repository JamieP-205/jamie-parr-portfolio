# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

## Live site

The production portfolio is hosted on Netlify and can be viewed at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

## Status

**Live, actively maintained**  -  I add new case studies and refine the site as I progress through my Computing Technologies degree.

## Summary

I built this portfolio to present my studies, work experience, qualifications and live web and app projects in one accessible site. The codebase is intentionally framework free so that I can directly control accessibility, performance and progressive enhancement. Visitors can find clear evidence of real work and study, read project case studies that explain my decisions and access CV and certificate documents. Screenshots of the site are available on the live site or in the assets folder of this repository.

## What I built

- A responsive homepage covering my skills, education, employment and availability
- Detailed case studies for **Talk With Jamie**, **Local Web Fix** and **Coast Internet Radio** explaining scope, decisions and outcomes
- A featured Talk With Jamie case study covering authentication, serverless functions, storage, privacy boundaries and testing
- Reusable display preferences (dark/light mode, larger text and reduced motion) stored in localStorage
- A keyboard quick-navigation palette (press / or Ctrl+K) built with a plain accessible listbox
- A live panel in the hero showing the real Coast Internet Radio listener feed and my latest GitHub push
- A mobile navigation menu with keyboard support
- Social sharing metadata, a web manifest, sitemap, robots file and custom 404 page
- Automated checks for JavaScript syntax, required files, metadata, JSON and exact case local links

## Key files

- `index.html`  -  main portfolio content
- `styles.css`  -  layout, responsive design and themes
- `script.js`  -  navigation and display preferences
- `tools/check-site.js`  -  automated site validation

## Technical approach

The site uses semantic HTML, modern CSS and vanilla JavaScript. I deliberately avoided frameworks because this is a content focused project; a small static codebase gives me direct control over accessibility, performance and progressive enhancement. The site is deployed to Netlify from this repository with GitHub Actions verifying syntax and site structure on every push.

## Project structure

- `assets/`  -  CV, certificates and social preview images
- `index.html`  -  homepage and project overview
- `*-case-study.html`  -  individual project case study pages
- `styles.css` and `script.js`  -  presentation and interaction logic
- `tools/`  -  validation scripts used in CI and locally

## Local development

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks JavaScript syntax and validates the site's files and links before deployment.

## Privacy & security notes

The CV and certificate in `assets/` are the same public documents linked from the live portfolio. They do not contain a home address or phone number. `.env` files and other secrets are never committed. See [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## What I learned

Building this portfolio taught me that presenting work is as important as doing the work itself. I learned how much detail goes into a portfolio beyond just putting projects on a page: accessibility considerations, responsive layouts, metadata, file structure, link checking and keeping public documents safe. The process also reinforced the value of automated CI checks, even for static projects.

## Future improvements

- Add automated visual regression tests to catch unintended design changes
- Continue adding new case studies as I complete more projects
- Refine accessibility and performance budgets and document them in the case studies

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance and [LICENSE](LICENSE) for licensing details.

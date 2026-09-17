# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

Live at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

My portfolio carries my CV, education and work history and currently highlights two public projects: Coast Internet Radio and Local Web Fix.

## Why it is built this way

No framework. It is a small set of content pages, so plain HTML, CSS and JavaScript keep the site easy to understand, maintain and deploy.

## What is in it

- Profile and working-toolkit section
- Coast Internet Radio and Local Web Fix project summaries
- Detailed case studies for both projects
- Work experience, education, certification and placement focus
- Dark mode, larger text and reduced-motion preferences stored locally
- Quick navigation palette
- Sitemap, robots, manifest, social card and 404 page

## Files

- `index.html` homepage content
- `coast-internet-radio-case-study.html` Coast case study
- `local-web-fix-case-study.html` Local Web Fix case study
- `styles.css` base site styling
- `project-showcase.css` homepage project layout
- `project-evidence.css` supporting project styling
- `script.js` navigation, display preferences and palette
- `project-explorer.js` homepage project cleanup and portrait handling
- `tools/check-site.js` static checks used in CI
- `tools/smoke-site.js` browser smoke coverage

## Running it

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks the JavaScript, local links and metadata, then runs the homepage in a real browser across several viewport sizes.

## Known limitations

- Browser smoke coverage checks behaviour and horizontal overflow but does not compare screenshots pixel-for-pixel
- Live project details depend on public endpoints and fail quietly if those services are unavailable
- Larger layout changes still need a short manual pass in desktop and mobile browsers

## What is public in here

The CV and certificate in `assets/` are the same documents linked from the live site. No home address or phone number is included. `.env` files and secrets are not committed. Private reporting is covered in [SECURITY.md](SECURITY.md).

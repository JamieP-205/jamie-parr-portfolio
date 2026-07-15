# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

Live at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

My portfolio for software, web and game projects. The homepage uses one project desk rather than a long run of case-study cards: choose a project, read the short engineering summary, then open the build, source or longer case study where one exists.

## Why it is built this way

No framework. It is a small set of content pages, so plain HTML, CSS and JavaScript keep the accessibility, performance and interaction code visible. The project desk is progressive enhancement: every project remains readable without JavaScript, while the enhanced version shows one project at a time and supports keyboard navigation.

## What is in it

- A compact homepage covering placement focus, project work and background
- Six projects in an accessible tabbed project desk
- Detailed case studies for Talk With Jamie, Local Web Fix and Coast Internet Radio
- Display preferences for dark mode, larger text and reduced motion
- Quick navigation on `/` or `Ctrl+K`
- A live panel using the public Coast metadata feed and latest GitHub push
- Sitemap, robots, manifest, social card and 404 page

## Files

- `index.html` homepage and project desk content
- `*-case-study.html` detailed project pages
- `styles.css` shared site styling
- `project-showcase.css` homepage project desk and compact background layout
- `script.js` navigation, display preferences, palette and live data
- `project-desk.js` accessible tab behaviour and URL state
- `tools/check-site.js` structural checks used by CI

## Running it

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks both JavaScript files, then validates local links, required files, metadata and exact path casing.

## Known limitations

- No visual regression testing yet
- The live GitHub row uses the unauthenticated public API and can be rate limited
- The Coast row depends on the station metadata worker
- Groundwork is private, so the portfolio describes its architecture and checks rather than linking to a public build

## What is public

The CV and certificate in `assets/` are the same documents linked from the live site. No home address or phone number is included. Secrets and private source material are not committed. Private reporting is covered in [SECURITY.md](SECURITY.md).

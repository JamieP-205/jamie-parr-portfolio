# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

Live at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

My portfolio. It carries my CV, education and work history, then puts the projects with the strongest technical story first: The World Forgot Us, French for Life and Groundwork. Coast Internet Radio, Talk With Jamie and Local Web Fix follow as production and service work with real deployment constraints.

## Why it is built this way

No framework. It is a small set of content pages, so a build step and component tree would be tooling I do not need. Plain HTML, CSS and JavaScript means the accessibility and performance are mine to get right rather than something I inherit and hope about.

## What is in it

- Homepage covering skills, education, employment and placement focus
- Flagship project section for the technically strongest builds
- Production and service section for work used by real people
- Detailed case studies for Talk With Jamie, Local Web Fix and Coast Internet Radio
- Display preferences (dark mode, larger text, reduced motion) kept in localStorage
- Quick navigation palette on `/` or `Ctrl+K`
- A live panel in the hero pulling the real Coast listener count and my latest GitHub push
- Sitemap, robots, manifest, social card and 404 page

## Files

- `index.html` homepage
- `*-case-study.html` one per detailed case study
- `styles.css` base site styling
- `project-showcase.css` project hierarchy, evidence rows and responsive refinements
- `script.js` navigation, display preferences, palette and live panel
- `tools/check-site.js` the checks CI runs

## Running it

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks that the JavaScript parses, then walks every HTML file and validates the local links, required files and metadata.

It also checks the exact casing of every local path. Netlify's file system is case sensitive and Windows is not, so `Assets/Photo.JPG` works locally and 404s in production. That check catches it before deployment.

## Known limitations

- No visual regression testing. A CSS change can quietly break a layout because CI only checks structure
- The live panel calls the GitHub API unauthenticated, so it is rate limited per IP. It caches for ten minutes and fails silently rather than showing an error
- The Coast row depends on that station's metadata worker being available
- Groundwork is a private local project, so the portfolio documents its architecture and verification rather than linking to a public build

## What is public in here

The CV and certificate in `assets/` are the same documents linked from the live site. No home address or phone number is included. `.env` files and secrets are not committed. Private reporting is covered in [SECURITY.md](SECURITY.md).

## Next

- Add visual regression tests
- Add deeper case studies when the flagship projects have stable screenshots and externally tested releases

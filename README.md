# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

Live at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

My portfolio carries my CV, education and work history, then lets visitors inspect six projects from one compact workbench. The World Forgot Us, French for Life and Groundwork lead with the strongest technical stories; Coast Internet Radio, Talk With Jamie and Local Web Fix show production and service work with real deployment constraints.

## Why it is built this way

No framework. It is a small set of content pages, so a build step and component tree would be tooling I do not need. Plain HTML, CSS and JavaScript means the accessibility and performance are mine to get right rather than something I inherit and hope about.

The project workbench replaces six long stacked write-ups. The project index stays visible, one detailed panel is shown at a time, and the deeper engineering notes and limitations use native disclosure elements. All project information remains in the page and the no-JavaScript fallback simply shows every panel in order.

## What is in it

- Compact profile and working-toolkit section
- Six-project workbench with keyboard navigation and hash links
- Evidence rows, engineering notes and honest current limitations for every project
- Detailed case studies for Talk With Jamie, Local Web Fix and Coast Internet Radio
- Work experience, education, certification and placement focus
- Display preferences (dark mode, larger text, reduced motion) kept in localStorage
- Quick navigation palette on `/` or `Ctrl+K`
- Sitemap, robots, manifest, social card and 404 page

## Files

- `index.html` homepage and project content
- `*-case-study.html` one per detailed case study
- `styles.css` base site styling
- `project-showcase.css` compact homepage and project-workbench layout
- `script.js` navigation, display preferences, palette and live project details
- `project-explorer.js` project switching, hash state and keyboard controls
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
- The live project details call public endpoints and fail silently when those services are unavailable
- Groundwork is a private local project, so the portfolio documents its architecture and verification rather than linking to a public build
- The project workbench is tested structurally but still needs routine checks in real browsers after larger layout changes

## What is public in here

The CV and certificate in `assets/` are the same documents linked from the live site. No home address or phone number is included. `.env` files and secrets are not committed. Private reporting is covered in [SECURITY.md](SECURITY.md).

## Next

- Add visual regression tests for the homepage and case studies
- Add deeper case studies when the flagship projects have stable screenshots and externally tested releases

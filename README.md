# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

Live at [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/).

My portfolio. It carries my CV, education and work history, and a case study for each of the three projects I can talk about properly: Talk With Jamie, Local Web Fix and Coast Internet Radio. I keep adding to it as the degree goes on.

## Why it is built this way

No framework. It is four pages of content, so a build step and a component tree would be tooling I do not need. Plain HTML, CSS and JavaScript means the accessibility and the performance are mine to get right rather than something I inherit and hope about.

## What is in it

- Homepage covering skills, education, employment and what I am looking for
- Three case studies, one per project, about the decisions rather than the feature list
- Display preferences (dark mode, larger text, reduced motion) kept in localStorage
- Quick navigation palette on `/` or `Ctrl+K`. It is a plain listbox with virtual focus, nothing clever
- A live panel in the hero pulling the real Coast listener count and my latest GitHub push. Each row stays hidden if its feed is down
- Sitemap, robots, manifest, social card, 404 page

## Files

- `index.html` homepage
- `*-case-study.html` one per project
- `styles.css` everything visual, sectioned and commented
- `script.js` navigation, display preferences, palette, live panel
- `tools/check-site.js` the checks CI runs

## Running it

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks the JavaScript parses, then walks every HTML file and validates the local links, the required files and the metadata.

It also checks the exact casing of every local path. Netlify's file system is case sensitive and Windows is not, so `Assets/Photo.JPG` works on my machine and 404s in production. That check is there to catch it before the deploy does.

## Known limitations

- No visual regression testing. A CSS change can quietly break a layout and CI will not notice, because it only checks structure
- The live panel calls the GitHub API unauthenticated, so it is rate limited per IP. It caches for ten minutes in sessionStorage and fails silently rather than showing an error to a visitor
- The Coast row depends on that station's metadata worker being up, which is outside this repo

## What is public in here

The CV and certificate in `assets/` are the same documents linked from the live site. No home address, no phone number. `.env` files and secrets are not committed. Private reporting is in [SECURITY.md](SECURITY.md).

## Next

- Visual regression tests, so the design cannot drift without me knowing
- More case studies as I finish more projects

# Jamie Parr Portfolio

[![CI](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/JamieP-205/jamie-parr-portfolio/actions/workflows/ci.yml)

I built this portfolio to present my Computing Technologies studies, work experience, qualifications, and live web projects in one accessible site.

Live site: [jamie-parr-portfolio.netlify.app](https://jamie-parr-portfolio.netlify.app/)

## Project Goals

I wanted the site to be useful to recruiters without becoming a heavy portfolio template. My priorities were:

- clear evidence of real work and study
- project case studies that explain my decisions
- responsive layouts that work well on phones
- keyboard and screen-reader-friendly structure
- optional dark mode, larger text, and reduced motion
- fast static hosting with no unnecessary framework

## What I Built

- A responsive homepage covering my skills, education, employment, and availability
- Detailed case studies for Local Web Fix and Coast Internet Radio
- Reusable display preferences stored locally in the browser
- A mobile navigation menu with keyboard support
- Social sharing metadata, a web manifest, sitemap, robots file, and custom 404 page
- Automated checks for JavaScript syntax, required files, metadata, JSON, and exact-case local links

## Stack

- Semantic HTML
- Modern CSS
- Vanilla JavaScript
- Netlify static hosting
- GitHub Actions

I deliberately kept the project framework-free. It is a content-focused site, so a small static codebase gives me direct control over accessibility, performance, and progressive enhancement.

## Local Development

```bash
npm install
npm test
npx serve .
```

There is no build step. `npm test` checks JavaScript syntax and validates the site's files and links before deployment.

## Repository Notes

The CV and certificate in `assets/` are the same public documents linked from the live portfolio. They do not contain a home address or phone number.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance and [SECURITY.md](SECURITY.md) for private vulnerability reporting. Personal documents and visual assets remain all rights reserved under [LICENSE](LICENSE).

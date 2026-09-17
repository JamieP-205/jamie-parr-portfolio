#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const ignored = new Set([".git", "node_modules"]);
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignored.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function exactPathExists(target) {
  const absolute = path.resolve(target);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    const entries = fs.readdirSync(current);
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

const files = walk(root);
for (const file of files.filter((item) => item.endsWith(".json"))) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`${path.relative(root, file)} contains invalid JSON: ${error.message}`); }
}

for (const file of files.filter((item) => /\.html?$/i.test(item))) {
  const source = fs.readFileSync(file, "utf8");
  if (!/<title>.+<\/title>/is.test(source)) errors.push(`${path.relative(root, file)} is missing a title`);
  if (!/<meta\s+name=["']description["']/i.test(source)) errors.push(`${path.relative(root, file)} is missing a description`);

  for (const match of source.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    const reference = match[1];
    if (/^(?:[a-z]+:|\/\/)/i.test(reference)) continue;
    let target = reference.startsWith("/")
      ? path.join(root, reference.slice(1))
      : path.resolve(path.dirname(file), reference);
    if (reference.endsWith("/")) target = path.join(target, "index.html");
    if (!exactPathExists(target)) errors.push(`${path.relative(root, file)} references missing or case-mismatched file: ${reference}`);
  }
}

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const projectCards = Array.from(homepage.matchAll(/<article\b[^>]*class=["'][^"']*\bsimple-project\b[^"']*["']/gi));

if (projectCards.length !== 6) errors.push(`index.html should contain 6 simple project cards, found ${projectCards.length}`);
if (/data-project-explorer|data-project-trigger|data-project-panel|project-explorer\.js/i.test(homepage)) {
  errors.push("index.html still contains the old project workbench");
}
if (!/class=["'][^"']*\bstar-photo\b/i.test(homepage)) errors.push("index.html is missing the hero portrait");
if (!/raw\.githubusercontent\.com\/JamieP-205\/local-web-fix\/eaf1535aaab003c0e36662977c4f8933edb95995\/assets\/jamie-parr\.webp/i.test(homepage)) {
  errors.push("hero portrait is not the verified suit photo");
}
if (!/portfolio-refresh\.css/i.test(homepage)) errors.push("portfolio-refresh.css is not loaded");

for (const required of ["index.html", "404.html", "robots.txt", "sitemap.xml", "site.webmanifest", "netlify.toml", "portfolio-refresh.css"]) {
  const file = path.join(root, required);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) errors.push(`${required} is missing or empty`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Portfolio site validation passed: simple projects, suit portrait and required files are present.");

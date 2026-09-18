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
  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, file)} contains invalid JSON: ${error.message}`);
  }
}

for (const file of files.filter((item) => /\.html?$/i.test(item))) {
  const source = fs.readFileSync(file, "utf8");
  if (!/<title>.+<\/title>/is.test(source)) errors.push(`${path.relative(root, file)} is missing a title`);
  if (!/<meta\s+name=["']description["']/i.test(source)) errors.push(`${path.relative(root, file)} is missing a description`);

  for (const match of source.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)) {
    const reference = match[1];
    if (/^(?:[a-z]+:|\/\/|data:)/i.test(reference)) continue;
    let target = reference.startsWith("/")
      ? path.join(root, reference.slice(1))
      : path.resolve(path.dirname(file), reference);
    if (reference.endsWith("/")) target = path.join(target, "index.html");
    if (!exactPathExists(target)) {
      errors.push(`${path.relative(root, file)} references missing or case-mismatched file: ${reference}`);
    }
  }
}

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
const projectPanels = Array.from(homepage.matchAll(
  /<article\b[^>]*data-project-panel=["']([^"']+)["'][^>]*>([\s\S]*?)<\/article>/gi
));
const panelIds = projectPanels.map((match) => match[1]);
const expectedPanels = ["coast-internet-radio", "local-web-fix"];

if (!/<link\s+rel=["']stylesheet["']\s+href=["']project-evidence\.css["']\s*>/i.test(homepage)) {
  errors.push("index.html must load project-evidence.css");
}
if (!/<link\s+rel=["']stylesheet["']\s+href=["']placement-refresh\.css["']\s*>/i.test(homepage)) {
  errors.push("index.html must load placement-refresh.css");
}
if (!/<script\s+src=["']enhancements\.js["']><\/script>/i.test(homepage)) {
  errors.push("index.html must load enhancements.js");
}
if (!/id=["']skills["']/i.test(homepage) || !/Technical skills/i.test(homepage)) {
  errors.push("index.html is missing the technical-skills section");
}
if (projectPanels.length !== 2 || expectedPanels.some((id) => !panelIds.includes(id))) {
  errors.push("index.html must contain only Coast Internet Radio and Local Web Fix project panels");
}
for (const retired of ["the-world-forgot-us", "french-for-life", "groundwork", "talk-with-jamie"]) {
  if (homepage.toLowerCase().includes(retired)) {
    errors.push(`index.html still contains retired project reference: ${retired}`);
  }
}
if (/project-stage-media/i.test(homepage)) {
  errors.push("index.html should not contain project artwork containers");
}
if (/\bportrait\b/i.test(homepage)) {
  errors.push("index.html should not contain the retired portrait layout");
}
if (!/data-lava-toggle/i.test(homepage)) {
  errors.push("index.html is missing the Lava lampe easter-egg toggle");
}
if (!/not currently an active business/i.test(homepage)) {
  errors.push("Local Web Fix must be described as a portfolio concept, not an active business");
}

const cvPath = path.join(root, "assets", "jamie_parr_public_cv.pdf");
if (!fs.existsSync(cvPath)) {
  errors.push("downloadable CV is missing");
} else {
  const cv = fs.readFileSync(cvPath);
  const cvText = cv.toString("latin1");
  if (cv.length < 6000 || !cv.subarray(0, 5).equals(Buffer.from("%PDF-")) || !cvText.includes("JAMIE PARR") || !cvText.trimEnd().endsWith("%%EOF")) {
    errors.push("downloadable CV is not a complete readable PDF containing Jamie Parr's CV");
  }
}

for (const caseFile of ["coast-internet-radio-case-study.html", "local-web-fix-case-study.html"]) {
  const source = fs.readFileSync(path.join(root, caseFile), "utf8");
  if (!/class=["'][^"']*\bcase-page\b/i.test(source)) {
    errors.push(`${caseFile} is missing the refreshed case-page layout`);
  }
  if (!/<link\s+rel=["']stylesheet["']\s+href=["']project-showcase\.css["']\s*>/i.test(source)) {
    errors.push(`${caseFile} must load project-showcase.css`);
  }
  if (!/<link\s+rel=["']stylesheet["']\s+href=["']placement-refresh\.css["']\s*>/i.test(source)) {
    errors.push(`${caseFile} must load placement-refresh.css`);
  }
  if (!/<script\s+src=["']enhancements\.js["']><\/script>/i.test(source)) {
    errors.push(`${caseFile} must load enhancements.js`);
  }
  if (!/<script\s+src=["']case-gallery\.js["']><\/script>/i.test(source)) {
    errors.push(`${caseFile} must load case-gallery.js`);
  }
  if ((source.match(/data-case-slide/g) || []).length !== 3) {
    errors.push(`${caseFile} must contain exactly three current project screenshots`);
  }
  if (!/data-lava-toggle/i.test(source)) {
    errors.push(`${caseFile} is missing the Lava lampe toggle`);
  }
}

for (const required of [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "netlify.toml",
  "enhancements.js",
  "case-gallery.js",
  "placement-refresh.css"
]) {
  const file = path.join(root, required);
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) errors.push(`${required} is missing or empty`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log("Portfolio site validation passed.");

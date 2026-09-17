#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const target = path.resolve(root, relativePath);
    const relative = path.relative(root, target);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(target, (error, body) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500).end();
        return;
      }
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": contentTypes[path.extname(target).toLowerCase()] || "application/octet-stream"
      });
      response.end(body);
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function run() {
  const failures = [];
  const { server, baseUrl } = await startServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));

    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

    if (await page.locator(".simple-project").count() !== 6) failures.push("expected six simple project cards");
    if (await page.locator("[data-project-explorer]").count() !== 0) failures.push("old workbench is still present");
    if (await page.locator(".star-photo").count() !== 1) failures.push("hero suit portrait is missing");

    const src = await page.locator(".star-photo").getAttribute("src");
    if (!src || !src.includes("raw.githubusercontent.com/JamieP-205/local-web-fix/eaf1535aaab003c0e36662977c4f8933edb95995/assets/jamie-parr.webp")) {
      failures.push("hero portrait is not the verified suit photo");
    }

    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) failures.push(`homepage overflows horizontally at ${width}px`);
    }

    if (failures.length) throw new Error(failures.map((item) => `- ${item}`).join("\n"));
    console.log("Portfolio browser smoke passed: suit portrait, six simple projects and 320-1280px layouts.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

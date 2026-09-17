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
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405).end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    } catch {
      response.writeHead(400).end();
      return;
    }

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
      response.end(request.method === "HEAD" ? undefined : body);
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

function launchOptions() {
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    return { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH };
  }
  if (process.platform === "win32" && !process.env.CI) return { channel: "msedge" };
  return {};
}

async function run() {
  const failures = [];
  const browserErrors = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const { server, baseUrl } = await startServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true, ...launchOptions() });
    const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1280, height: 900 }
    });

    await context.route("https://api.github.com/**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]"
    }));
    await context.route("https://coast-metadata.jamieparr05.workers.dev/**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ online: true, listeners: 3, title: "Smoke test track" })
    }));

    const page = await context.newPage();
    page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (text.includes("net::ERR_INVALID_URL")) return;
      browserErrors.push(`console: ${text}`);
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });

    check(await page.locator('link[href="project-evidence.css"]').count() === 1,
      "project evidence stylesheet is not linked in the document");
    check(await page.locator('script[src="enhancements.js"]').count() === 1,
      "enhancements.js is not loaded on the homepage");
    check(await page.locator("[data-project-panel]").count() === 2,
      "only Coast Internet Radio and Local Web Fix should remain");

    for (const id of ["the-world-forgot-us", "french-for-life", "groundwork", "talk-with-jamie"]) {
      check(await page.locator(`#project-${id}`).count() === 0,
        `${id} should not be present on the portfolio`);
    }

    check(await page.locator(".project-stage-media").count() === 0,
      "project artwork should be removed from the portfolio");
    check((await page.locator(".projects-intro h2").textContent())?.trim() === "Selected public projects.",
      "projects heading was not updated");
    check(await page.locator('.hero-aside').count() === 0,
      "the portrait area should be removed, not hidden");

    const repoLink = page.getByRole('link', { name: 'View public repositories' });
    check(await repoLink.count() === 1, "public repositories link is missing");
    const repoLinkStyle = await repoLink.evaluate((element) => ({
      decoration: getComputedStyle(element).textDecorationLine,
      border: getComputedStyle(element).borderTopWidth,
      parentBorder: getComputedStyle(element.parentElement).borderTopWidth,
      parentBackground: getComputedStyle(element.parentElement).backgroundColor
    }));
    check(!repoLinkStyle.decoration.includes('underline'),
      "public repositories link should not be underlined");
    check(repoLinkStyle.border === '0px' && repoLinkStyle.parentBorder === '0px',
      "public repositories link should not sit inside a boxed CTA");

    const lava = page.getByRole('button', { name: 'Lava lampe' });
    check(await lava.count() === 1, "Lava lampe toggle is missing");
    await lava.click({ force: true });
    check(await page.locator('html[data-lava="on"]').count() === 1,
      "Lava lampe toggle did not enable the background effect");
    await lava.click({ force: true });
    check(await page.locator('html[data-lava]').count() === 0,
      "Lava lampe toggle did not switch off cleanly");

    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
      const layout = await page.evaluate(() => ({
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      }));
      check(layout.scrollWidth <= layout.viewportWidth + 1,
        `homepage overflows horizontally at ${width}px`);
    }

    for (const casePath of [
      '/coast-internet-radio-case-study.html',
      '/local-web-fix-case-study.html'
    ]) {
      await page.goto(`${baseUrl}${casePath}`, { waitUntil: 'networkidle' });
      check(await page.locator('body.case-page').count() === 1,
        `${casePath} is not using the refreshed case-page design`);
      check(await page.locator('link[href="project-showcase.css"]').count() === 1,
        `${casePath} is missing the shared black/white/purple theme`);
      check(await page.getByRole('button', { name: 'Lava lampe' }).count() === 1,
        `${casePath} is missing the Lava lampe toggle`);
      const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
      check(accent === '#7c3aed', `${casePath} is not using the purple accent palette`);
    }

    const noScript = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 }
    });
    const fallbackPage = await noScript.newPage();
    await fallbackPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    check(await fallbackPage.locator("[data-project-panel]").count() === 2,
      "the no-JavaScript page should contain only two projects");
    check(await fallbackPage.locator("[data-project-panel]:visible").count() === 2,
      "both public projects should remain visible without JavaScript");
    check(await fallbackPage.locator('.hero-aside').count() === 0,
      "the portrait area should remain absent without JavaScript");
    await noScript.close();

    if (browserErrors.length) failures.push(...browserErrors);
    if (failures.length) throw new Error(failures.map((item) => `- ${item}`).join("\n"));
    console.log("Portfolio browser smoke passed: refreshed case studies, unboxed repository link, lava mode and responsive layouts.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

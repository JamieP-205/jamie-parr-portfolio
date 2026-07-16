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
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
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

    await context.addInitScript(() => {
      const original = Element.prototype.scrollIntoView;
      window.__portfolioScrollCalls = [];
      Element.prototype.scrollIntoView = function (options) {
        window.__portfolioScrollCalls.push({
          target: this.matches?.("[data-project-explorer]") ? "workbench" : "other",
          behavior: typeof options === "object" ? options.behavior || "" : ""
        });
        return original.call(this, options);
      };
    });

    const events = [{
      type: "PushEvent",
      repo: { name: "JamieP-205/coast-internet-radio" },
      payload: {
        commits: [{
          message: "Keep the owner controls working after a CSP update",
          sha: "0123456789abcdef"
        }]
      },
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }];

    await context.route("https://api.github.com/**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(events)
    }));
    await context.route("https://coast-metadata.jamieparr05.workers.dev/**", (route) => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ online: true, listeners: 3, title: "Smoke test track" })
    }));

    const page = await context.newPage();
    page.on("pageerror", (error) => browserErrors.push(`page: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    check(await page.locator('link[href="project-evidence.css"]').count() === 1,
      "project evidence stylesheet is not linked in the document");
    check(await page.locator(".decision-trace").count() === 6,
      "all six project decision traces should exist before enhancement");
    check(await page.locator("[data-project-panel][hidden]").count() === 5,
      "the enhanced workbench should show exactly one project");

    const frenchTrigger = page.locator('[data-project-trigger="french-for-life"]');
    await frenchTrigger.click();
    check(new URL(page.url()).hash === "#project-french-for-life",
      "clicking a project did not update the hash");
    check(await page.locator('[data-project-panel="french-for-life"]:not([hidden])').count() === 1,
      "clicking French for Life did not show its panel");

    await frenchTrigger.focus();
    await page.keyboard.press("ArrowRight");
    check(await page.locator('[data-project-trigger="groundwork"]').getAttribute("aria-current") === "true",
      "arrow-key navigation did not select the next project");

    await page.locator("[data-project-explorer]").scrollIntoViewIfNeeded();
    await page.keyboard.press("6");
    check(await page.locator('[data-project-trigger="local-web-fix"]').getAttribute("aria-current") === "true",
      "number-key navigation did not select the sixth project");

    const ledger = page.locator(".build-ledger:not([hidden])");
    await ledger.waitFor();
    await ledger.locator(".build-ledger-repo a").click();
    check(new URL(page.url()).hash === "#project-coast-internet-radio",
      "the build ledger did not open its matching project");
    const workbenchScrolls = await page.evaluate(() =>
      window.__portfolioScrollCalls.filter((call) => call.target === "workbench")
    );
    check(workbenchScrolls.at(-1)?.behavior === "auto",
      "project navigation should avoid smooth scrolling when reduced motion is requested");

    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
      await page.evaluate(() => new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
      const layout = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = Array.from(document.querySelectorAll("body *"))
          .map((element) => ({ element, rect: element.getBoundingClientRect() }))
          .filter(({ rect }) => rect.width > 0 && (rect.right > viewportWidth + 1 || rect.left < -1))
          .slice(0, 6)
          .map(({ element, rect }) => {
            const name = element.id ? `#${element.id}`
              : `.${Array.from(element.classList).slice(0, 2).join(".")}`;
            return `${element.tagName.toLowerCase()}${name} [${Math.round(rect.left)}, ${Math.round(rect.right)}]`;
          });
        return {
          overflow: document.documentElement.scrollWidth > viewportWidth,
          offenders
        };
      });
      check(!layout.overflow,
        `homepage overflows horizontally at ${width}px: ${layout.offenders.join(", ") || "unknown element"}`);
    }

    const noScript = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 }
    });
    const fallbackPage = await noScript.newPage();
    await fallbackPage.goto(baseUrl, { waitUntil: "domcontentloaded" });
    check(await fallbackPage.locator("[data-project-panel][hidden]").count() === 0,
      "the no-JavaScript fallback should leave every project available");
    check(await fallbackPage.locator(".decision-trace").count() === 6,
      "decision evidence should remain available without JavaScript");
    await noScript.close();

    if (browserErrors.length) failures.push(...browserErrors);
    if (failures.length) throw new Error(failures.map((item) => `- ${item}`).join("\n"));
    console.log("Portfolio browser smoke passed: workbench, evidence, ledger, reduced motion, no-JS fallback and 320–1280px layouts.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

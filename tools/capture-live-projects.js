#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outDir = path.join(process.cwd(), 'tmp', 'live-project-screenshots');
fs.mkdirSync(outDir, { recursive: true });

async function settle(page, ms = 1200) {
  await page.waitForTimeout(ms);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function captureViewport(page, selector, filename) {
  const target = page.locator(selector).first();
  await target.waitFor({ state: 'visible', timeout: 15000 });
  await target.scrollIntoViewIfNeeded();
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const desired = Math.max(0, top - Math.max(88, (window.innerHeight - Math.min(rect.height, window.innerHeight)) / 2));
    window.scrollTo({ top: desired, behavior: 'instant' });
  }, selector);
  await settle(page, 450);
  await page.screenshot({ path: path.join(outDir, filename), fullPage: false });
}

async function captureCoast(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    localStorage.setItem('coast-a11y', JSON.stringify({ theme: 'light', text: 'default', contrast: 'default', font: 'default', motion: 'reduced' }));
  });
  const page = await context.newPage();
  await page.goto('https://coastinternetradio.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await settle(page);

  const anonymous = page.getByRole('button', { name: /just anonymous/i });
  if (await anonymous.count()) {
    await anonymous.first().click({ timeout: 5000 }).catch(() => {});
    await settle(page, 350);
  }

  await captureViewport(page, '#listen', 'coast-listen.png');
  await captureViewport(page, '#schedule', 'coast-schedule.png');
  await captureViewport(page, '#about', 'coast-about.png');
  await context.close();
}

async function captureLocalWebFix(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => localStorage.setItem('local-web-fix-theme', 'light'));
  const page = await context.newPage();
  await page.goto('https://localwebfix.co.uk/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await settle(page);
  await captureViewport(page, '.hero', 'local-web-fix-hero.png');
  await captureViewport(page, '#pricing', 'local-web-fix-pricing.png');
  await captureViewport(page, '#access', 'local-web-fix-access.png');
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await captureCoast(browser);
    await captureLocalWebFix(browser);
  } finally {
    await browser.close();
  }
  console.log(`Saved screenshots to ${outDir}`);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

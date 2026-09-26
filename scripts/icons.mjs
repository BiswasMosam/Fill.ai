// Renders the Fill.ai mark to the PNG sizes Chrome wants, using the local
// Chrome in headless mode. Run once after changing the mark:
//   node scripts/icons.mjs
//
// The mark: a field being filled in ink. An ink-blue answer sits on the
// field's line with the text cursor just after it, mid-sentence. Blue is
// what Fill.ai writes; the bone line and cursor are the form. The same
// shapes are drawn by logo() in src/content/panel.js and site/favicon.svg.
import { writeFileSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { chromePath } from '../test/e2e/chrome.mjs';

// At 16px everything thin gets thicker, or it disappears into the toolbar.
export const mark = (size = 24) => {
  const small = size <= 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
<rect width="24" height="24" rx="6" fill="#0e0e10"/>
<rect x="4.5" y="${small ? 9 : 9.5}" width="11" height="${small ? 6 : 5}" fill="#4f63ff"/>
<rect x="${small ? 16.7 : 17}" y="8" width="${small ? 2.4 : 1.8}" height="8" fill="#f0efe9"/>
<rect x="4.5" y="${small ? 16.5 : 16.8}" width="15" height="${small ? 2.4 : 1.7}" fill="#f0efe9"/>
</svg>`;
};

const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
const page = await browser.newPage();
for (const size of [16, 32, 48, 128]) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${mark(size)}</body></html>`);
  await page.screenshot({ path: `static/icons/icon${size}.png`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
writeFileSync('site/favicon.svg', mark().replace(/ width="24" height="24" viewBox/, ' viewBox'));
console.log('icons written to static/icons/ and site/favicon.svg');

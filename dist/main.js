import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';
// Launch the browser and open a new blank page
const browser = await puppeteer.launch();
const page = await browser.newPage();
// Navigate the page to a URL.
await page.goto('https://miro.com/app/dashboard/');
// Set screen size.
await page.setViewport({ width: 1080, height: 1024 });
await page.waitForSelector('loggedin', { timeout: 120000 });
await browser.close();

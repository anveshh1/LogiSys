import { chromium } from 'playwright';

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  console.log("Browser launched successfully!");
  const page = await browser.newPage();
  console.log("Navigating to http://localhost:5173...");
  try {
    await page.goto('http://localhost:5173', { timeout: 10000 });
    const title = await page.title();
    console.log(`Page title: ${title}`);
  } catch (err) {
    console.error("Navigation failed:", err.message);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);

import { chromium } from 'playwright';
import path from 'path';

async function runTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Navigating to login page...');
  try {
    await page.goto('http://[::1]:5173/login');
  } catch (e) {
    console.log('IPv6 loopback failed, trying localhost...');
    await page.goto('http://localhost:5173/login');
  }
  
  await page.waitForSelector('input[type="email"]');
  
  console.log('Logging in as mechanic...');
  await page.fill('input[type="email"]', 'mechanic@anm.co.za');
  await page.fill('input[type="password"]', 'mechPassword123');
  
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirection to /my-jobs...');
  await page.waitForURL('**/my-jobs');
  await page.waitForSelector('h1:has-text("My Jobs")');
  
  // Wait for loading to finish
  await page.waitForTimeout(2000);
  
  console.log('Extracting dashboard details...');
  const jobs = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.premium-card, div.border.border-border')); // Support both card selectors if design changed
    return cards.map(card => {
      const spans = Array.from(card.querySelectorAll('span, p, h2, h3'));
      const textContent = spans.map(s => s.textContent.trim());
      return { text: textContent.join(' | ') };
    });
  });
  console.log('Jobs on page:', jobs);

  // Click on the first job card to navigate to ticket details
  console.log('Clicking on the first job card...');
  const jobCard = await page.locator('.premium-card, div.border.border-border').first();
  await jobCard.click();

  console.log('Waiting for redirection to ticket detail page...');
  await page.waitForURL('**/tickets/*');
  
  console.log('Detail page loaded. Waiting for ticket details...');
  await page.waitForSelector('h1:has-text("Job Card:")');
  await page.waitForTimeout(2000); // Wait for API fetch to finish

  console.log('Extracting details from Ticket Detail page...');
  const details = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const data = {};
    
    spans.forEach(span => {
      const text = span.textContent.trim().toUpperCase();
      const nextEl = span.nextElementSibling;
      
      if (text.includes('CUSTOMER NAME')) {
        data.customerName = nextEl ? nextEl.textContent.trim() : 'MISSING';
      } else if (text.includes('VEHICLE REGISTRATION')) {
        data.vehicleRegistration = nextEl ? nextEl.textContent.trim() : 'MISSING';
      } else if (text.includes('MAKE & MODEL')) {
        data.makeModel = nextEl ? nextEl.textContent.trim() : 'MISSING';
      } else if (text.includes('YEAR')) {
        data.year = nextEl ? nextEl.textContent.trim() : 'MISSING';
      }
    });
    
    return data;
  });

  console.log('Extracted Details:', JSON.stringify(details, null, 2));

  const screenshotPath = path.resolve('C:/Users/User/.gemini/antigravity-cli/brain/d48bab9a-7de6-483f-be41-363477bfdce7/mechanic_detail.png');
  console.log(`Taking screenshot to: ${screenshotPath}`);
  await page.screenshot({ path: screenshotPath });
  
  await browser.close();
  console.log('Test completed successfully.');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

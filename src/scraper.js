import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { default as ProxyChain } from 'proxy-chain';

puppeteer.use(StealthPlugin());

const proxies = [
  'http://username:password@proxy1:port',
  'http://username:password@proxy2:port',
  // Add more proxies as needed
];

async function scrapeCars() {
  const browser = await puppeteer.launch({ headless: false });
  const results = [];

  for (let proxy of proxies) {
    const oldProxyUrl = proxy;
    const newProxyUrl = await ProxyChain.anonymizeProxy(oldProxyUrl);

    const page = await browser.newPage();
    await page.authenticate({
      username: 'username',
      password: 'password'
    });

    await page.goto('https://www.cargurus.com/Cars/searchPage.action?shopByTypes=MIX&searchId=3cf29447-8903-4e08-b611-d72b08aeb60d&distance=100&entitySelectingHelper.selectedEntity=m3&sourceContext=untrackedExternal_false_0&inventorySearchWidgetType=AUTO&sortDir=ASC&sortType=BEST_MATCH&srpVariation=SEO_PAGE&nonShippableBaseline=9557&pageReceipt=eyJwYWdlQWxpZ25tZW50IjpbMjIsMjJdLCJzZWVuU3BvbnNvcmVkTGlzdGluZ0lkcyI6W119&pageNumber=2&filtersModified=true', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('.listings-container');

    const cars = await page.evaluate(() => {
      const listings = Array.from(document.querySelectorAll('.listing-row'));
      return listings.map(listing => {
        const title = listing.querySelector('.title').innerText;
        const price = listing.querySelector('.price').innerText;
        const mileage = listing.querySelector('.mileage').innerText;
        const location = listing.querySelector('.location').innerText;
        return { title, price, mileage, location };
      });
    });

    results.push(...cars);

    await page.close();
    await ProxyChain.closeAnonymizedProxy(newProxyUrl, true);
  }

  await browser.close();
  return results;
}

export { scrapeCars };

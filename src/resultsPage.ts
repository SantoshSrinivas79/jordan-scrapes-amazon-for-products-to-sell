import puppeteer, { Browser } from 'puppeteer';
import { getPropertyBySelector, setUpNewPage, getPropertyByHandle } from 'puppeteer-helpers';
import { scrapeDetailsPage } from './detailsPage';

export async function scrapeResults(searchParam: string, numberOfPagesToSearch: number, wantSoldByAmazon: boolean, minimumAllowedNumberOfVendors: number, minimumPrice: number) {
    try {
        let browser: Browser = await setUpBrowser();      
        let page = await setUpNewPage(browser);

        const baseUrl = 'https://www.amazon.com/s?field-keywords=';
        const url = baseUrl + searchParam;

        const potentialProducts: any = [];


        let categoryError = 0;
        for (let i = 1; i < numberOfPagesToSearch + 1; i++) {  
            await page.goto(`${url}&page=${i}`);
            let productsOnPage = await page.$$('.s-result-item');
            const resultsCol = await getPropertyBySelector(page, '#resultsCol', 'innerHTML');
            if (!resultsCol) {
                i--;
                categoryError++;
                if (categoryError > 4) {
                    return Promise.reject('Category not resolving. Skipping');
                }
                await page.close();
                await browser.close();
                await timeout(3000);
                browser = await setUpBrowser();
                page = await setUpNewPage(browser);
                continue;
            }

            console.log('productsOnPage length', productsOnPage.length, `${url}&page=${i}`);

            for (let productOnPage of productsOnPage) {
                const name = await getPropertyBySelector(productOnPage, 'img', 'alt');
                const price = await getPropertyBySelector(productOnPage, '.sx-price-whole', 'innerHTML');
                console.log('name and price', name, price);
                if (name && name !== '' && parseInt(price) > minimumPrice) {
                    try {
                        const detailsObject = await scrapeDetailsPage(productOnPage, browser, minimumAllowedNumberOfVendors, wantSoldByAmazon);
                        if (detailsObject) {
                            const currentDate = new Date();
                            let asin = detailsObject.url.split('/dp/')[1];
                            if (asin) {
                                asin = asin.split('/')[0];
                            }
                            // Let's not duplicate entries
                            if (potentialProducts.filter(product => product.name === name).length === 0) {
                                potentialProducts.push({
                                    name: name,
                                    price: price,
                                    numberOfVendors: detailsObject.numberOfVendors,
                                    buyboxVendor: detailsObject.buyboxVendor,
                                    brand: detailsObject.brand,
                                    url: detailsObject.url, 
                                    asin: asin,
                                    createdAt: currentDate, 
                                    updatedAt: currentDate
                                });
                            }
                        }
                    }
                    catch (e) {
                        return Promise.reject(e);
                    }
                }
            }
        }


        await page.close();
        await browser.close();

        return Promise.resolve(potentialProducts);

    }
    catch (e) {
        return Promise.reject(`Something went wrong in the initial set up: ${e}`);
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setUpBrowser() {
        let browser: Browser;
        let ubuntu = false;
        let headless = false;
        if (process.argv[2] === 'ubuntu' || process.argv[3] === 'ubuntu') {
            ubuntu = true;
        }
        if (process.argv[2] === 'headless' || process.argv[3] === 'headless') {
            headless = true;
        }
        if (ubuntu) {
            browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
            ] });
        }
        else {
            browser = await puppeteer.launch({ headless: headless, args: [`--window-size=${1800},${1200}`] });
        }

        return Promise.resolve(browser);
}
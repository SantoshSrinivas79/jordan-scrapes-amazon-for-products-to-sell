import puppeteer, { Browser } from 'puppeteer';
import { getPropertyBySelector, setUpNewPage } from 'puppeteer-helpers';
import { scrapeDetailsPage } from './detailsPage';

export async function scrapeResults(searchParam: string, numberOfPagesToSearch: number, wantSoldByAmazon: boolean, minimumAllowedNumberOfVendors: number, minimumPrice: number) {
    try {
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
            browser = await puppeteer.launch({ headless: true, args: [`--window-size=${1800},${1200}`, '--no-sandbox', '--disable-setuid-sandbox'] });
        }
        else {
            browser = await puppeteer.launch({ headless: headless, args: [`--window-size=${1800},${1200}`] });
        }

        const baseUrl = 'https://www.amazon.com/s?field-keywords=';
        const url = baseUrl + searchParam;

        const potentialProducts: any = [];


        const page = await setUpNewPage(browser);
        for (let i = 1; i < numberOfPagesToSearch + 1; i++) {
            await page.goto(`${url}&page=${i}`);
            let productsOnPage = await page.$$('.s-result-item');

            for (let productOnPage of productsOnPage) {
                const name = await getPropertyBySelector(productOnPage, 'img', 'alt');
                const price = await getPropertyBySelector(productOnPage, '.sx-price-whole', 'innerHTML');
                if (name && name !== '' && parseInt(price) > minimumPrice) {
                    try {
                        const detailsObject = await scrapeDetailsPage(productOnPage, browser, minimumAllowedNumberOfVendors, wantSoldByAmazon);
                        if (detailsObject) {
                            // Let's not duplicate entries
                            if (potentialProducts.filter(product => product.name === name).length === 0) {
                                potentialProducts.push({
                                    name: name,
                                    price: price,
                                    numberOfVendors: detailsObject.numberOfVendors,
                                    buyboxVendor: detailsObject.buyboxVendor,
                                    brand: detailsObject.brand,
                                    url: detailsObject.url
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
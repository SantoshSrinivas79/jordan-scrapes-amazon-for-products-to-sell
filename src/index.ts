import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';
import { getPropertyBySelector, setUpNewPage } from 'puppeteer-helpers';


// Whatever search param you can to use
const searchParam = 'pet food';

// How many pages of results to go through
const numberOfPagesToSearch = 3;

// Do we want to compete on products that Amazon sell?
const wantSoldByAmazon = false;

// How many other vendors do we want there to be?
const minimumAllowedNumberOfVendors = 3;

// ...minimum price
const minimumPrice = 25;

(async () => {
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
                        const detailsObject = await goToDetailsPage(productOnPage, browser, minimumAllowedNumberOfVendors, wantSoldByAmazon);
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
                        console.log('Error going to the details page', e);
                    }
                }
            }
        }
        console.log('potential Products', potentialProducts);

        await page.close();
        await browser.close();

    }
    catch (e) {
        console.log('Something went wrong in the initial set up', e);
    }
})();

export async function goToDetailsPage(product: ElementHandle, browser: Browser, minimumAllowedNumberOfVendors: number, wantSoldByAmazon: boolean) {
    const page = await setUpNewPage(browser);
    const url = await getPropertyBySelector(product, '.s-access-detail-page', 'href');
    await page.goto(url);
    let buyboxVendor = (await getPropertyBySelector(page, '#merchant-info a', 'innerHTML'));
    if (buyboxVendor) {
        buyboxVendor = buyboxVendor.trim();
    };
    const brand = await getPropertyBySelector(page, '#bylineInfo', 'innerHTML');
    let numberOfVendors = await getPropertyBySelector(page, '#olp_feature_div a', 'innerHTML');
    if (numberOfVendors) {
        numberOfVendors = numberOfVendors.split('</b>')[1].trim();
    }
    if (numberOfVendors) {
        numberOfVendors = numberOfVendors.split(')')[0];
    }
    if (numberOfVendors) {
        numberOfVendors = numberOfVendors.split('(')[1].trim();
    }

    // If it's sold by Amazon the data parsed from buyboxVendor will be 'Details', 'easy-to-open packaging', or null
    if ((!wantSoldByAmazon && buyboxVendor && (buyboxVendor !== 'Details' || buyboxVendor !== 'easy-to-open packaging')) && parseInt(numberOfVendors) >= minimumAllowedNumberOfVendors) {
        const dataToReturn = { numberOfVendors: numberOfVendors, buyboxVendor: buyboxVendor, brand: brand, url: url };
        await page.close();

        return Promise.resolve(dataToReturn);
    }
    else {
        await page.close();
        return Promise.resolve();
    }

}
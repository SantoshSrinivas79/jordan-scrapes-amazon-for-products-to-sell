import { Browser, ElementHandle } from 'puppeteer';
import { getPropertyBySelector, setUpNewPage } from 'puppeteer-helpers';


export async function scrapeDetailsPage(product: ElementHandle, browser: Browser, minimumAllowedNumberOfVendors: number, wantSoldByAmazon: boolean) {
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
import { scrapeResults } from './resultsPage';
import { categories } from './taxonomy';
import Webhook from 'webhook-discord';
import * as dbHelpers from 'database-helpers';
import { config } from './config';

// How many pages of results to go through
const numberOfPagesToSearch = 10;

// Do we want to compete on products that Amazon sell?
const wantSoldByAmazon = false;

// How many other vendors do we want there to be?
const minimumAllowedNumberOfVendors = 3;

// ...minimum price
const minimumPrice = 25;

const webHookName = 'Amazon Product Scraper';

(async () => {
    const dbUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoUrl}/${config.mongoDb}`;
    const db = await dbHelpers.initializeMongo(dbUrl);
    const hook = new Webhook.Webhook(config.webhookUrl);
    const sampleCategories = getRandom(categories, 100);
    for (let index = 0; index < sampleCategories.length; index++) {
        const category = sampleCategories[index];
        try {
            console.log('sample categories', index, category);
            const products = await scrapeResults(category, numberOfPagesToSearch, wantSoldByAmazon, minimumAllowedNumberOfVendors, minimumPrice);
            console.log('Products', products.length, category, sampleCategories.length, index);

            // Insert to database
            // Check if it already exists
            if (products.length > 0) {
                try {
                    for (let i = 0; i < products.length; i++) {
                        const product = products[i];
                        try {
                            const matches = await dbHelpers.getAllFromMongo(db, config.mongoCollection, { asin: product.asin });
                            if (matches.length < 1) {
                                await dbHelpers.insertToMongo(db, config.mongoCollection, product);
                            }
                        }
                        catch (e) {
                            console.log(e);
                            await hook.info(webHookName, `Unexpected error - ${e}`);
                        }
                    }

                }
                catch (e) {
                    console.log('Unexpected error', e);
                    await hook.info(webHookName, `Unexpected error - ${e}`);
                }
            }
        }
        catch (e) {
            // Notify via webhook
            console.log('An error has occurred: ', e);
            await hook.info(webHookName, `Unexpected error - ${e}`);
            process.exit
        }
    }
    process.exit();
})();

function getRandomFromArray(arr, n) {
    let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}
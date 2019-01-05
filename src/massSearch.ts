import { scrapeResults } from './resultsPage';
import { categories } from './taxonomy';
import Webhook from 'webhook-discord';
import * as dbHelpers from 'database-helpers';
import { config } from './config';

// How many pages of results to go through
const numberOfPagesToSearch = 1;

// Do we want to compete on products that Amazon sell?
const wantSoldByAmazon = false;

// How many other vendors do we want there to be?
const minimumAllowedNumberOfVendors = 3;

// ...minimum price
const minimumPrice = 25;

const webHookHame = 'Amazon Product Scraper';

(async () => {
    const dbUrl = `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoUrl}/${config.mongoDb}`;
    const db = await dbHelpers.initializeMongo(dbUrl);
    const hook = new Webhook('https://discordapp.com/api/webhooks/531203290755760148/zvp_lglHNldw2l6Qj9mrdA9bwMpiuttCPg-S777JM9qsLtDxomYrcx6CN_aEMdYlLGVc');
    const sampleCategories = getRandom(categories, 20);
    for (let category of sampleCategories) {
        try {
            const products = await scrapeResults(category, numberOfPagesToSearch, wantSoldByAmazon, minimumAllowedNumberOfVendors, minimumPrice);
            console.log('Products', products, category);

            // Insert to database
            // Check if it already exists
            if (products.length > 0) {
                try {
                    await dbHelpers.insertToMongo(db, config.mongoCollection, products);
                    // Notify success via webhook
                    await hook.success(webHookHame, `Inserted ${products.length} products from ${category}`);
                }
                catch (e) {
                    console.log('Unexpected error', e);
                    await hook.info(webHookHame, `Unexpected error - ${e}`);
                }
            }
        }
        catch (e) {
            // Notify via webhook
            console.log('An error has occurred: ', e);
            await hook.info(webHookHame, `Unexpected error - ${e}`);
            process.exit
        }
    }
    process.exit();
})();

function getRandom(arr, n) {
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
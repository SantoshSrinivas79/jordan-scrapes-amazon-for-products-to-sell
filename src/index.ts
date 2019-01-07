import { scrapeResults } from './resultsPage';

// Whatever search param you can to use
const searchParam = 'Baby+Safety';

// How many pages of results to go through
const numberOfPagesToSearch = 2;

// Do we want to compete on products that Amazon sell?
const wantSoldByAmazon = false;

// How many other vendors do we want there to be?
const minimumAllowedNumberOfVendors = 3;

// ...minimum price
const minimumPrice = 25;

(async () => {
    try {
        const products = await scrapeResults(searchParam, numberOfPagesToSearch, wantSoldByAmazon, minimumAllowedNumberOfVendors, minimumPrice);
        console.log('Products', products);
    }
    catch(e) {
        console.log('An error has occurred: ', e);
    }
})();
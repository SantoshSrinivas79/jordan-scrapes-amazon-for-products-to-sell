# Amazon Product Finder

Searches Amazon by keyword and finds potential products to sell based on certain criteria such as number of vendors, buybox price, and whether it's sold by Amazon.

## Getting Started

Clone the repository, run `npm i`, and then `npm start` in a terminal/bash/command prompt.

It will output an array of product objects with items like price, brand name, and total buybox vendors.

You can adjust the criteria easily by adjusting the variables found at the top of src/index.ts.

There are script options to run this headless or on an ubuntu webserver.

To run on ubuntu:

```
npm run start:ubuntu
```
These dependences are also required:

```
sudo apt-get install libx11-xcb1 libxcomposite1 libXdamage1 libxi6 libxext6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0
```


To run headless:
```
npm run start:headless
```

You will also need to rename `src/sample-config.ts` to `src/config.ts`. This file has example database connections for a mongo connnection and a url for a discord webhook. Valid credentials aren't required unless you are mass searching.

[Full Guide on Single Category Searching](https://javascriptwebscrapingguy.com/blog/jordan-scrapes-amazon-looking-for-products-to-sell/)

## Mass search

You can do a mass search of many categories using `npm run massSearch`. A valid mongo connection and webhook discord url will be required. Once these are in place, just run the script and it'll take care of the rest.

I **strongly** recommend doing this on a webserver or I think it's very possible that your IP address will be blocked by Amazon.

[Full Guide on Mass Category Searching](https://javascriptwebscrapingguy.com/jordan-mass-scrapes-amazon-for-potential-products-part-1-of-2/)

### Prerequisites

Tested on Node v8.11.2 and NPM v5.6.0.

### Installing

After installing [NodeJS](https://nodejs.org/en/) you should be able to just run the following in the terminal.

```
npm i
```

## Built With

* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Scraping library
* [NodeJS](https://nodejs.org/en/) - NodeJS

## Authors

* **Jordan Hansen** - *Initial work* - [Jordan Hansen](https://github.com/aarmora)


## License

This project is licensed under the ISC License

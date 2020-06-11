const axios = require('axios');
const Papa = require('papaparse');
const symbols = require('../symbols/index.js');

const startDate = 0;
const endDate = 4102444800;

const getTicker = (ticker) => {
  const baseUrl = `https://query1.finance.yahoo.com/v7/finance/download/${ticker}?period1=${startDate}&period2=${endDate}&interval=1d&events=history`;
  return axios
    .get(baseUrl)
    .then(({ data }) => {
      return data;
    })
    .catch((err) => {
      console.log(`Error in fetching from yahoo api: `, err);
    });
};

const scrapeAll = (symbols) => {
  getTicker(symbols[0])
    .then((data) => {
      console.log(Papa.parse(data, { header: true, delimiter: ',' }));
    })
    .catch((err) => {
      console.log(`Error in parsing: `, err);
    });
};
scrapeAll(symbols);

module.exports = {
  getTicker: getTicker,
};

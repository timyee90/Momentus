const db = require('../database/index.js');
const symbols = require('../symbols/index.js');
const { percentChange } = require('../utils/index.js');

module.exports.getStockTicker = (ticker) => {
  ticker = ticker.replace(/\./g, '');
  return db
    .query(`SELECT * from ${ticker}`, [])
    .then((data) => {
      return data.rows[0];
    })
    .catch((err) => {
      console.log(`Error in database query: `, err);
    });
};

module.exports.insertStock = async (ticker, jsonData) => {
  if (ticker !== undefined) {
    const client = await db.pool.connect();
    try {
      await client.query(`DROP TABLE IF EXISTS ${ticker};`);
      await client.query(
        `CREATE TABLE ${ticker} (id SERIAL PRIMARY KEY, data json NOT NULL, ticker varchar(5) NOT NULL);`
      );
      await client.query(
        `INSERT INTO ${ticker} (data, ticker) values ($1, $2);`,
        [jsonData, ticker]
      );
    } catch (err) {
      console.log(`Error: `, err);
    } finally {
      client.release();
    }
  }
};

module.exports.performAnalysis = () => {
  const promiseArray = symbols.map((symbol) => {
    return this.getStockTicker(symbol);
  });

  const stocks = Promise.all(promiseArray).then((data) => {
    return data
      .map((stock) => {
        if (stock !== undefined) {
          const len = stock.data.data.length;
          const prices = stock.data.data.slice(len - 260, len).map((row) => {
            return +row.Close;
          });
          return {
            ticker: stock.ticker,
            prices: [prices[0], prices[prices.length - 1]],
            percentChange: percentChange(prices[0], prices[prices.length - 1]),
          };
        }
      })
      .sort((a, b) => {
        return b.percentChange - a.percentChange;
      });
  });
  return stocks;
};

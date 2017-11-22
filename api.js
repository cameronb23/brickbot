// @flow
import request from 'request-promise';

export async function query(query: string): Promise<*> {
  let goat = null;
  let stock = null;

  try {
    stock = await queryStockX(query);
  } catch (e) {
    console.log('Error querying StockX: ', e);
    return {
      success: false,
      message: 'Error pulling data!'
    };
  };

  const sku = stock.product.searchable_traits.Style;
  const retail = stock.product.searchable_traits['Retail Price'];

  try {
    goat = await queryGoat(sku);
  } catch (e) {
    console.log('Error querying GOAT: ', e);
  }

  let highBid = null;
  let lowAsk = null;
  let goatData = {};
  let stockData = {};
  let meta = {
    sku,
    retail
  };

  if (stock.success) {
    const p = stock.product;
    highBid = p.highest_bid;
    lowAsk = p.lowest_ask;

    stockData = {
      high: p.highest_bid,
      low: p.lowest_ask
    };

    meta = Object.assign({}, meta, {
      title: stock.product.name,
      stockUrl: stock.product.url,
      image: stock.product.media.imageUrl,
      stockSlug: stock.product.ticker_symbol
    });
  }

  if (goat.success) {
    const price = goat.product.new_lowest_price_cents / 100;
    goatData = {
      low: price
    };
    lowAsk = lowAsk === null ? price : ((lowAsk + price) / 2);

    meta = Object.assign({}, meta, {
      title: goat.product.name,
      image: goat.product.picture_url,
      goatSlug: goat.product.slug
    });
  }

  const success = !(!goat.success && !stock.success);
  return {
    success,
    message: (success ? 'Product data retrieved' : 'Failed to retrieve data'),
    data: {
      meta,
      highBid,
      lowAsk,
      stockData,
      goatData
    }
  };
}

export async function queryGoat(query: string): Promise<*> {
  const url = 'https://2fwotdvm2o-dsn.algolia.net/1/indexes/ProductTemplateSearch/query';

  const opts = {
    url,
    method: 'POST',
    qs: {
      'x-algolia-agent': 'Algolia for Swift (4.8.1); iOS (11.2)',
      'x-algolia-application-id': '2FWOTDVM2O',
      'x-algolia-api-key': '7af2c6fc3991edee5a9f375062c19d21'
    },
    body: {
      params: `facetFilters=(status:active, status:active_edit)&hitsPerPage=5&numericFilters=[]&page=0&query=${query}`
    },
    json: true
  };

  try {
    const res = await request(opts);

    const results = res.hits;

    if (!results || results.length < 1) {
      return {
        success: false,
        message: 'No products found!'
      };
    }

    const result = results[0];

    return {
      success: true,
      product: result
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to contact the API for product data'
    };
  }
}

// https://stockx.com/api/products/adidas-yeezy-boost-350-v2-semi-frozen-yellow?includes=market,360
export async function queryStockX(query: string): Promise<*> {
  const url = 'https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query';

  const opts = {
    url,
    method: 'POST',
    qs: {
      'x-algolia-agent': 'Algolia for vanilla JavaScript 3.22.1',
      'x-algolia-application-id': 'XW7SBCT9V6',
      'x-algolia-api-key': '6bfb5abee4dcd8cea8f0ca1ca085c2b3'
    },
    body: {
      params: `query=${query}&hitsPerPage=5&facets=*`
    },
    json: true
  };

  try {
    const res = await request(opts);

    const results = res.hits;

    if (!results || results.length < 1) {
      return {
        success: false,
        message: 'No products found!'
      };
    }

    const result = results[0];

    return {
      success: true,
      product: result
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to contact the API for product data'
    };
  }
}

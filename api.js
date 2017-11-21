// @flow
import request from 'request-promise';

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
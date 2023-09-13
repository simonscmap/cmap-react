import { apiUrl, fetchOptions } from './config';

const highlights = {};

highlights.fetch = async (key) => {
  let endpoint = apiUrl + `/api/highlights?key=${key}`;
  return await fetch(endpoint, fetchOptions);
};

// Wrap each endpoint in a try/catch because...
// if the fetch fails before the request is sent, for example due to a CORS
// violation or if the network is down,
// then redux-saga will choke and no subsequent middleware will run,
// effectively crippling the application.
// yay error handling.

let safeAPI = Object.entries(highlights)
  .map(([name, fn]) => {
    return {
      [name]: async (...args) => {
        let result;
        try {
          result = await fn.apply(null, args);
        } catch (e) {
          if (e) {
            result = e;
          } else {
            result = new Error(
              'unknown error, the request may not have been sent',
            );
          }
        }
        return await result;
      },
    };
  })
  .reduce((accumulator, current) => {
    return {
      ...accumulator,
      ...current,
    };
  }, {});

export default safeAPI;

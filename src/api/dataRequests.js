// generic data requests
import { apiUrl, fetchOptions } from './config';

const dataAPI = {};

dataAPI.customQuery = async (query) => {
  if (!query) {
    console.log(`customQuery reqeived no arguments`);
    return null;
  }

  let response = await fetch(
    apiUrl + `/api/data/query?query=${query}`,
    fetchOptions,
  );

  return response;
};

dataAPI.checkQuerySize = async (query) => {
  if (!query) {
    console.log(`checkQuerySize reqeived no arguments`);
    return null;
  }

  let response = await fetch(
    apiUrl + `/api/data/check-query-size?query=${query}`,
    fetchOptions,
  );

  return response;
};

dataAPI.trajectoryCounts = async () => {
  let response = await fetch(
    apiUrl + `/api/data/trajectory-point-counts`,
    fetchOptions,
  );
  return response;
}

// Wrap each endpoint in a try/catch because...
// if the fetch fails before the request is sent, for example due to a CORS
// violation or if the network is down,
// then redux-saga will choke and no subsequent middleware will run,
// effectively crippling the application.
// yay error handling.

let safeAPI = Object.entries(dataAPI)
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

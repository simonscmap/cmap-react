import { apiUrl, fetchOptions, postOptions, deleteOptions } from './config';

const collectionsAPI = {};

collectionsAPI.getUserCollections = async (userId) => {
  let endpoint = apiUrl + `/api/collections/user/${userId}`;
  return await fetch(endpoint, fetchOptions);
};

collectionsAPI.getPublicCollections = async () => {
  let endpoint = apiUrl + '/api/collections/public';
  return await fetch(endpoint, fetchOptions);
};

collectionsAPI.deleteCollection = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}`;
  return await fetch(endpoint, deleteOptions);
};

collectionsAPI.trackPreview = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}/preview`;
  return await fetch(endpoint, postOptions);
};

collectionsAPI.trackCopy = async (collectionId) => {
  let endpoint = apiUrl + `/api/collections/${collectionId}/copy`;
  return await fetch(endpoint, postOptions);
};

// Wrap each endpoint in a try/catch because...
// if the fetch fails before the request is sent, for example due to a CORS
// violation or if the network is down,
// then redux-saga will choke and no subsequent middleware will run,
// effectively crippling the application.
// yay error handling.

let safeAPI = Object.entries(collectionsAPI)
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

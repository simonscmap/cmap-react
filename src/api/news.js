import { apiUrl, fetchOptions, postOptions } from './config';

const newsAPI = {};

newsAPI.list = async () => {
  let endpoint = apiUrl + '/api/news/list';
  return await fetch(endpoint, fetchOptions);
};

newsAPI.categorize = async (id, category) => {
  let endpoint = apiUrl + '/api/news/category';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id, category }),
  });
};

newsAPI.create = async (story) => {
  let endpoint = apiUrl + '/api/news/create';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify(story),
  });
};

newsAPI.update = async (item) => {
  let endpoint = apiUrl + '/api/news/update';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ story: item }),
  });
};

newsAPI.updateRanks = async (ranks) => {
  let endpoint = apiUrl + '/api/news/updateRanks';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ ranks }),
  });
};

newsAPI.publish = async (id) => {
  let endpoint = apiUrl + '/api/news/publish';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id }),
  });
};

newsAPI.draft = async (id) => {
  let endpoint = apiUrl + '/api/news/draft';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id }),
  });
};

newsAPI.preview = async (id) => {
  let endpoint = apiUrl + '/api/news/preview';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id }),
  });
};

newsAPI.unpublish = async (id) => {
  let endpoint = apiUrl + '/api/news/unpublish';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id }),
  });
};

newsAPI.feature = async (id, current) => {
  let endpoint = apiUrl + '/api/news/feature';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify({ id, current }),
  });
};

// Wrap each endpoint in a try/catch because...
// if the fetch fails before the request is sent, for example due to a CORS
// violation or if the network is down,
// then redux-saga will choke and no subsequent middleware will run,
// effectively crippling the application.
// yay error handling.

let safeAPI = Object.entries(newsAPI)
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

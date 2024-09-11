import { apiUrl, fetchOptions, postOptions } from './config';

const notificationsAPI = {};

notificationsAPI.history = async (args) => {
  const endpoint = apiUrl + '/api/notifications/history';
  return await fetch(endpoint, {
    ...fetchOptions,
    ...args
  });
};

notificationsAPI.recipients = async (args) => {
  const tags = JSON.stringify (args.tags);
  const endpoint = apiUrl + '/api/notifications/recipients' + `?tags=${tags}`;
  return await fetch(endpoint, {
    ...fetchOptions,
  });
};

notificationsAPI.previews = async (args) => {
  const endpoint = apiUrl + '/api/notifications/preview' + `?newsId=${args.newsId}`;
  return await fetch(endpoint, {
    ...fetchOptions,
  });
};


const safeAPI = Object.entries(notificationsAPI)
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

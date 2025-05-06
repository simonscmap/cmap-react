import { apiUrl, fetchOptions, postOptions } from './config';

const notificationsAPI = {};

notificationsAPI.history = async (args) => {
  const endpoint = `${apiUrl}/api/notifications/history?newsId=${args.newsId}`;
  return await fetch(endpoint, {
    ...fetchOptions,
  });
};

notificationsAPI.recipients = async (args) => {
  const tags = JSON.stringify(args.tags);
  const endpoint = apiUrl + '/api/notifications/recipients' + `?tags=${tags}`;
  return await fetch(endpoint, {
    ...fetchOptions,
  });
};

notificationsAPI.previews = async (args) => {
  const endpoint =
    apiUrl + '/api/notifications/preview' + `?newsId=${args.newsId}`;
  return await fetch(endpoint, {
    ...fetchOptions,
  });
};

notificationsAPI.send = async (args) => {
  const endpoint = apiUrl + '/api/notifications/send';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify(args),
  });
};

notificationsAPI.reSend = async (args) => {
  const endpoint = apiUrl + '/api/notifications/resend';
  return await fetch(endpoint, {
    ...postOptions,
    body: JSON.stringify(args),
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

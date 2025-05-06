import { postOptions, apiUrl, fetchOptions, deleteOptions } from './config';

const userAPI = {};

userAPI.login = (user) => {
  return fetch(apiUrl + '/api/user/signin', {
    ...postOptions,
    body: JSON.stringify(user),
  });
};

userAPI.logout = () => {
  return fetch(apiUrl + '/api/user/signout', fetchOptions);
};

userAPI.register = (user) => {
  return fetch(apiUrl + '/api/user/signup', {
    ...postOptions,
    body: JSON.stringify(user),
  });
};

userAPI.recoverPassword = async (email) => {
  fetch(apiUrl + '/api/user/forgotpassword', {
    ...postOptions,
    body: JSON.stringify({ email }),
  });
};

userAPI.choosePassword = async ({ password, token }) => {
  return await fetch(apiUrl + '/api/user/choosepassword', {
    ...postOptions,
    body: JSON.stringify({ password, token }),
  });
};

userAPI.validate = (user) => {
  return fetch(apiUrl + '/api/user/validate', {
    ...postOptions,
    body: JSON.stringify(user),
  });
};

userAPI.googleLoginRequest = async (payload) => {
  let response = await fetch(apiUrl + '/api/user/googleauth', {
    ...postOptions,
    body: JSON.stringify(payload), // object must include userIDToken
  });

  return response;
};

userAPI.contactUs = async (payload) => {
  return await fetch(apiUrl + '/api/user/contactus', {
    ...postOptions,
    body: JSON.stringify(payload),
  });
};

userAPI.nominateNewData = async (payload) => {
  return await fetch(apiUrl + '/api/user/contactus', {
    ...postOptions,
    body: JSON.stringify(payload),
  });
};

userAPI.changePassword = async (payload) => {
  return await fetch(apiUrl + '/api/user/changepassword', {
    ...postOptions,
    body: JSON.stringify(payload),
  });
};

userAPI.changeEmail = async (payload) => {
  return await fetch(apiUrl + '/api/user/changeemail', {
    ...postOptions,
    body: JSON.stringify(payload),
  });
};

userAPI.getGuestToken = async (expires) => {
  return await fetch(`${apiUrl}/api/user/getguesttoken?expires=${expires}`, {
    ...fetchOptions,
  });
};

userAPI.updateUserInfo = async (userInfo) => {
  return await fetch(apiUrl + '/api/user/updateinfo', {
    ...postOptions,
    body: JSON.stringify(userInfo),
  });
};

userAPI.keyRetrieval = async () => {
  return await fetch(apiUrl + '/api/user/retrieveapikeys', fetchOptions);
};

userAPI.keyCreation = async (description) => {
  return await fetch(
    apiUrl + `/api/user/generateapikey?description=${description.trim()}`,
    fetchOptions,
  );
};

userAPI.getLastDatasetTouch = async () => {
  try {
    let response = await fetch(
      apiUrl + `/api/user/last-api-call`,
      fetchOptions,
    );
    return response;
  } catch (e) {
    console.log('error fetching user data');
    return null;
  }
};

userAPI.getSubscriptions = async () => {
  return await fetch(apiUrl + '/api/user/subscriptions', fetchOptions);
};

userAPI.createSubscription = async (shortName) => {
  return await fetch(apiUrl + '/api/user/subscriptions', {
    ...postOptions,
    body: JSON.stringify({ shortName }),
  });
};

userAPI.deleteSubscriptions = async (shortNames) => {
  return await fetch(apiUrl + '/api/user/subscriptions', {
    ...deleteOptions,
    body: JSON.stringify({ shortNames }),
  });
};

export default userAPI;

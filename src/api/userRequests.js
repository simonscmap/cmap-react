import { postOptions, apiUrl, fetchOptions } from './config';

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

userAPI.googleLoginRequest = async (userIDToken) => {
  let response = await fetch(apiUrl + '/api/user/googleauth', {
    ...postOptions,
    body: JSON.stringify({ userIDToken }),
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

userAPI.cartPersistAddItem = async (formData) => {
  return await fetch(apiUrl + '/api/user/addcartitem', {
    ...postOptions,
    body: JSON.stringify(formData),
  });
};

userAPI.cartPersistRemoveItem = async (formData) => {
  return await fetch(apiUrl + '/api/user/removecartitem', {
    ...postOptions,
    body: JSON.stringify(formData),
  });
};

userAPI.cartPersistClear = async () => {
  return await fetch(`${apiUrl}/api/user/clearcart`, fetchOptions);
};

userAPI.getCart = async () => {
  return await fetch(`${apiUrl}/api/user/getcart`, fetchOptions);
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

export default userAPI;

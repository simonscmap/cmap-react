// inMemory is a fallback for localStorage
// implementing the same api
// see: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

let inMemory = () => {
  console.log('using inMemory fallback for localStorage');
  // TODO
  return {
    setItem: () => {},
    getItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
};

let localStorage =
  global && global.localStorage ? global.localStorage : inMemory;

let local = {
  set: (k, v) => {
    let preparedValue = v;
    if (typeof v === 'object') {
      preparedValue = JSON.stringify(v);
    }
    try {
      return localStorage.setItem(k, preparedValue);
    } catch (e) {
      console.log (`error attempting to set item "${k}" in local storage`);
      return null;
    }
  },
  get: (k) => {
    let v = localStorage.getItem(k);
    return v;
  },
  del: (k) => {
    return localStorage.removeItem(k);
  },
  clear: () => localStorage.clear(),
};

// export this service as a named function so that the service can differentiate and add cookie functionality as well
export const localStorageApi = local;

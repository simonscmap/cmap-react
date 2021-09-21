// inMemory is a fallback for localStorage
// implementing the same api
// see: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

let inMemory = () => {
  console.log("using inMemory fallback for localStorage");
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
    return localStorage.setItem(k, v);
  },
  get: (k) => {
    return localStorage.getItem(k);
  },
  del: (k) => {
    return localStorage.delete(k);
  },
  clear: () => localStorage.clear(),

  setObj: (k, ov) => {
    if (typeof ov !== "object") {
      return local.set(k, ov);
    }
    return localStorage.setItem(k, JSON.stringify(ov));
  },
  getObj: (k) => {
    let result;
    try {
      result = JSON.parse(localStorage.getItem(k));
    } catch (e) {
      console.error("unable to parse item from local storage: " + k);
      return undefined;
    }
    return result;
  },
};

// export this service as a named function so that the service can differentiate and add cookie functionality as well
export { local };

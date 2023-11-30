/* The persistence service allows for a value that is kept in redux
   to be automatically persisted to local storage.

   The service definition below defines a init function that
   returns a minimal api that allows consuming components to add,
   remove, and look-up entries, which are simply stored in an
   enclosed object.

   The structure of the object is:
   {
      [redux action type]: {
        [key to persist in local storage]: value
      }
   }

   This allows for a single redux action to control more than one
   value in local storage.

   A request for a new entry in the service (made via the "add" api)
   must provide:
     1. redux action type
     2. key to use in local storage
     3. a function that converts a redux action into the value
        to persist
     4. a function that converts from local storage value to a
        dispatchable action

   The last parameter is not yet used, but will enable the app
   to easily load state from local storage.

   See the persist middleware definition in this directory.
*/
const startPersistenceService = () => {
  // enclose a register of state to persist
  const localStoragePersistence = {};

  // return the registered entry, if it exists, or undefined
  let getEntry = (actionType, key) => {
    if (localStoragePersistence[actionType]) {
      if (localStoragePersistence[actionType][key]) {
        return localStoragePersistence[actionType][key];
      } else {
        // console.log(`entry does not exitst for "${actionType}.${key}"`);
      }
    } else {
      // console.log(`there are no entries for action "${actionType}"`);
    }
    return undefined;
  };

  let actionCategoryExists = (actionType) =>
    !!localStoragePersistence[actionType];

  let entryExists = (actionType, key) => !!getEntry(actionType, key);

  // create a new entry
  let makeEntry = (request) => {
    let { actionType, key } = request;
    if (actionCategoryExists(actionType)) {
      localStoragePersistence[actionType][key] = { ...request };
    } else {
      localStoragePersistence[actionType] = {
        [key]: { ...request },
      };
    }
  };

  // validate an new entry request and then delegate to makeEntry
  let addPersistence = (request) => {
    let { actionType, key, payloadToValue, localToDispatch } = request;
    if (!actionType || !key) {
      console.log(`invalid call to addPersistence: missing argument(s)`);
    } else if (entryExists(actionType, key)) {
      console.log(
        `there is already a local persistence active for key "${key}"`,
      );
    } else {
      makeEntry(request);
    }
  };

  // remove an entry
  let removePersistence = (actionType, key) => {
    if (!actionType || !key) {
      console.log(`invalid call to removePersistence: missing argument(s)`);
    } else if (!entryExists(actionType, key)) {
      console.log(`no existing persistence record for "${actionType}.${key}"`);
    } else {
      localStoragePersistence[actionType][key] = undefined;
    }
  };

  // return all the entries recorded under an action
  let listEntriesForAction = (actionType) => {
    if (actionCategoryExists(actionType)) {
      return Object.entries(localStoragePersistence[actionType]);
    }
    return [];
  };

  // return an interface to interact with the service
  return {
    add: addPersistence,
    remove: removePersistence,
    getEntry,
    listEntriesForAction,
  };
};

export const persistenceService = startPersistenceService();

import { localStorageApi as local } from './local.js';
import { persistenceService } from './service.js';

/* The persistence middleware checks each dispatched action against
   the services' records to see if it should apply a transform and
   persist the resulting value in local storage. In this way each
   registered action type automatically syncs local storage to
   application state
*/

export const persistenceMiddleware = (store) => (next) => (action) => {
  let result = next(action);

  let matchingEntries = persistenceService.listEntriesForAction(action.type);

  // for each matching entry, persist the prescribed value to local storage
  matchingEntries.forEach(([key, def]) => {
    let currentValue = local.get(key);
    if (!currentValue) {
      console.log(`no value in storage for "${action.type}.${key}"`);
    }
    let v = def.payloadToValue(currentValue, action.payload);
    // console.log(`persisting "${action.type}.${key}" with ${JSON.stringify(v)}`);
    local.set(key, v);
  });

  return result;
};

// TODO: add a separate case that listens for a predetermined action,
// which signals the middleware to pull all values from local storage
// into redux as a bootstrapping action

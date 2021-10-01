import { helpActionTypes } from '../../Redux/actions/help';
import { persistenceService } from '../../Services/persist';
import { LOCAL_STORAGE_KEY_HINTS_STATE } from '../../constants.js';
import { localStorageHintState } from './initialState';

export default function registerHints() {
  persistenceService.add({
    actionType: helpActionTypes.TOGGLE_HINTS,
    key: LOCAL_STORAGE_KEY_HINTS_STATE,
    payloadToValue: (currentState, payload) => {
      let oldState;
      // if no state is set
      if (!currentState) {
        oldState = localStorageHintState;
      } else {
        // if there is state from local storage,
        // we need to parse it, because it is stored as a string
        try {
          oldState = JSON.parse(currentState);
        } catch (e) {
          console.log(`failed to parse state from local storage`);
          // if we fail to parse, assume default
          oldState = localStorageHintState;
        }
      }

      let newState = Object.assign({}, oldState, {
        [payload]: !oldState[payload],
      });
      return newState;
    },
    // TODO
    localToDispatch: () => {},
  });
}

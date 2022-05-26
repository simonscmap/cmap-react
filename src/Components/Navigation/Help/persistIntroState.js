import { helpActionTypes } from '../../../Redux/actions/help.js';
import { persistenceService } from '../../../Services/persist';
import { localStorageIntroState } from './initialState';
import { LOCAL_STORAGE_KEY_INTRO_STATE } from '../../../constants.js';

export default function registerIntro() {
  persistenceService.add({
    actionType: helpActionTypes.TOGGLE_INTRO,
    key: LOCAL_STORAGE_KEY_INTRO_STATE,
    payloadToValue: (currentState, payload) => {
      let oldState;
      let { pageName, value } = payload;
      // if no state is set
      if (!currentState) {
        oldState = localStorageIntroState;
      } else {
        // if there is state from local storage,
        // we need to parse it, because it is stored as a string
        try {
          oldState = JSON.parse(currentState);
        } catch (e) {
          console.log(`failed to parse intro state from local storage`);
          // if we fail to parse, assume default
          oldState = localStorageIntroState;
        }
      }
      let newState = Object.assign({}, oldState, {
        [pageName]: value,
      });
      return newState;
    },
    // TODO
    localToDispatch: () => {},
  });
}

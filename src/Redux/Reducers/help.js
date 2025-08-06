import { helpActionTypes } from '../actions/help.js';
import {
  localStorageIntroState,
  localStorageHintState,
} from '../../Components/Navigation/Help/initialState.js';

// Fallback state shape in case localStorage values are invalid
const fallbackHelpState = {
  intros: {
    catalog: false,
    visualization: false,
    charts: false,
    cruise: false,
  },
  hints: {
    catalog: false,
    visualization: false,
    charts: false,
    cruise: false,
  },
};

// Help slice initial state with robust fallback
const initialHelpState = {
  intros: localStorageIntroState || fallbackHelpState.intros,
  hints: localStorageHintState || fallbackHelpState.hints,
};

// determine what the next state should be
// handles optional "value" param
function getNextIntroState(helpState, action) {
  const { pageName, value } = action.payload;
  if (value === undefined) {
    // value is not set, toggle state
    return !helpState.intros[pageName];
  } else {
    return !!value;
  }
}

export default function (helpState = initialHelpState, action) {
  switch (action.type) {
    case helpActionTypes.TOGGLE_INTRO:
      return {
        ...helpState,
        intros: {
          ...helpState.intros,
          [action.payload.pageName]: getNextIntroState(helpState, action),
        },
      };
    case helpActionTypes.TOGGLE_HINTS:
      return {
        ...helpState,
        hints: {
          ...helpState.hints,
          [action.payload]: !helpState.hints[action.payload],
        },
      };
    default:
      return helpState;
  }
}

export { initialHelpState };

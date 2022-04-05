import { helpActionTypes } from '../actions/help.js';

// determine what the next state should be
// handles optional "value" param
function getNextIntroState(lastState, action) {
  const { pageName, value } = action.payload;
  if (value === undefined) {
    // value is not set, toggle state
    return !lastState.intros[pageName];
  } else {
    return !!value;
  }
}

export default function (state, action) {
  switch (action.type) {
    case helpActionTypes.TOGGLE_INTRO:
      return {
        ...state,
        intros: {
          ...state.intros,
          [action.payload.pageName]: getNextIntroState(state, action),
        },
      };
    case helpActionTypes.TOGGLE_HINTS:
      return {
        ...state,
        hints: {
          ...state.hints,
          [action.payload]: !state.hints[action.payload],
        },
      };
    default:
      return state;
  }
}

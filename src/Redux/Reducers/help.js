import { helpActionTypes } from "../actions/help.js";

export default function (state, action) {
  switch (action.type) {
    case helpActionTypes.DISABLE_INTRO:
      return {
        ...state,
        intros: {
          ...state.intros,
          [action.payload]: false,
        },
      };
    case helpActionTypes.TOGGLE_HINTS:
      return {
        ...state,
         hints: {
          ...state.hints,
          [action.payload]: !state.hints[action.payload],
        },
      }
    default:
      return state;
  }
}

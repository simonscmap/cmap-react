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
    default:
      return state;
  }
}

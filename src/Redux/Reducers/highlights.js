import * as actions from '../actionTypes/highlights';

// Highlights slice initial state (extracted from main initialState in index.js)
const initialHighlightsState = {};

export default function (highlightsState = initialHighlightsState, action) {
  let { payload } = action;

  switch (action.type) {
    case actions.HIGHLIGHTS_REQUEST_SUCCESS:
      return {
        ...highlightsState,
        [payload.key]: payload.value,
      };
    default:
      return highlightsState;
  }
}

export { initialHighlightsState };

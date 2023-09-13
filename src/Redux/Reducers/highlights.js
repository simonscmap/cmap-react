import * as actions from '../actionTypes/highlights';

export default function (state, action) {
  let { payload } = action;

  switch (action.type) {
    case actions.HIGHLIGHTS_REQUEST_SUCCESS:
      return {
        ...state,
        home: {
          ...state.home,
          highlights: {
            ...(state.home.highlights || {}),
            [payload.key]: payload.value
          }
        }
      }
    default:
      return state;
  }
}

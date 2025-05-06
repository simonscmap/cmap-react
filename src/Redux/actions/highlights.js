import * as highlightsActionTypes from '../actionTypes/highlights';

export const highlightsRequestSend = (key) => ({
  payload: key,
  type: highlightsActionTypes.HIGHLIGHTS_REQUEST_SEND,
});

export const highlightsRequestSuccess = (resp) => ({
  payload: resp,
  type: highlightsActionTypes.HIGHLIGHTS_REQUEST_SUCCESS,
});

export const highlightsRequestFailure = () => ({
  type: highlightsActionTypes.HIGHLIGHTS_REQUEST_FAILURE,
});

import api from '../../api/api';
import * as highlightsActions from '../actions/highlights';
import * as highlightsActionTypes from '../actionTypes/highlights';
import { call, put, takeEvery } from 'redux-saga/effects';

export function* requestHighlightsSend(action) {
  let key = action.payload;

  let response = yield call(api.highlights.fetch, key);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(
      highlightsActions.highlightsRequestSuccess({
        key,
        value: jsonResponse.value,
      }),
    );
  } else {
    yield put(highlightsActions.highlightsRequestFailure());
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestHighlightsSend() {
  yield takeEvery(
    highlightsActionTypes.HIGHLIGHTS_REQUEST_SEND,
    requestHighlightsSend,
  );
}

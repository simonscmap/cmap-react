import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as catalogActionTypes from '../actionTypes/catalog';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import { call, put, takeLatest, race, delay } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';


export function* makeCheckQuerySizeRequest (query) {
  const result = yield race({
    response: call (api.data.checkQuerySize, query),
    timeout: delay (60 * 1000)
  });
  return result;
}

export function* checkDownloadSize (action) {
  // set timeout of 1 minute
  // const { response, timeout} = yield race({
  //   response: call (api.data.checkQuerySize, action.payload.query),
  //   timeout: delay (60 * 1000)
  // });
  const { response, timeout } = yield makeCheckQuerySizeRequest (action.payload.query);

  if (timeout) {
    yield put(interfaceActions.snackbarOpen('Attempt to validate dowload size timed out.'));
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
  } else if (response && response.ok) {
    let jsonResponse = yield response.json();
    // pass back the exact query string as submitted; this will be used
    // to look up the response in the cache
    yield put(catalogActions.storeCheckQueryResult(action.payload.query, jsonResponse));
    yield put(catalogActions.setCheckQueryRequestState(states.succeeded));
  } else if (response.status === 401) {
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
    yield put(userActions.refreshLogin());
  } else {
    yield put(catalogActions.setCheckQueryRequestState(states.failed));
  }
}
export function* watchCheckDownloadSize () {
  yield takeLatest(
    catalogActionTypes.CHECK_QUERY_SIZE_SEND,
    checkDownloadSize
  );
}

// TODO: move the other download sagas in here

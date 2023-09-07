import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as catalogActionTypes from '../actionTypes/catalog';
import * as userActions from '../actions/user';
import { call, put, takeLatest } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';


export function* checkDownloadSize (action) {
  let response = yield call(api.data.checkQuerySize, action.payload.query);
  if (response && response.ok) {
    console.log ('response is ok, parsing json');
    let jsonResponse = yield response.json();
    // pass back the exact query string as submitted; this will be used
    // to look up the response in the cache
    yield put(catalogActions.storeCheckQueryResult(action.payload.query, jsonResponse));
    yield put(catalogActions.setCheckQueryRequestState(states.succeeded));
  } else if (response.status === 401) {
    console.log(response);
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

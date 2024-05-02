import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
import { call, put, takeLatest, select } from 'redux-saga/effects';
// import states from '../../enums/asyncRequestStates';

export function* fetchPrograms () {
  let response = yield call(api.catalog.fetchPrograms, null);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(catalogActions.storePrograms(jsonResponse));
  } else {
    yield put(catalogActions.fetchProgramsFailure ({
      message: response.message,
    }));
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchProgramsSend() {
  yield takeLatest(actionTypes.FETCH_PROGRAMS_SEND, fetchPrograms);
}

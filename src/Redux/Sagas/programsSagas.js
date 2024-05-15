import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
import { call, put, takeLatest, select } from 'redux-saga/effects';
// import states from '../../enums/asyncRequestStates';

// fetch the program list
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

// fetch details for a single program
export function* fetchProgramDetails (action) {
  const { programName } = action.payload;
  if (typeof programName !== 'string' || programName.length === 0) {
    yield put(catalogActions.fetchProgramDetailsFailure ({
      message: 'No program name provided',
    }));
    return;
  }

  let response = yield call(api.catalog.fetchProgramDetails, programName);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(catalogActions.storeProgramDetails(jsonResponse));

  } else {
    yield put(catalogActions.fetchProgramDetailsFailure ({
      message: response.message,
    }));
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchProgramDetailsSend() {
  yield takeLatest(actionTypes.FETCH_PROGRAM_DETAILS_SEND, fetchProgramDetails);
}

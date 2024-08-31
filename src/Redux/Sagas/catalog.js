import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
import * as interfaceActions from '../actions/ui';
import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';

// fetch list of dataset names
export function* fetchDatasetNames () {
  const tag = { tag: 'fetch dataset names' };
  // check state
  yield put (catalogActions.setDatasetNamesRequestStatus (states.inProgress));
  let response;
  try {
    response = yield call(api.catalog.datasetNames, null);
  } catch (e) {
    yield put (catalogActions.setDatasetNamesRequestStatus (states.failed));
    yield put(interfaceActions.snackbarOpen('Failed to retrieve dataset names', tag));
    return;
  }
  if (response && response.ok) {
    const jsonResponse = yield response.json();
    yield put(catalogActions.fetchDatasetNamesSuccess (jsonResponse));
  } else {
    yield put (catalogActions.setDatasetNamesRequestStatus (states.failed));
    yield put (interfaceActions.snackbarOpen('Failed to retrieve dataset names', tag));
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchDatasetNames () {
  yield takeLatest(
    actionTypes.FETCH_DATASET_NAMES,
    fetchDatasetNames,
  );
}

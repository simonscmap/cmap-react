import {
  call,
  put,
  select,
  takeLatest,
} from 'redux-saga/effects';
import * as catalogActionTypes from '../actionTypes/catalog';
import api from '../../api/api';


// Continuous Ingestion Saga

function* fetchTablesWithCI () {
  let data = yield select((state) => state.tablesWithContinuousIngestion);

  // if not, fetch it
  if (!data) {
    console.log('fetching list of tables that are continuously ingested');
    let fetchedData = yield call(api.catalog.ci);

    if (fetchedData) {
      yield put({
        type: catalogActionTypes.FETCH_TABLES_WITH_CI_SUCCESS,
        payload: fetchedData,
      });
    } else {
      yield put({
        type: catalogActionTypes.FETCH_TABLES_WITH_CI_FAILURE,
      });
    }
  }
}

function* storeTablesWithCI ({ payload }) {
  if (!Array.isArray(payload)) {
    console.error('result of fetchTablesWithCI is not expected type', payload);
    return;
  }

  let result = payload.reduce((accumulator, current) => {
    let { table_name, ci } = current;
    if (table_name && typeof table_name === 'string') {
      table_name = table_name.trim();
    }
    if (ci) {
      ci = parseInt(ci, 10);
    }
    accumulator[table_name] = ci === 1;
    return accumulator;
  }, {});

  yield put({
    type: catalogActionTypes.TABLES_WITH_CI_STORE,
    payload: { result },
  });
}

export function* watchFetchTablesWithCI () {
  yield takeLatest(
    catalogActionTypes.FETCH_TABLES_WITH_CI_SEND,
    fetchTablesWithCI,
  );
}

export function* watchFetchTablesWithCISuccess () {
  yield takeLatest(
    catalogActionTypes.FETCH_TABLES_WITH_CI_SUCCESS,
    storeTablesWithCI,
  );
}

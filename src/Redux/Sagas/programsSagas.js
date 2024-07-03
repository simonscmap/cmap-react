import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';

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
    jsonResponse.programName = programName;
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


// fetch visualization data

function* programSampleVisDataFetch (action) {
  const { datasetShortName: shortname, variableData } = action.payload; // this is the variable short name
  const { meta } = variableData;
  const { visType } = meta;
  const plotType = visType;

  if (plotType !== 'Sparse' && plotType !== 'Heatmap') {
    yield put(catalogActions.programSampleVisDataSetLoadingState(action.payload, states.failed));
    return;
  }

  yield put(catalogActions.programSampleVisDataSetLoadingState(action.payload, states.inProgress));

  let result = yield call(
    api.visualization.variableSampleVisRequest,
    action.payload,
  );

  if (result.failed) {
    console.log ('vis var data request failed', result.status, result)
    yield put(catalogActions.programSampleVisDataSetLoadingState (shortname, states.failed));
  } else {
    if (result.variableValues.length > 0) {
      yield put(catalogActions.programSampleVisDataSetLoadingState (action.payload, states.processing));
      result.finalize();
      yield put(catalogActions.programSampleVisDataStore (action.payload, result));
    } else {
      // set loading status : error
      console.log ('variable values not greater than 0')
      yield put(catalogActions.programSampleVisDataSetLoadingState (action.payload, states.failed));
    }
  }
}// ⮷ &. Watcher ⮷
export function* watchProgramSampleVisDataFetch () {
  yield takeEvery (
    actionTypes.PROGRAM_SAMPLE_VIS_DATA_FETCH,
    programSampleVisDataFetch
  );
}

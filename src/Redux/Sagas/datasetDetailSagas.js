import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
// import * as interfaceActions from '../actions/ui';
import { call, put, takeEvery, select } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';


const SPARSE_DATA_QUERY_MAX_SIZE = 100000;

function* visualizableVariablesFetch (action) {
  const visVarLoadingState = yield select ((state) =>
    state.datasetDetailsPage.visualizableVariablesLoadingState);

  if (visVarLoadingState === states.inProgress) {
    console.log ('cancelling Vis. Var Fetch')
    return;
  }

  yield put(catalogActions.visualizableVariablesSetLoadingState (states.inProgress));

  let result = yield call(
    api.catalog.datasetVisualizableVariablesFetch, // api calls uspVariableCatalog for dataset
    action.payload.shortname,
  );

  if (result.ok) {
    let results = yield result.json();
    yield put(catalogActions.visualizableVariablesStore(results));
    yield put(catalogActions.visualizableVariablesSetLoadingState(states.succeeded));
  } else {
    yield put(catalogActions.visualizableVariablesSetLoadingState(states.failed));
  }
}// ⮷ &. Watcher ⮷
export function* watchVisualizableVariablesFetch() {
  yield takeEvery(
    actionTypes.DATASET_VISUALIZABLE_VARS_FETCH,
    visualizableVariablesFetch
  );
}



function* datasetVariableVisDataFetch (action) {
  const { shortname, variableData } = action.payload;
  const { meta } = variableData;
  const { visType } = meta;
  const plotType = visType;

  const dataFetchState = yield select ((state) =>
    state.datasetDetailsPage.visualizationDataByName && state.datasetDetailsPage.visualizationDataByName[shortname].loadingState);

  if (dataFetchState === states.inProgress || dataFetchState === states.processing) {
    console.log ('cancelling redundant vis var data fetch: already in progress or processing');
    return;
  } else if (dataFetchState === states.failed) {
    console.log ('cancelling vis var data fetch: this call has already failed');
    return;
  } else if (dataFetchState === states.succeeded) {
    console.log ('cancelling vis var data fetch: this call has already succeeded');
    return;
  } else {
    console.log('NOW IN PROGRESS', shortname);
    yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.inProgress));
  }

  if (plotType !== 'Histogram' && plotType !== 'Heatmap') {
    console.log ('invalid plotType provided to datasetVariableVisDataFetch', action.payload);
    yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.failed));
    return;
  }

  let result = yield call(
    api.visualization.datasetDetailPageVariableVisualizationRequest,
    action.payload,
  );

  if (result.failed) {
    console.log ('REQUEST FAILED');
    if (result.status === 401) {
      // yield put(userActions.refreshLogin());
      yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.failed));
      console.log ('error: 401');
      return;
    } else {
      // set loading status : error
      yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.failed));
    }
  } else {
    console.log ('REQUEST SUCCEEDED');
    if (result.variableValues.length > 0) {
      yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.processing));
      result.finalize();
      // yield put(visualizationActions.handleGuestVisualization());
      // yield put(visualizationActions.storedProcedureRequestSuccess());
      yield put(catalogActions.datasetVariableVisDataStore(shortname, result));
    } else {
      // set loading status : error
      yield put(catalogActions.datasetVariableVisDataSetLoadingState(shortname, states.failed));
    }
  }
}// ⮷ &. Watcher ⮷
export function* watchDatasetVariableVisDataFetch () {
  yield takeEvery(
    actionTypes.DATASET_VARIABLE_VIS_DATA_FETCH,
    datasetVariableVisDataFetch
  );
}

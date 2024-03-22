import api from '../../api/api';
import * as catalogActions from '../actions/catalog';
import * as actionTypes from '../actionTypes/catalog';
// import * as interfaceActions from '../actions/ui';
import { call, put, takeEvery, select } from 'redux-saga/effects';
import states from '../../enums/asyncRequestStates';

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

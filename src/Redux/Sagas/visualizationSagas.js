import api from '../../api/api';
import * as vizActions from '../actions/visualization';
import * as vizActionTypes from '../actionTypes/visualization';
import * as interfaceActions from '../actions/ui';
import { debounce, call, put, takeEvery, race, delay, select } from 'redux-saga/effects';
import { makeCheckQuerySizeRequest } from './downloadSagas';
import mapVizType from '../../Components/Visualization/helpers/mapVizType';
import storedProcedures from '../../enums/storedProcedures';
import spatialResolutions from '../../enums/spatialResolutions';
import { sparseDataQueryFromPayload } from '../../Components/Visualization/helpers';
import states from '../../enums/asyncRequestStates';

function* snack(msg) {
  yield put(interfaceActions.snackbarOpen(msg));
}

function* fail() {
  yield put(vizActions.setCheckVizQuerySizeStatus(states.failed));
  yield snack('Failed to estimate visualization data size.')
}

export function* requestTrajectoryPointCounts (/* action */) {
  let response = yield call(api.data.trajectoryCounts, null);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(vizActions.storeTrajectoryPointCounts(jsonResponse));
  } else {
    yield put(vizActions.trajectoryPointCountsFailure());
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestTrajectoryPointCounts() {
  yield takeEvery(
    vizActionTypes.TRAJECTORY_POINT_COUNT_FETCH,
    requestTrajectoryPointCounts
  );
}


export function* sqlifyStoredProcedureRequest (args) {
  // timeout after one minue
  const result = yield race({
    response: call (api.visualization.storedProcedureSQLify, args),
    timeout: delay (60 * 1000)
  });
  return result;
}


export function* checkVizQuerySize (action) {
  const checkStatus = yield select (state => state.viz
                                    && state.viz.chart
                                    && state.viz.chart.validation
                                    && state.viz.chart.validation.sizeCheck
                                   && state.viz.chart.validation.sizeCheck.status);

  if (checkStatus === states.inProgress) {
    return;
  }

  yield put(vizActions.setCheckVizQuerySizeStatus(states.inProgress));

  const payload = action.payload;
  const { metadata, parameters, vizType } = payload;
  const mapping = mapVizType(vizType);

  const isSparseVariable = metadata.Spatial_Resolution ===
      spatialResolutions.irregular;

  const isSparseQuery = isSparseVariable
        && mapping.sp !== storedProcedures.depthProfile;


  let queryString = '';
  // if sparse, generate query string
  if (isSparseQuery) {
    queryString = sparseDataQueryFromPayload (payload);
  } else {
    // otherwise get query string from store procedure API
    const { response, timeout } = yield sqlifyStoredProcedureRequest ({ parameters });
    if (timeout || response.failed) { // set status to failed
      console.log ('sqlify sp failed', response, timeout)
      yield fail();
      return;
    } else {
      // the sqlify option on the sp api will return an EXEC query string
      // with a bit at the end; if we submit that query as is
      // to the check-query route, another bit will be added redundantly
      // so remove the bit
      const q = response.query;
      if (q.charAt (q.length - 1) === '1') {
        const query = q.slice(0, q.lastIndexOf (','));
        queryString = query;
      } else {
        queryString = response.query;
      }
    }
  }

  // estimate query size
  let result;
  try {
    result = yield makeCheckQuerySizeRequest (queryString);
  } catch (e) {
    console.log ('query size check failed', result)
    yield fail();
    return;
  }

  const { response, timeout } = result;
  if (timeout || !response.ok) {
    yield fail();
    return;
  }

  let data;
  try {
    data = yield response.json();
  } catch (e) {
    yield fail();
    return;
  }

  yield put (vizActions.checkVizQuerySizeStore(data));
} // ⮷ &. Watcher ⮷

export function* watchCheckVizQuerySize() {
  yield debounce (
    450,
    vizActionTypes.CHECK_VIZ_QUERY_SIZE,
    checkVizQuerySize
  );
}

import api from '../../api/api';
import * as vizActions from '../actions/visualization';
import * as vizActionTypes from '../actionTypes/visualization';
import { call, put, takeEvery, race, delay } from 'redux-saga/effects';
import { makeCheckQuerySizeRequest } from './downloadSagas';
import mapVizType from '../../Components/Visualization/helpers/mapVizType';
import storedProcedures from '../../enums/storedProcedures';
import spatialResolutions from '../../enums/spatialResolutions';
import { sparseDataQueryFromPayload } from '../../Components/Visualization/helpers';

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
    const { result, timeout } = yield sqlifyStoredProcedureRequest ({ parameters });
    if (timeout || result.failed) {
      // set status to failed
    } else {
      queryString = result.query;
    }
  }

  // estimate query size
  let result;
  try {
    result = yield makeCheckQuerySizeRequest (queryString);
  } catch (e) {
    // TODO set status to failed
  }

  const { response, timeout } = result;
  if (timeout || !response.ok) {
    // TODO set status to failed
  }

  // TODO update state with result

}

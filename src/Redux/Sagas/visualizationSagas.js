import api from '../../api/api';
import * as vizActions from '../actions/visualization';
import * as vizActionTypes from '../actionTypes/visualization';
import { call, put, takeEvery } from 'redux-saga/effects';

export function* requestTrajectoryPointCounts (action) {
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

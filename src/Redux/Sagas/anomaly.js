import api from '../../api/api';
import * as dataActions from '../actions/data';
import * as dataActionTypes from '../actionTypes/data';
import { call, put, takeEvery } from 'redux-saga/effects';

// import dispatchCustomWindowEvent from '../../Utility/Events/dispatchCustomWindowEvent';

const processData = (data, unitString, color) => {
  // const start = Date.now();
  const input = [];
  Object.keys(data).forEach((k) => {
    const [lat, lon] = k.split(',');
    const name = `${lat},${lon}`;
    input.push({
      type: "scattergl",
      mode: "line",
      // hovertemplate: `Lat: ${lat}, Lon: ${lon}<br>Time: %{x|%b, %Y}<br>Anomaly: %{y:.1f} ${unitString}<extra></extra>`,
      hovertemplate: `Time: %{x|%b, %Y}<br>Anomaly: %{y:.3f} ${unitString}<extra></extra>`,
      x: data[k].x.map((s) => {
        const [yr, mo] = s.split(', ');
        const newX = new Date(yr, mo);
        return newX;
      }),
      // y: data[k].y.map ((v) => (v/100)),
      y: data[k].y,
      name,
      line: {
        color: color || 'rgba(161, 246, 64, 1)',
        width: 5,
      }
    });
  });
  // const subject = unitString === 'm' ? 'adt' : 'sst';
  // console.log ('process time', subject, Date.now() - start);
  return input;
}

/* AVG SST ANOMALY DATA */
export function* requestAvgSSTAnomalyDataSend (action) {
  const name = action.payload.namedDataName;
  let response = yield call(api.data.named, name);
  yield put(dataActions.avgSstAnomalyDataProcessing());

  if (response && response.ok) {
    const jsonResponse = yield response.json();
    const data = processData (jsonResponse, '°C');
    // console.log ('assigning sst to window');
    // window.sstAnomalyData = data;
    // console.log ('done assigning sst');
    yield put(dataActions.avgSstAnomalyDataSuccess(data));
    // dispatchCustomWindowEvent ('sstAnomalyDataReady', null);
  } else {
    yield put(dataActions.avgSstAnomalyDataFailure(response.status));
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestAvgSSTAnomalyDataSend() {
  yield takeEvery(dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_SEND, requestAvgSSTAnomalyDataSend);
}

/* AVG ADT ANOMALY DATA */
export function* requestAvgADTAnomalyDataSend (action) {
  const name = action.payload.namedDataName;
  let response = yield call(api.data.named, name);
  yield put(dataActions.adtAnomalyDataProcessing());
  if (response && response.ok) {
    const jsonResponse = yield response.json();
    const data = processData (jsonResponse, 'm', 'rgba(105, 255, 242, 1)');
    // console.log ('assigning adt to window');
    // window.adtAnomalyData = data;
    // console.log ('done assigning adt');
    yield put(dataActions.avgAdtAnomalyDataSuccess(data));
    // dispatchCustomWindowEvent ('adtAnomalyDataReady', null);
  } else {
    yield put(dataActions.avgAdtAnomalyDataFailure(response.status));
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestAvgADTAnomalyDataSend() {
  yield takeEvery(dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_SEND, requestAvgADTAnomalyDataSend);
}

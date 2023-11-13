import api from '../../api/api';
import * as dataActions from '../actions/data';
import * as dataActionTypes from '../actionTypes/data';
import { call, put, takeEvery } from 'redux-saga/effects';
import dispatchCustomWindowEvent from '../../Utility/Events/dispatchCustomWindowEvent';

const processData = (data, unitString) => {
  const start = Date.now();
  const input = [];
  Object.keys(data).forEach((k) => {
    const [lat, lon] = k.split(',');
    const name = `${lat},${lon}`;
    input.push({
      type: "scattergl",
      mode: "line",
      hovertemplate: `Lat: ${lat}, Lon: ${lon}<br>Time: %{x|%b, %Y}<br>Anomaly: %{y:.1f} ${unitString}<extra></extra>`,
      x: data[k].x.map((s) => {
        const [yr, mo] = s.split(', ');
        const newX = new Date(yr, mo);
        return newX;
      }),
      y: data[k].y.map ((v) => (v/100)),
      name,
      line: {
        color: 'rgba(161, 246, 64, 0.1)',
      }
    });
  });
  const subject = unitString === 'm' ? 'adt' : 'sst';
  console.log ('process time', subject, Date.now() - start);
  return input;
}

/* SST ANOMALY DATA */
export function* requestSSTAnomalyDataSend (action) {
  const name = action.payload.namedDataName;
  let response = yield call(api.data.named, name);
  yield put(dataActions.sstAnomalyDataProcessing());

  if (response && response.ok) {
    const jsonResponse = yield response.json();
    const data = processData (jsonResponse, '°C');
    console.log ('assigning sst to window');
    window.sstAnomalyData = data;
    console.log ('done assigning sst');
    // yield put(dataActions.sstAnomalyDataSuccess());
    dispatchCustomWindowEvent ('sstAnomalyDataReady', null);
    console.log ('done notifying stt success');
  } else {
    yield put(dataActions.sstAnomalyDataFailure(response.status));
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestSSTAnomalyDataSend() {
  yield takeEvery(dataActionTypes.SST_ANOMALY_DATA_REQUEST_SEND, requestSSTAnomalyDataSend);
}

/* ADT ANOMALY DATA */
export function* requestADTAnomalyDataSend (action) {
  const name = action.payload.namedDataName;
  let response = yield call(api.data.named, name);
  yield put(dataActions.adtAnomalyDataProcessing());
  if (response && response.ok) {
    const jsonResponse = yield response.json();
    const data = processData (jsonResponse, 'm');
    console.log ('assigning adt to window');
    window.adtAnomalyData = data;
    console.log ('done assigning adt');
    // yield put(dataActions.adtAnomalyDataSuccess());
    dispatchCustomWindowEvent ('adtAnomalyDataReady', null);

    console.log ('done notifying adt success');
  } else {
    yield put(dataActions.adtAnomalyDataFailure(response.status));
  }
} // ⮷ &. Watcher ⮷

export function* watchRequestADTAnomalyDataSend() {
  yield takeEvery(dataActionTypes.ADT_ANOMALY_DATA_REQUEST_SEND, requestADTAnomalyDataSend);
}

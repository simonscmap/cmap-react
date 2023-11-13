import * as dataActionTypes from '../actionTypes/data';

export const requestSSTAnomalyDataSend = () => ({
  type: dataActionTypes.SST_ANOMALY_DATA_REQUEST_SEND,
  payload: {
    namedDataName: 'sst',
  }
});

export const sstAnomalyDataStreaming = () => ({
  type: dataActionTypes.SST_ANOMALY_DATA_REQUEST_STREAMING,
});

export const sstAnomalyDataProcessing = () => ({
  type: dataActionTypes.SST_ANOMALY_DATA_REQUEST_PROCESSING,
});

export const sstAnomalyDataSuccess = () => ({
  type: dataActionTypes.SST_ANOMALY_DATA_REQUEST_SUCCESS,
});

export const sstAnomalyDataFailure = (errorMessage) => ({
  type: dataActionTypes.SST_ANOMALY_DATA_REQUEST_FAILURE,
  payload: errorMessage,
});

/* ADT */
export const requestADTAnomalyDataSend = () => ({
  type: dataActionTypes.ADT_ANOMALY_DATA_REQUEST_SEND,
  payload: {
    namedDataName: 'adt',
  }
});

export const adtAnomalyDataStreaming = () => ({
  type: dataActionTypes.ADT_ANOMALY_DATA_REQUEST_STREAMING,
});

export const adtAnomalyDataProcessing = () => ({
  type: dataActionTypes.ADT_ANOMALY_DATA_REQUEST_PROCESSING,
});

export const adtAnomalyDataSuccess = () => ({
  type: dataActionTypes.ADT_ANOMALY_DATA_REQUEST_SUCCESS,
});

export const adtAnomalyDataFailure = (errorMessage) => ({
  type: dataActionTypes.ADT_ANOMALY_DATA_REQUEST_FAILURE,
  payload: errorMessage,
});

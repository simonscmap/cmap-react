import * as dataActionTypes from '../actionTypes/data';

/* SST */
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

/* AVG SST */
export const requestAvgSSTAnomalyDataSend = () => ({
  type: dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_SEND,
  payload: {
    namedDataName: 'avg-sst',
  }
});

export const avgSstAnomalyDataStreaming = () => ({
  type: dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_STREAMING,
});

export const avgSstAnomalyDataProcessing = () => ({
  type: dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_PROCESSING,
});

export const avgSstAnomalyDataSuccess = (data) => ({
  type: dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_SUCCESS,
  payload: data,
});

export const avgSstAnomalyDataFailure = (errorMessage) => ({
  type: dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_FAILURE,
  payload: errorMessage,
});

/* AVG ADT */
export const requestAvgADTAnomalyDataSend = () => ({
  type: dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_SEND,
  payload: {
    namedDataName: 'avg-adt',
  }
});

export const avgAdtAnomalyDataStreaming = () => ({
  type: dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_STREAMING,
});

export const avgAdtAnomalyDataProcessing = () => ({
  type: dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_PROCESSING,
});

export const avgAdtAnomalyDataSuccess = (data) => ({
  type: dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_SUCCESS,
  payload: data,
});

export const avgAdtAnomalyDataFailure = (errorMessage) => ({
  type: dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_FAILURE,
  payload: errorMessage,
});

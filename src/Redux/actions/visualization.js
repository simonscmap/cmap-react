import * as visualizationActionTypes from '../actionTypes/visualization';

export const queryRequestSend = (query) => ({
    type: visualizationActionTypes.QUERY_REQUEST_SEND,
    payload: {
        query
    }
})

export const queryRequestSuccess = (data) => ({
    type: visualizationActionTypes.QUERY_REQUEST_SUCCESS,
    payload: {
        data
    }
})

export const queryRequestFailure = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_FAILURE
})

export const queryRequestProcessing = () => ({
    type: visualizationActionTypes.QUERY_REQUEST_PROCESSING
})

export const storedProcedureRequestSend = (storedProcedureInfo) => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SEND,
    payload: {...storedProcedureInfo}
})

export const storedProcedureRequestSuccess = (data) => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_SUCCESS,
    payload: {
        data
    }
})

export const storedProcedureRequestFailure = () => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_FAILURE
})

export const storedProcedureRequestProcessing = () => ({
    type: visualizationActionTypes.STORED_PROCEDURE_REQUEST_PROCESSING
})

export const addLayer = (newLayer) => ({
    type: visualizationActionTypes.ADD_LAYER,
    payload: {
        newLayer
    }
})

export const storeSampleData = sampleData => ({
    type: visualizationActionTypes.STORE_SAMPLE_DATA,
    payload: {
        sampleData
    }
})

export const addMap = (mapInfo) => ({
    type: visualizationActionTypes.ADD_MAP,
    payload: {
        mapInfo
    }
})

export const addChart = (chartInfo) => ({
    type: visualizationActionTypes.ADD_CHART,
    payload: {
        chartInfo
    }
})

export const clearCharts = () => ({
    type: visualizationActionTypes.CLEAR_CHARTS
})

export const clearMaps = () => ({
    type: visualizationActionTypes.CLEAR_MAPS
})

export const deleteChart = (chartIndex) => ({
    type: visualizationActionTypes.DELETE_CHART,
    payload: {
        chartIndex
    }
})

export const tableStatsRequestSend = (tableName, datasetLongName) => ({
    type: visualizationActionTypes.TABLE_STATS_REQUEST_SEND,
    payload: {
        tableName,
        datasetLongName
    }
})

export const tableStatsRequestProcessing = () => ({
    type: visualizationActionTypes.TABLE_STATS_REQUEST_PROCESSING
})

export const tableStatsRequestSuccess = (tableStats, datasetLongName) => ({
    type: visualizationActionTypes.TABLE_STATS_REQUEST_SUCCESS,
    payload: {
        tableStats,
        datasetLongName
    }
})

export const tableStatsRequestFailure = () => ({
    type: visualizationActionTypes.TABLE_STATS_REQUEST_FAILURE
})

export const cruiseTrajectoryRequestSend = (id) => ({
    type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SEND,
    payload: {
        id
    }
})

export const cruiseTrajectoryRequestSuccess = (trajectory) => ({
    type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SUCCESS,
    payload: {
        trajectory
    }
})

export const cruiseTrajectoryRequestFailure = () => ({
    type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_FAILURE,
})

export const cruiseTrajectoryRequestProcessing = () => ({
    type: visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_PROCESSING,
})

export const cruiseTrajectoryClear = () => ({
    type: visualizationActionTypes.CRUISE_TRAJECTORY_CLEAR
})

export const cruiseListRequestSend = (id) => ({
    type: visualizationActionTypes.CRUISE_LIST_REQUEST_SEND,
})

export const cruiseListRequestSuccess = (cruiseList) => ({
    type: visualizationActionTypes.CRUISE_LIST_REQUEST_SUCCESS,
    payload: {
        cruiseList
    }
})

export const cruiseListRequestFailure = () => ({
    type: visualizationActionTypes.CRUISE_LIST_REQUEST_FAILURE,
})

export const cruiseListRequestProcessing = () => ({
    type: visualizationActionTypes.CRUISE_LIST_REQUEST_PROCESSING,
})

export const triggerShowCharts = () => ({
    type: visualizationActionTypes.TRIGGER_SHOW_CHARTS
})

export const completedShowCharts = () => ({
    type: visualizationActionTypes.COMPLETED_SHOW_CHARTS
})

export const csvDownloadRequestSend = (query, fileName, tableName) => ({
    type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SEND,
    payload: {
        query,
        fileName,
        tableName
    }
})

export const csvDownloadRequestFailure = () => ({
    type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_FAILURE
})

export const csvDownloadRequestProcessing = () => ({
    type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_PROCESSING
})

export const csvDownloadRequestSuccess = (text) => ({
    type: visualizationActionTypes.CSV_DOWNLOAD_REQUEST_SUCCESS,
    payload: {
        text
    }
})

//dataset download
export const downloadTextAsCsv = (text, datasetName) => ({
    type: visualizationActionTypes.DOWNLOAD_TEXT_AS_CSV,
    payload: {
        text,
        datasetName
    }
})
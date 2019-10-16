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

export const getTableStats = (tableName) => ({
    type: visualizationActionTypes.GET_TABLE_STATS,
    payload: {
        tableName
    }
})

export const getTableStatsRequestProcessing = () => ({
    type: visualizationActionTypes.GET_TABLE_STATS_REQUEST_PROCESSING
})

export const storeTableStats = (tableStats) => ({
    type: visualizationActionTypes.STORE_TABLE_STATS,
    payload: {
        tableStats
    }
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
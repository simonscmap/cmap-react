import states from '../../asyncRequestStates';
import * as visualizationActionTypes from '../actionTypes/visualization';

export default function(state, action) {
    switch(action.type) {
        case visualizationActionTypes.QUERY_REQUEST_PROCESSING: return {...state, queryRequestState: states.inProgress};
        case visualizationActionTypes.QUERY_REQUEST_FAILURE: return {...state, queryRequestState: states.failed};
        case visualizationActionTypes.QUERY_REQUEST_SUCCESS: return {...state, queryRequestState: states.succeeded};
        
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_PROCESSING: return {...state, storedProcedureRequestState: states.inProgress}
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_FAILURE: return {...state, storedProcedureRequestState: states.failed}
        case visualizationActionTypes.STORED_PROCEDURE_REQUEST_SUCCESS: return {...state, storedProcedureRequestState: states.succeeded}


        case visualizationActionTypes.ADD_LAYER: return { // Not currently in use
            ...state,
            layers: [...state.layers, action.payload.newLayer]
        }

        case visualizationActionTypes.STORE_SAMPLE_DATA: return {
            ...state,
            sampleData: action.payload.sampleData
        }

        case visualizationActionTypes.ADD_MAP: return {
            ...state,
            maps: [...state.maps, action.payload.mapInfo]
        }

        case visualizationActionTypes.ADD_CHART: return {
            ...state,
            charts: [...state.charts, action.payload.chartInfo]
        }

        case visualizationActionTypes.CLEAR_CHARTS: return {...state, charts: []}

        case visualizationActionTypes.CLEAR_MAPS: return {...state, maps: []}

        case visualizationActionTypes.GET_TABLE_STATS_REQUEST_PROCESSING: return {...state, getTableStatsRequestState: states.inProgress}

        case visualizationActionTypes.STORE_TABLE_STATS: return {...state,
            getTableStatsRequestState: states.succeeded,
            tableStats: {
                ...state.tableStats,
                ...action.payload.tableStats
            }
        }

        default: return state;
    }
}
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
            charts: [{...action.payload.chartInfo, id: state.chartID}, ...state.charts],
            chartID: state.chartID + 1
        }

        case visualizationActionTypes.CLEAR_CHARTS: return {...state, charts: []}

        case visualizationActionTypes.CLEAR_MAPS: return {...state, maps: []}

        case visualizationActionTypes.DELETE_CHART: return {...state, 
            charts: [
                ...state.charts.slice(0, action.payload.chartIndex),
                ...state.charts.slice(action.payload.chartIndex + 1)
            ]
        }

        case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_PROCESSING: return {...state, getCruiseTrajectoryRequestState: states.inProgress}

        case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_SUCCESS: return {...state,
            cruiseTrajectory: action.payload.trajectory,
            getCruiseTrajectoryRequestState: states.succeeded
        }

        case visualizationActionTypes.CRUISE_TRAJECTORY_CLEAR: return {...state, cruiseTrajectory: null}

        case visualizationActionTypes.CRUISE_TRAJECTORY_REQUEST_FAILURE: return {...state, getCruiseTrajectoryRequestState: states.failed}

        case visualizationActionTypes.CRUISE_LIST_REQUEST_PROCESSING: return {...state, getCruiseListRequestState: states.inProgress}

        case visualizationActionTypes.CRUISE_LIST_REQUEST_SUCCESS: return {
            ...state,
            getCruiseListRequestState: states.succeeded,
            cruiseList: action.payload.cruiseList
        }

        case visualizationActionTypes.TRIGGER_SHOW_CHARTS: return {...state, showChartsOnce: true}
        case visualizationActionTypes.COMPLETED_SHOW_CHARTS: return {...state, showChartsOnce: false}

        case visualizationActionTypes.TABLE_STATS_REQUEST_SUCCESS: return {
            ... state, 
            datasets: {
                ...state.datasets,
                [action.payload.datasetLongName]: {
                    ...state.datasets[action.payload.datasetLongName],
                    tableStats: action.payload.tableStats
                }
            }}

        default: return state;
    }
}
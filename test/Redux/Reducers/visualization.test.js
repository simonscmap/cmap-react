import visualizationReducer from '../../../src/Redux/Reducers/visualization.js';
import states from '../../../src/enums/asyncRequestStates.js';
import { helpActionTypes } from '../../../src/Redux/actions/help.js';
import { VISUALIZATION_PAGE } from '../../../src/constants.js';
import {
  QUERY_REQUEST_PROCESSING,
  QUERY_REQUEST_FAILURE,
  QUERY_REQUEST_SUCCESS,
  STORE_SAMPLE_DATA,
  ADD_CHART,
  CLEAR_CHARTS,
  CLEAR_MAPS,
  CLOSE_CHART,
  CRUISE_TRAJECTORY_REQUEST_PROCESSING,
  CRUISE_TRAJECTORY_REQUEST_SUCCESS,
  CRUISE_TRAJECTORY_CLEAR,
  CRUISE_TRAJECTORY_REQUEST_FAILURE,
  CRUISE_TRAJECTORY_ZOOM_TO,
  CRUISE_LIST_REQUEST_PROCESSING,
  CRUISE_LIST_REQUEST_SUCCESS,
  CRUISE_LIST_REQUEST_FAILURE,
  TRIGGER_SHOW_CHARTS,
  COMPLETED_SHOW_CHARTS,
  TABLE_STATS_REQUEST_SUCCESS,
  VIZ_PAGE_DATA_TARGET_SET,
  VIZ_PAGE_DATA_TARGET_DETAILS_STORE,
  VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS,
  VIZ_SEARCH_RESULTS_STORE,
  VIZ_SEARCH_RESULTS_SET_LOADING_STATE,
  MEMBER_VARIABLES_STORE,
  MEMBER_VARIABLES_SET_LOADING_STATE,
  RELATED_DATA_STORE,
  RELATED_DATA_SET_LOADING_STATE,
  VARIABLE_NAME_AUTOCOMPLETE_STORE,
  VARIABLE_STORE,
  VARIABLE_FETCH_SET_LOADING_STATE,
  DATASET_SUMMARY_STORE,
  PLOTS_ACTIVE_TAB_SET,
  SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE,
  GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE,
  VIZ_CONTROL_PANEL_VISIBILITY,
  DATA_SEARCH_VISIBILITY,
  TRAJECTORY_POINT_COUNT_SUCCESS,
  SET_PARAM_LOCK,
  SET_LOCK_ALERTS_OPEN,
  CHECK_VIZ_QUERY_SIZE_STORE,
  SET_CHECK_VIZ_QUERY_SIZE_STATUS,
} from '../../../src/Redux/actionTypes/visualization.js';

describe('visualization reducer', () => {
  // Mock initial state that would be provided by the hybrid reducer
  const mockInitialState = {
    charts: [],
    viz: {
      chart: {
        controls: {
          paramLock: false,
          dateTypeMismatch: false,
          variableResolutionMismatch: false,
          lockAlertsOpen: false,
          resolutionMismatch: false,
        },
        validation: {
          sizeCheck: {
            status: states.notTried,
            result: null,
          },
        },
      },
    },
    showControlPanel: true,
    dataSearchMenuOpen: false,
    memberVariables: [],
    memberVariablesLoadingState: states.succeeded,
    chartID: 0,
    vizPageDataTarget: null,
    vizPageDataTargetDetails: null,
    vizSearchResults: { Observation: [], Model: [] },
    vizSearchResultsFullCounts: { Observation: 0, Model: 0 },
    vizSearchResultsLoadingState: states.succeeded,
    showChartsOnce: null,
    cruiseList: [],
    trajectoryPointCounts: null,
    getCruiseTrajectoryRequestState: null,
    cruiseTrajectories: null,
    cruiseTrajectoryFocus: null,
    cruiseTrajectoryFocusNonce: 0,
    sampleData: null,
    queryRequestState: null,
    relatedData: [],
    relatedDataLoadingState: states.succeeded,
    autocompleteVariableNames: [],
    variableDetails: null,
    variableFetchLoadingState: states.notTried,
    datasetSummary: null,
    plotsActiveTab: 0,
    sparseDataMaxSizeNotificationData: null,
    guestPlotLimitNotificationIsVisible: false,
    datasets: {},
    intros: { [VISUALIZATION_PAGE]: false },
  };

  describe('Query Request Actions', () => {
    it('should handle QUERY_REQUEST_PROCESSING', () => {
      const action = { type: QUERY_REQUEST_PROCESSING };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.queryRequestState).toBe(states.inProgress);
      expect(result.charts).toBe(mockInitialState.charts); // State shape preserved
    });

    it('should handle QUERY_REQUEST_FAILURE', () => {
      const action = { type: QUERY_REQUEST_FAILURE };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.queryRequestState).toBe(states.failed);
      expect(result.charts).toBe(mockInitialState.charts); // State shape preserved
    });

    it('should handle QUERY_REQUEST_SUCCESS', () => {
      const action = { type: QUERY_REQUEST_SUCCESS };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.queryRequestState).toBe(states.succeeded);
      expect(result.charts).toBe(mockInitialState.charts); // State shape preserved
    });
  });

  describe('Sample Data Actions', () => {
    it('should handle STORE_SAMPLE_DATA', () => {
      const sampleData = [{ id: 1, value: 'test' }];
      const action = {
        type: STORE_SAMPLE_DATA,
        payload: { sampleData }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.sampleData).toEqual(sampleData);
      expect(result.charts).toBe(mockInitialState.charts); // Other state preserved
    });
  });

  describe('Chart Management Actions', () => {
    it('should handle ADD_CHART', () => {
      const chartInfo = { type: 'scatter', data: [1, 2, 3] };
      const action = {
        type: ADD_CHART,
        payload: { chartInfo }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.charts).toHaveLength(1);
      expect(result.charts[0]).toEqual({ ...chartInfo, id: 0 });
      expect(result.chartID).toBe(1);
      expect(result.plotsActiveTab).toBe(1);
    });

    it('should handle ADD_CHART with existing charts', () => {
      const existingState = {
        ...mockInitialState,
        charts: [{ id: 0, type: 'line' }],
        chartID: 1
      };
      const chartInfo = { type: 'scatter', data: [1, 2, 3] };
      const action = {
        type: ADD_CHART,
        payload: { chartInfo }
      };
      const result = visualizationReducer(existingState, action);
      
      expect(result.charts).toHaveLength(2);
      expect(result.charts[0]).toEqual({ ...chartInfo, id: 1 }); // New chart first
      expect(result.charts[1]).toEqual({ id: 0, type: 'line' }); // Existing chart second
      expect(result.chartID).toBe(2);
      expect(result.plotsActiveTab).toBe(2);
    });

    it('should handle CLEAR_CHARTS', () => {
      const stateWithCharts = {
        ...mockInitialState,
        charts: [{ id: 0 }, { id: 1 }]
      };
      const action = { type: CLEAR_CHARTS };
      const result = visualizationReducer(stateWithCharts, action);
      
      expect(result.charts).toEqual([]);
      expect(result.chartID).toBe(stateWithCharts.chartID); // chartID preserved
    });

    it('should handle CLEAR_MAPS', () => {
      const stateWithMaps = {
        ...mockInitialState,
        maps: [{ id: 0 }, { id: 1 }]
      };
      const action = { type: CLEAR_MAPS };
      const result = visualizationReducer(stateWithMaps, action);
      
      expect(result.maps).toEqual([]);
    });

    it('should handle CLOSE_CHART', () => {
      const stateWithCharts = {
        ...mockInitialState,
        charts: [{ id: 0 }, { id: 1 }, { id: 2 }]
      };
      const action = {
        type: CLOSE_CHART,
        payload: { chartIndex: 1 }
      };
      const result = visualizationReducer(stateWithCharts, action);
      
      expect(result.charts).toHaveLength(2);
      expect(result.charts[0]).toEqual({ id: 0 });
      expect(result.charts[1]).toEqual({ id: 2 });
      expect(result.plotsActiveTab).toBe(1);
    });

    it('DEP_should handle CLOSE_CHART when only one chart remains', () => {
      const stateWithOneChart = {
        ...mockInitialState,
        charts: [{ id: 0 }]
      };
      const action = {
        type: CLOSE_CHART,
        payload: { chartIndex: 0 }
      };
      const result = visualizationReducer(stateWithOneChart, action);
      
      expect(result.charts).toEqual([]);
      expect(result.plotsActiveTab).toBe(0);
    });
  });

  describe('Trajectory Actions', () => {
    it('should handle TRAJECTORY_POINT_COUNT_SUCCESS', () => {
      const trajectoryData = { cruise1: 100, cruise2: 200 };
      const action = {
        type: TRAJECTORY_POINT_COUNT_SUCCESS,
        payload: trajectoryData
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.trajectoryPointCounts).toEqual(trajectoryData);
    });

    it('should handle CRUISE_TRAJECTORY_REQUEST_PROCESSING', () => {
      const action = { type: CRUISE_TRAJECTORY_REQUEST_PROCESSING };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.getCruiseTrajectoryRequestState).toBe(states.inProgress);
    });

    it('should handle CRUISE_TRAJECTORY_REQUEST_SUCCESS', () => {
      const trajectories = [{ id: 1, path: [[0, 0], [1, 1]] }];
      const action = {
        type: CRUISE_TRAJECTORY_REQUEST_SUCCESS,
        payload: { trajectories }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.cruiseTrajectories).toEqual(trajectories);
      expect(result.getCruiseTrajectoryRequestState).toBe(states.succeeded);
    });

    it('should handle CRUISE_TRAJECTORY_CLEAR', () => {
      const stateWithTrajectories = {
        ...mockInitialState,
        cruiseTrajectories: [{ id: 1 }]
      };
      const action = { type: CRUISE_TRAJECTORY_CLEAR };
      const result = visualizationReducer(stateWithTrajectories, action);
      
      expect(result.cruiseTrajectories).toBe(null);
    });

    it('should handle CRUISE_TRAJECTORY_ZOOM_TO', () => {
      const focusData = { lat: 45.5, lng: -120.3 };
      const action = {
        type: CRUISE_TRAJECTORY_ZOOM_TO,
        payload: focusData
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.cruiseTrajectoryFocus).toEqual(focusData);
      expect(typeof result.cruiseTrajectoryFocusNonce).toBe('number');
      expect(result.cruiseTrajectoryFocusNonce).not.toBe(mockInitialState.cruiseTrajectoryFocusNonce);
    });

    it('should handle CRUISE_TRAJECTORY_REQUEST_FAILURE', () => {
      const action = { type: CRUISE_TRAJECTORY_REQUEST_FAILURE };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.getCruiseTrajectoryRequestState).toBe(states.failed);
    });
  });

  describe('Cruise List Actions', () => {
    it('should handle CRUISE_LIST_REQUEST_PROCESSING', () => {
      const action = { type: CRUISE_LIST_REQUEST_PROCESSING };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.getCruiseListRequestState).toBe(states.inProgress);
    });

    it('should handle CRUISE_LIST_REQUEST_SUCCESS', () => {
      const cruiseList = [{ name: 'HOT-282' }, { name: 'HOT-283' }];
      const action = {
        type: CRUISE_LIST_REQUEST_SUCCESS,
        payload: { cruiseList }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.getCruiseListRequestState).toBe(states.succeeded);
      expect(result.cruiseList).toEqual(cruiseList);
    });
  });

  describe('Chart Display Actions', () => {
    it('should handle TRIGGER_SHOW_CHARTS', () => {
      const action = { type: TRIGGER_SHOW_CHARTS };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.showChartsOnce).toBe(true);
    });

    it('should handle COMPLETED_SHOW_CHARTS', () => {
      const stateWithShowCharts = {
        ...mockInitialState,
        showChartsOnce: true
      };
      const action = { type: COMPLETED_SHOW_CHARTS };
      const result = visualizationReducer(stateWithShowCharts, action);
      
      expect(result.showChartsOnce).toBe(false);
    });
  });

  describe('Table Stats Actions', () => {
    it('should handle TABLE_STATS_REQUEST_SUCCESS', () => {
      const tableStats = { rowCount: 1000, columnCount: 5 };
      const datasetLongName = 'Test Dataset';
      const initialDatasets = { 'Other Dataset': { name: 'Other' } };
      const stateWithDatasets = {
        ...mockInitialState,
        datasets: initialDatasets
      };
      
      const action = {
        type: TABLE_STATS_REQUEST_SUCCESS,
        payload: { tableStats, datasetLongName }
      };
      const result = visualizationReducer(stateWithDatasets, action);
      
      expect(result.datasets[datasetLongName].tableStats).toEqual(tableStats);
      expect(result.datasets['Other Dataset']).toEqual(initialDatasets['Other Dataset']); // Other datasets preserved
    });

    it('should handle TABLE_STATS_REQUEST_SUCCESS for existing dataset', () => {
      const tableStats = { rowCount: 2000, columnCount: 8 };
      const datasetLongName = 'Existing Dataset';
      const existingDataset = { name: 'Existing', oldStats: 'preserved' };
      const stateWithDatasets = {
        ...mockInitialState,
        datasets: { [datasetLongName]: existingDataset }
      };
      
      const action = {
        type: TABLE_STATS_REQUEST_SUCCESS,
        payload: { tableStats, datasetLongName }
      };
      const result = visualizationReducer(stateWithDatasets, action);
      
      expect(result.datasets[datasetLongName]).toEqual({
        ...existingDataset,
        tableStats
      });
    });
  });

  describe('Data Target Actions', () => {
    // ADD MISSING COMPLEX LOGIC TESTS
    describe('Complex Date Type Mismatch Logic', () => {
      it('should calculate dateTypeMismatch when paramLock is true and temporal resolution changes from monthly climatology', () => {
        const stateWithParamLock = {
          ...mockInitialState,
          viz: {
            ...mockInitialState.viz,
            chart: {
              ...mockInitialState.viz.chart,
              controls: {
                ...mockInitialState.viz.chart.controls,
                paramLock: true,
              },
            },
          },
          vizPageDataTarget: {
            Dataset_Short_Name: 'HOT_APEX',
            Temporal_Resolution: 'Monthly Climatology',
          },
        };
        
        const action = {
          type: VIZ_PAGE_DATA_TARGET_SET,
          payload: {
            target: {
              Dataset_Short_Name: 'HOT_APEX',
              Temporal_Resolution: 'Daily',
            },
          },
        };
        
        const result = visualizationReducer(stateWithParamLock, action);
        
        expect(result.viz.chart.controls.dateTypeMismatch).toBe(true);
        expect(result.viz.chart.controls.lockAlertsOpen).toBe(true); // Should open alerts
      });
      
      it('should not calculate dateTypeMismatch when paramLock is false', () => {
        const stateWithoutParamLock = {
          ...mockInitialState,
          viz: {
            ...mockInitialState.viz,
            chart: {
              ...mockInitialState.viz.chart,
              controls: {
                ...mockInitialState.viz.chart.controls,
                paramLock: false,
                dateTypeMismatch: true, // Previous state
              },
            },
          },
          vizPageDataTarget: {
            Dataset_Short_Name: 'HOT_APEX',
            Temporal_Resolution: 'Monthly Climatology',
          },
        };
        
        const action = {
          type: VIZ_PAGE_DATA_TARGET_SET,
          payload: {
            target: {
              Dataset_Short_Name: 'HOT_APEX',
              Temporal_Resolution: 'Daily',
            },
          },
        };
        
        const result = visualizationReducer(stateWithoutParamLock, action);
        
        expect(result.viz.chart.controls.dateTypeMismatch).toBe(true); // Should preserve previous state
      });
    });
    
    describe('Variable Resolution Mismatch Logic', () => {
      it('should calculate variableResolutionMismatch when paramLock is true and dataset changes', () => {
        const stateWithParamLock = {
          ...mockInitialState,
          viz: {
            ...mockInitialState.viz,
            chart: {
              ...mockInitialState.viz.chart,
              controls: {
                ...mockInitialState.viz.chart.controls,
                paramLock: true,
              },
            },
          },
          vizPageDataTargetDetails: {
            Short_Name: 'OLD_DATASET',
          },
        };
        
        const action = {
          type: VIZ_PAGE_DATA_TARGET_SET,
          payload: {
            target: {
              Dataset_Short_Name: 'NEW_DATASET',
            },
          },
        };
        
        const result = visualizationReducer(stateWithParamLock, action);
        
        expect(result.viz.chart.controls.variableResolutionMismatch).toBe(true);
        expect(result.viz.chart.controls.lockAlertsOpen).toBe(true); // Should open alerts
      });
      
      it('should not calculate variableResolutionMismatch when dataset names match', () => {
        const stateWithParamLock = {
          ...mockInitialState,
          viz: {
            ...mockInitialState.viz,
            chart: {
              ...mockInitialState.viz.chart,
              controls: {
                ...mockInitialState.viz.chart.controls,
                paramLock: true,
              },
            },
          },
          vizPageDataTargetDetails: {
            Short_Name: 'SAME_DATASET',
          },
        };
        
        const action = {
          type: VIZ_PAGE_DATA_TARGET_SET,
          payload: {
            target: {
              Dataset_Short_Name: 'SAME_DATASET',
            },
          },
        };
        
        const result = visualizationReducer(stateWithParamLock, action);
        
        expect(result.viz.chart.controls.variableResolutionMismatch).toBe(false);
      });
    });
    
    describe('Lock Alerts Logic', () => {
      it('should not change lockAlertsOpen when already open', () => {
        const stateWithOpenAlerts = {
          ...mockInitialState,
          viz: {
            ...mockInitialState.viz,
            chart: {
              ...mockInitialState.viz.chart,
              controls: {
                ...mockInitialState.viz.chart.controls,
                paramLock: true,
                lockAlertsOpen: true, // Already open
              },
            },
          },
          vizPageDataTarget: {
            Dataset_Short_Name: 'HOT_APEX',
            Temporal_Resolution: 'Monthly Climatology',
          },
        };
        
        const action = {
          type: VIZ_PAGE_DATA_TARGET_SET,
          payload: {
            target: {
              Dataset_Short_Name: 'HOT_APEX',
              Temporal_Resolution: 'Daily', // Would cause mismatch
            },
          },
        };
        
        const result = visualizationReducer(stateWithOpenAlerts, action);
        
        expect(result.viz.chart.controls.lockAlertsOpen).toBe(true); // Should remain open
      });
    });

    it('should handle VIZ_PAGE_DATA_TARGET_SET with basic payload', () => {
      const target = { Dataset_Short_Name: 'HOT_APEX', Variable: 'temperature' };
      const action = {
        type: VIZ_PAGE_DATA_TARGET_SET,
        payload: { target }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.vizPageDataTarget).toEqual(target);
      expect(result.vizPageDataTargetDetails).toBe(null);
      expect(result.viz.chart.validation.sizeCheck.status).toBe(states.notTried);
      expect(result.viz.chart.validation.sizeCheck.result).toBe(null);
    });

    it('should handle VIZ_PAGE_DATA_TARGET_DETAILS_STORE', () => {
      const vizPageDataTargetDetails = {
        Short_Name: 'HOT_APEX',
        Long_Name: 'Hawaii Ocean Time-series APEX Profiling Float Data',
        Variables: ['temperature', 'salinity']
      };
      const action = {
        type: VIZ_PAGE_DATA_TARGET_DETAILS_STORE,
        payload: { vizPageDataTargetDetails }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.vizPageDataTargetDetails).toEqual(vizPageDataTargetDetails);
    });
  });

  describe('Search Results Actions', () => {
    it('should handle VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS', () => {
      const searchResults = { Observation: [{ id: 1 }], Model: [{ id: 2 }] };
      const options = { spatial: ['global'], temporal: ['monthly'] };
      const counts = { Observation: 1, Model: 1 };
      
      const action = {
        type: VIZ_SEARCH_RESULTS_STORE_AND_UPDATE_OPTIONS,
        payload: { searchResults, options, counts }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.vizSearchResults).toEqual(searchResults);
      expect(result.submissionOptions).toEqual(options);
      expect(result.vizSearchResultsFullCounts).toEqual(counts);
    });

    it('should handle VIZ_SEARCH_RESULTS_STORE', () => {
      const searchResults = { Observation: [{ id: 3 }], Model: [] };
      const action = {
        type: VIZ_SEARCH_RESULTS_STORE,
        payload: { searchResults }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.vizSearchResults).toEqual(searchResults);
    });

    it('should handle VIZ_SEARCH_RESULTS_SET_LOADING_STATE', () => {
      const loadingState = states.inProgress;
      const action = {
        type: VIZ_SEARCH_RESULTS_SET_LOADING_STATE,
        payload: { state: loadingState }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.vizSearchResultsLoadingState).toBe(loadingState);
    });
  });

  describe('Member Variables Actions', () => {
    it('should handle MEMBER_VARIABLES_STORE', () => {
      const variables = [{ name: 'temperature' }, { name: 'salinity' }];
      const action = {
        type: MEMBER_VARIABLES_STORE,
        payload: { variables }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.memberVariables).toEqual(variables);
    });

    it('should handle MEMBER_VARIABLES_SET_LOADING_STATE', () => {
      const loadingState = states.failed;
      const action = {
        type: MEMBER_VARIABLES_SET_LOADING_STATE,
        payload: { state: loadingState }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.memberVariablesLoadingState).toBe(loadingState);
    });
  });

  describe('Related Data Actions', () => {
    it('should handle RELATED_DATA_STORE', () => {
      const data = [{ dataset: 'related1' }, { dataset: 'related2' }];
      const action = {
        type: RELATED_DATA_STORE,
        payload: { data }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.relatedData).toEqual(data);
    });

    it('should handle RELATED_DATA_SET_LOADING_STATE', () => {
      const loadingState = states.inProgress;
      const action = {
        type: RELATED_DATA_SET_LOADING_STATE,
        payload: { state: loadingState }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.relatedDataLoadingState).toBe(loadingState);
    });
  });

  describe('Variable Actions', () => {
    it('should handle VARIABLE_NAME_AUTOCOMPLETE_STORE', () => {
      const autocompleteVariableNames = ['temp', 'temperature', 'temporal'];
      const action = {
        type: VARIABLE_NAME_AUTOCOMPLETE_STORE,
        payload: { autocompleteVariableNames }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.autocompleteVariableNames).toEqual(autocompleteVariableNames);
    });

    it('should handle VARIABLE_STORE', () => {
      const variableDetails = { name: 'temperature', unit: 'Celsius', range: [0, 30] };
      const action = {
        type: VARIABLE_STORE,
        payload: { variableDetails }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.variableFetchLoadingState).toBe(states.succeeded);
      expect(result.variableDetails).toEqual(variableDetails);
    });

    it('should handle VARIABLE_FETCH_SET_LOADING_STATE', () => {
      const loadingState = states.inProgress;
      const action = {
        type: VARIABLE_FETCH_SET_LOADING_STATE,
        payload: { state: loadingState }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.variableFetchLoadingState).toBe(loadingState);
    });
  });

  describe('Dataset Summary Actions', () => {
    it('should handle DATASET_SUMMARY_STORE', () => {
      const datasetSummary = { name: 'Test Dataset', variableCount: 5, sampleCount: 1000 };
      const action = {
        type: DATASET_SUMMARY_STORE,
        payload: { datasetSummary }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.datasetSummary).toEqual(datasetSummary);
    });
  });

  describe('UI Control Actions', () => {
    it('should handle PLOTS_ACTIVE_TAB_SET', () => {
      const tab = 2;
      const action = {
        type: PLOTS_ACTIVE_TAB_SET,
        payload: { tab }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.plotsActiveTab).toBe(tab);
    });

    it('should handle SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE', () => {
      const lastRowData = { lat: 45, lng: -120, time: '2023-01-01' };
      const action = {
        type: SPARSE_DATA_MAX_SIZE_NOTIFICATION_UPDATE,
        payload: { lastRowData }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.sparseDataMaxSizeNotificationData).toEqual(lastRowData);
    });

    it('should handle GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE', () => {
      const isVisible = true;
      const action = {
        type: GUEST_PLOT_LIMIT_NOTIFICATION_SET_IS_VISIBLE,
        payload: { isVisible }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.guestPlotLimitNotificationIsVisible).toBe(isVisible);
    });

    it('should handle VIZ_CONTROL_PANEL_VISIBILITY with truthy value', () => {
      const action = {
        type: VIZ_CONTROL_PANEL_VISIBILITY,
        payload: { isVisible: true }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.showControlPanel).toBe(true);
    });

    it('should handle VIZ_CONTROL_PANEL_VISIBILITY with falsy value', () => {
      const action = {
        type: VIZ_CONTROL_PANEL_VISIBILITY,
        payload: { isVisible: 0 }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.showControlPanel).toBe(false);
    });

    it('should handle DATA_SEARCH_VISIBILITY with truthy value', () => {
      const action = {
        type: DATA_SEARCH_VISIBILITY,
        payload: { isVisible: 'true' }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.dataSearchMenuOpen).toBe(true);
    });

    it('should handle DATA_SEARCH_VISIBILITY with falsy value', () => {
      const action = {
        type: DATA_SEARCH_VISIBILITY,
        payload: { isVisible: null }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.dataSearchMenuOpen).toBe(false);
    });
  });

  describe('Help Integration Actions', () => {
    it('should handle helpActionTypes.TOGGLE_INTRO for visualization page when turning on', () => {
      const action = {
        type: helpActionTypes.TOGGLE_INTRO,
        payload: { pageName: VISUALIZATION_PAGE, value: true }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.dataSearchMenuOpen).toBe(false); // Should hide data search when tour turns on
    });

    it('should handle helpActionTypes.TOGGLE_INTRO for visualization page when toggling to true', () => {
      const stateWithIntroFalse = {
        ...mockInitialState,
        intros: { [VISUALIZATION_PAGE]: false },
        dataSearchMenuOpen: true
      };
      const action = {
        type: helpActionTypes.TOGGLE_INTRO,
        payload: { pageName: VISUALIZATION_PAGE } // no value = toggle
      };
      const result = visualizationReducer(stateWithIntroFalse, action);
      
      expect(result.dataSearchMenuOpen).toBe(false); // Should hide data search when tour turns on
    });

    it('should handle helpActionTypes.TOGGLE_INTRO for visualization page when already true', () => {
      const stateWithIntroTrue = {
        ...mockInitialState,
        intros: { [VISUALIZATION_PAGE]: true },
        dataSearchMenuOpen: true
      };
      const action = {
        type: helpActionTypes.TOGGLE_INTRO,
        payload: { pageName: VISUALIZATION_PAGE } // no value = toggle
      };
      const result = visualizationReducer(stateWithIntroTrue, action);
      
      expect(result.dataSearchMenuOpen).toBe(true); // Should not change when turning off
      expect(result).toBe(stateWithIntroTrue); // Should return same state reference
    });

    it('should handle helpActionTypes.TOGGLE_INTRO for different page', () => {
      const action = {
        type: helpActionTypes.TOGGLE_INTRO,
        payload: { pageName: 'CATALOG_PAGE', value: true }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState); // Should return unchanged state for other pages
    });
  });

  describe('Parameter Lock and Alert Actions', () => {
    it('should handle SET_PARAM_LOCK', () => {
      const paramLockValue = true;
      const action = {
        type: SET_PARAM_LOCK,
        payload: paramLockValue
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.viz.chart.controls.paramLock).toBe(paramLockValue);
      // Verify nested structure preserved
      expect(result.viz.chart.controls.dateTypeMismatch).toBe(mockInitialState.viz.chart.controls.dateTypeMismatch);
      expect(result.viz.chart.validation).toEqual(mockInitialState.viz.chart.validation);
    });

    it('should handle SET_LOCK_ALERTS_OPEN', () => {
      const lockAlertsOpen = true;
      const action = {
        type: SET_LOCK_ALERTS_OPEN,
        payload: lockAlertsOpen
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.viz.chart.controls.lockAlertsOpen).toBe(lockAlertsOpen);
      // Verify nested structure preserved
      expect(result.viz.chart.controls.paramLock).toBe(mockInitialState.viz.chart.controls.paramLock);
      expect(result.viz.chart.validation).toEqual(mockInitialState.viz.chart.validation);
    });
  });

  describe('Query Size Validation Actions', () => {
    it('should handle SET_CHECK_VIZ_QUERY_SIZE_STATUS', () => {
      const status = states.inProgress;
      const action = {
        type: SET_CHECK_VIZ_QUERY_SIZE_STATUS,
        payload: status
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.viz.chart.validation.sizeCheck.status).toBe(status);
      // Verify nested structure preserved
      expect(result.viz.chart.controls).toEqual(mockInitialState.viz.chart.controls);
    });

    it('should handle CHECK_VIZ_QUERY_SIZE_STORE', () => {
      const queryResult = { estimatedSize: 1000000, isLarge: true };
      const action = {
        type: CHECK_VIZ_QUERY_SIZE_STORE,
        payload: queryResult
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.viz.chart.validation.sizeCheck.status).toBe(states.succeeded);
      expect(result.viz.chart.validation.sizeCheck.result).toEqual(queryResult);
      // Verify nested structure preserved
      expect(result.viz.chart.controls).toEqual(mockInitialState.viz.chart.controls);
    });
  });

  describe('Complex State Transformations', () => {
    it('should handle VIZ_PAGE_DATA_TARGET_SET with complex nested state updates', () => {
      const target = { 
        Dataset_Short_Name: 'HOT_APEX', 
        Variable: 'temperature',
        Temporal_Resolution: 'Daily'
      };
      const stateWithComplexViz = {
        ...mockInitialState,
        viz: {
          chart: {
            controls: {
              paramLock: true,
              dateTypeMismatch: true,
              variableResolutionMismatch: false,
              lockAlertsOpen: true,
            },
            validation: {
              sizeCheck: {
                status: states.succeeded,
                result: { size: 500 },
              },
            },
          },
        },
        vizPageDataTargetDetails: { oldDetails: 'preserved' }
      };
      
      const action = {
        type: VIZ_PAGE_DATA_TARGET_SET,
        payload: { target }
      };
      const result = visualizationReducer(stateWithComplexViz, action);
      
      expect(result.vizPageDataTarget).toEqual(target);
      expect(result.vizPageDataTargetDetails).toBe(null); // Should be reset
      
      // Verify complex nested state structure maintained
      expect(result.viz.chart.controls.paramLock).toBe(true); // Preserved from previous state
      expect(result.viz.chart.validation.sizeCheck.status).toBe(states.notTried); // Reset
      expect(result.viz.chart.validation.sizeCheck.result).toBe(null); // Reset
    });

    it('should preserve deep nested state structure in complex actions', () => {
      const stateWithDeepNesting = {
        ...mockInitialState,
        viz: {
          chart: {
            controls: {
              paramLock: false,
              dateTypeMismatch: false,
              variableResolutionMismatch: false,
              lockAlertsOpen: false,
              customProperty: { nested: { deeply: 'preserved' } }
            },
            validation: {
              sizeCheck: {
                status: states.notTried,
                result: null,
              },
              customValidation: { another: 'property' }
            },
            customChartProperty: 'should be preserved'
          },
          customVizProperty: 'also preserved'
        },
        customTopLevel: { complex: { object: 'preserved' } }
      };
      
      const action = {
        type: SET_PARAM_LOCK,
        payload: true
      };
      const result = visualizationReducer(stateWithDeepNesting, action);
      
      // Verify the specific change
      expect(result.viz.chart.controls.paramLock).toBe(true);
      
      // Verify deep nested structure preservation
      expect(result.viz.chart.controls.customProperty).toEqual({ nested: { deeply: 'preserved' } });
      expect(result.viz.chart.validation.customValidation).toEqual({ another: 'property' });
      expect(result.viz.chart.customChartProperty).toBe('should be preserved');
      expect(result.viz.customVizProperty).toBe('also preserved');
      expect(result.customTopLevel).toEqual({ complex: { object: 'preserved' } });
    });
  });

  describe('Missing Action Tests', () => {
    it('should handle CRUISE_LIST_REQUEST_FAILURE', () => {
      const stateWithInProgress = {
        ...mockInitialState,
        getCruiseListRequestState: states.inProgress,
      };
      const action = { type: CRUISE_LIST_REQUEST_FAILURE };
      const result = visualizationReducer(stateWithInProgress, action);
      
      expect(result.getCruiseListRequestState).toBe(states.failed);
    });
  });

  describe('Console Log Testing', () => {
    it('should log chart index when closing chart', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const stateWithCharts = {
        ...mockInitialState,
        charts: [{ id: 0 }, { id: 1 }]
      };
      const action = {
        type: CLOSE_CHART,
        payload: { chartIndex: 1 }
      };
      
      visualizationReducer(stateWithCharts, action);
      
      expect(consoleSpy).toHaveBeenCalledWith('close chart', 1);
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined state (initial state scenario)', () => {
      const action = { type: QUERY_REQUEST_PROCESSING };
      const result = visualizationReducer(undefined, action);
      
      expect(result.queryRequestState).toBe(states.inProgress);
      // In slice mode, default parameter provides initial state
      expect(result.charts).toEqual([]); // Should use initialVisualizationState defaults
      expect(result.chartID).toBe(0);
      expect(result.viz.chart.controls.paramLock).toBe(false);
    });

    it('DEP_should handle actions with missing payload properties gracefully', () => {
      const action = {
        type: STORE_SAMPLE_DATA,
        payload: {} // Missing sampleData property
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.sampleData).toBeUndefined();
      expect(result.charts).toBe(mockInitialState.charts); // Other state preserved
    });

    it('should handle SET_CHECK_VIZ_QUERY_SIZE_STATUS without preserving previous result', () => {
      const stateWithPreviousResult = {
        ...mockInitialState,
        viz: {
          ...mockInitialState.viz,
          chart: {
            ...mockInitialState.viz.chart,
            validation: {
              ...mockInitialState.viz.chart.validation,
              sizeCheck: {
                status: states.succeeded,
                result: { previousData: 'should be lost' },
              },
            },
          },
        },
      };
      
      const action = {
        type: SET_CHECK_VIZ_QUERY_SIZE_STATUS,
        payload: states.inProgress
      };
      const result = visualizationReducer(stateWithPreviousResult, action);
      
      expect(result.viz.chart.validation.sizeCheck.status).toBe(states.inProgress);
      // Bug: Previous result is not preserved - this documents current behavior
      expect(result.viz.chart.validation.sizeCheck.result).toBeUndefined();
    });

    it('should handle actions with null payload', () => {
      const action = {
        type: VIZ_SEARCH_RESULTS_STORE,
        payload: null
      };
      // This will actually throw because the reducer expects payload.searchResults
      // This test documents the current behavior - the reducer is not null-safe
      expect(() => visualizationReducer(mockInitialState, action)).toThrow();
    });
  });

  describe('Default Case Behavior', () => {
    it('should return unchanged state for unknown actions', () => {
      const action = { type: 'UNKNOWN_ACTION_TYPE' };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState); // Should return exact same reference for performance
    });

    it('should return unchanged state for actions without type', () => {
      const action = {}; // No type property
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result).toBe(mockInitialState);
    });

    it('should handle null action (documents current behavior)', () => {
      // This will throw because the reducer tries to access action.type
      // This test documents the current behavior - the reducer is not null-action-safe
      expect(() => visualizationReducer(mockInitialState, null)).toThrow();
    });
  });

  describe('State Shape Preservation', () => {
    it('should handle Math.random nonce generation correctly', () => {
      const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.12345);
      
      const action = {
        type: CRUISE_TRAJECTORY_ZOOM_TO,
        payload: { lat: 45.5, lng: -120.3 }
      };
      const result = visualizationReducer(mockInitialState, action);
      
      expect(result.cruiseTrajectoryFocusNonce).toBe(0.12345);
      mathRandomSpy.mockRestore();
    });

    it('should maintain exact state structure after all actions', () => {
      const actions = [
        { type: QUERY_REQUEST_PROCESSING },
        { type: ADD_CHART, payload: { chartInfo: { type: 'line' } } },
        { type: STORE_SAMPLE_DATA, payload: { sampleData: [1, 2, 3] } },
        { type: SET_PARAM_LOCK, payload: true },
        { type: VIZ_CONTROL_PANEL_VISIBILITY, payload: { isVisible: false } }
      ];
      
      let currentState = mockInitialState;
      actions.forEach(action => {
        currentState = visualizationReducer(currentState, action);
      });
      
      // Verify all expected properties exist
      expect(currentState.charts).toBeDefined();
      expect(currentState.viz.chart.controls).toBeDefined();
      expect(currentState.viz.chart.validation).toBeDefined();
      expect(currentState.queryRequestState).toBeDefined();
      expect(currentState.sampleData).toBeDefined();
      expect(currentState.showControlPanel).toBeDefined();
      
      // Verify state shape matches original structure
      expect(Object.keys(currentState)).toEqual(
        expect.arrayContaining(Object.keys(mockInitialState))
      );
    });
  });

  describe('Performance Considerations', () => {
    it('should return same reference for unchanged nested objects', () => {
      const action = { type: QUERY_REQUEST_PROCESSING };
      const result = visualizationReducer(mockInitialState, action);
      
      // Verify unchanged nested objects maintain reference equality for performance
      expect(result.viz.chart.controls).toBe(mockInitialState.viz.chart.controls);
      expect(result.viz.chart.validation).toBe(mockInitialState.viz.chart.validation);
      expect(result.charts).toBe(mockInitialState.charts);
    });

    it('should create new objects only for changed branches', () => {
      const action = {
        type: SET_PARAM_LOCK,
        payload: true
      };
      const result = visualizationReducer(mockInitialState, action);
      
      // Changed branches should be new objects
      expect(result).not.toBe(mockInitialState);
      expect(result.viz).not.toBe(mockInitialState.viz);
      expect(result.viz.chart).not.toBe(mockInitialState.viz.chart);
      expect(result.viz.chart.controls).not.toBe(mockInitialState.viz.chart.controls);
      
      // Unchanged branches should maintain reference equality
      expect(result.viz.chart.validation).toBe(mockInitialState.viz.chart.validation);
      expect(result.charts).toBe(mockInitialState.charts);
    });
  });
});
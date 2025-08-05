import {
  STORE_SUBMISSION_OPTIONS,
  KEYWORDS_STORE,
  SEARCH_OPTIONS_STORE,
  SEARCH_RESULTS_STORE,
  SEARCH_RESULTS_SET_LOADING_STATE,
  DATASET_FULL_PAGE_NAVIGATE,
  DATASET_FULL_PAGE_DATA_STORE,
  DATASET_FULL_PAGE_DATA_SET_LOADING_STATE,
  DATASET_VARIABLES_STORE,
  DATASET_VARIABLES_SET_LOADING_STATE,
  DATASET_VARIABLE_UM_STORE,
  DATASET_VARIABLE_UM_SET_LOADING_STATE,
  DATASET_VISUALIZABLE_VARS_STORE,
  DATASET_VISUALIZABLE_VARS_SET_LOADING_STATE,
  DATASET_VARIABLE_VIS_DATA_STORE,
  DATASET_VARIABLE_VIS_DATA_SET_LOADING_STATE,
  DATASET_VARIABLE_SELECT,
  DATASET_VIS_VAR_TAB_PREFERENCE,
  CRUISE_FULL_PAGE_DATA_STORE,
  CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE,
  FETCH_DATASET_FEATURES_SUCCESS,
  SET_CHECK_QUERY_SIZE_REQUEST_STATE,
  STORE_CHECK_QUERY_SIZE_RESULT,
  CHECK_QUERY_SIZE_SEND,
  CLEAR_FAILED_SIZE_CHECKS,
  FETCH_RECS_POPULAR_SEND,
  FETCH_RECS_POPULAR_SUCCESS,
  FETCH_RECS_POPULAR_FAILURE,
  FETCH_RECS_RECENT_SEND,
  FETCH_RECS_RECENT_SUCCESS,
  FETCH_RECS_RECENT_FAILURE,
  FETCH_RECS_RECENT_CACHE_HIT,
  FETCH_RECS_RECOMMENDED_SEND,
  FETCH_RECS_RECOMMENDED_SUCCESS,
  FETCH_RECS_RECOMMENDED_FAILURE,
  FETCH_RECS_RECOMMENDED_CACHE_HIT,
  FETCH_PROGRAMS_SEND,
  FETCH_PROGRAMS_SUCCESS,
  FETCH_PROGRAMS_FAILURE,
  FETCH_PROGRAM_DETAILS_SEND,
  FETCH_PROGRAM_DETAILS_SUCCESS,
  FETCH_PROGRAM_DETAILS_FAILURE,
  SET_PROGRAM_CRUISE_TRAJECTORY_FOCUS,
  SET_SORTING_OPTIONS,
  PROGRAM_DATASET_SELECT,
  PROGRAM_DATASET_VARIABLE_SELECT,
  PROGRAM_SAMPLE_VIS_DATA_SET_LOADING_STATE,
  PROGRAM_SAMPLE_VIS_DATA_STORE,
  FETCH_DATASET_NAMES_SUCCESS,
  SET_DATASET_NAMES_REQUEST_STATUS,
  FETCH_VAULT_LINK_SUCCESS,
  SET_FETCH_VAULT_LINK_REQUEST_STATUS,
  DROPBOX_MODAL_OPEN,
  DROPBOX_MODAL_CLEANUP,
  DROPBOX_MODAL_CLOSE,
} from '../actionTypes/catalog';
import states from '../../enums/asyncRequestStates';
import { sortResults } from '../../Components/Catalog/SortingControls';
import { safePath } from '../../Utility/objectUtils';
import {
  getFirstDatasetIdentifier,
  getDefaultVariableIdentifier,
} from '../../Components/Catalog/Programs/programSelectors';
import buildSearchOptionsFromVariableList from '../../Utility/Catalog/buildSearchOptionsFromVariablesList';

// Initial state for catalog slice (extracted from main initialState for single source of truth)
export const initialCatalogState = {
  // Catalog state pieces
  catalogRequestState: null,
  catalog: {},
  datasetRequestState: null,
  datasets: null,
  submissionOptions: buildSearchOptionsFromVariableList([]),
  keywords: [],
  searchOptions: {},
  searchResults: [],
  searchResultsLoadingState: states.notTried,
  catalogSortingOptions: {
    direction: 'DESC',
    field: 'id',
  },

  // Catalog Recommendations
  popularDatasetsRequestState: states.notTried,
  popularDatasets: null,
  recentDatasetsRequestState: states.notTried,
  recentDatasets: null,
  recommendedDatasetsRequestState: states.notTried,
  recommendedDatasets: null,

  // Dataset Download
  download: {
    currentRequest: null,
    checkQueryRequestState: states.notTried,
    querySizeChecks: [], // list of { queryString, result }
    vaultLink: null,
    dropboxModalOpen: 'closed',
  }, // NOTE see also state.downloadDialog
  // this is an artifact of initially only using redux for the ui state

  // Dataset Details Page
  datasetDetailsPage: {
    selectedDatasetId: null,
    selectedDatasetShortname: null,

    primaryPageLoadingState: states.notTried,
    variablesLoadingState: states.notTried,
    unstructuredMetadataLoadingState: states.notTried,

    data: null,
    cruises: null,
    references: null,
    variables: null,
    sensors: null,
    unstructuredVariableMetadata: null,

    visualizableVariables: null,
    visualizableVariablesLoadingState: states.notTried,
    visualizationSelection: null,
    visualizableDataByName: null,

    tabPreference: 0,
  },

  // Programs
  programs: [],
  programsRequestStatus: states.notTried,
  programDetails: null,
  programDetailsRequestStates: states.notTried,
  programDetailsErrMessage: null,

  // Program Detail Page

  // Cruise Page
  cruiseFullPageData: {},

  // App (General Data)
  tablesWithAncillaryData: null,
  tablesWithContinuousIngestion: null,
};

// cached paths
const pathToVisData = safePath(['programDetails', 'sampleVisData']);

// reducer helper for dataset detail page variable selection
// manages cache based on length of stored data
const reduceDatasetVariableSelect = (state, action) => {
  const variableIsInList =
    state.datasetDetailsPage.visualizableVariables.variables.some(
      (v) => v.Short_Name === action.payload.shortname,
    );
  const oldVariable = state.datasetDetailsPage.visualizationSelection;

  const newShortName = action.payload.shortname;

  // if the shortname in the payload exists in the list of variable, set it as the selection
  const newVariableSelection = variableIsInList
    ? action.payload.shortname
    : (() => console.log(`no ${newShortName} in var list`))() && oldVariable;

  const dataLengthIsOverThreshold = (varShortName, data) => {
    const THRESHOLD = 10000; // ten thousand datapoints
    const latsArray = safePath([varShortName, 'data', 'lats'])(data);
    if (!Array.isArray(latsArray)) {
      return false;
    } else if (latsArray.length > THRESHOLD) {
      console.log(
        'examining variable data for size',
        `${varShortName} has ${latsArray.length} points`,
      );
      return true;
    } else {
      console.log(
        'examining variable data for size',
        `${varShortName} has ${latsArray.length} points`,
      );
      return false;
    }
  };

  // when switching variables, scan existing data and remove bigger caches of data
  let newData = state.datasetDetailsPage.visualizableDataByName;
  if (newData && typeof newData === 'object') {
    newData = Object.keys(newData).reduce((acc, curr) => {
      const shouldBeCleared = dataLengthIsOverThreshold(curr, newData);
      if (shouldBeCleared) {
        console.log(`dereferencing ${curr}`);
        acc[curr] = {
          data: null, // dereference the data
          loadingState: states.notTried,
        };
      } else {
        console.log(`retaining cache for ${curr}`);
        acc[curr] = newData[curr];
      }
      return acc;
    }, {});
  }

  return {
    ...state,
    datasetDetailsPage: {
      ...state.datasetDetailsPage,
      visualizationSelection: newVariableSelection,
      visualizableDataByName: newData,
    },
  };
};

// reducer for catalog data:

export default function (state = initialCatalogState, action) {
  switch (action.type) {
    /************** Catalog Page **********************/

    case STORE_SUBMISSION_OPTIONS:
      return {
        ...state,
        submissionOptions: action.payload.options,
      };
    case KEYWORDS_STORE:
      return {
        ...state,
        keywords: action.payload.keywords,
      };
    case SEARCH_OPTIONS_STORE:
      return {
        ...state,
        searchOptions: action.payload.searchOptions,
      };
    case SEARCH_RESULTS_STORE:
      return {
        ...state,
        searchResults: action.payload.searchResults,
        submissionOptions: action.payload.submissionOptions,
      };
    case SEARCH_RESULTS_SET_LOADING_STATE:
      return {
        ...state,
        searchResultsLoadingState: action.payload.state,
      };

    case SET_SORTING_OPTIONS:
      return {
        ...state,
        catalogSortingOptions: action.payload,
        searchResults: sortResults(state.searchResults, action.payload),
      };

    /************** Dataset Detail Page **********************/

    case DATASET_FULL_PAGE_NAVIGATE:
      return {
        ...state,
        datasetDetailsPage: {
          // reset page, but set new shortname
          selectedDatasetId: null,
          selectedDatasetShortname: action.payload.shortname || null,

          primaryPageLoadingState: states.notTried,
          variablesLoadingState: states.notTried,
          unstructuredMetadataLoadingState: states.notTried,

          data: null,
          cruises: null,
          references: null,
          variables: null,
          sensors: null,
          news: [],
          unstructuredVariableMetadata: null,

          visualizableVariables: null,
          visualizableVariablesLoadingState: states.notTried,
          visualizationSelection: null,
          visualizableDataByName: null,
        },
      };

    case DATASET_FULL_PAGE_DATA_STORE:
      console.log('payload', action.payload);
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          selectedDatasetId: action.payload.dataset.Dataset_ID,
          selectedDatasetShortname: action.payload.dataset.Short_Name,
          data: action.payload.dataset,
          cruises: action.payload.cruises,
          references: action.payload.references,
          sensors: action.payload.sensors,
          news: action.payload.news,
        },
      };
    case DATASET_VARIABLES_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          variables: action.payload.variables,
        },
      };
    case DATASET_VARIABLE_UM_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          unstructuredVariableMetadata:
            action.payload.variableUnstructuredMetadata,
        },
      };
    case DATASET_FULL_PAGE_DATA_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          primaryPageLoadingState: action.payload.state,
        },
      };
    case DATASET_VARIABLES_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          variablesLoadingState: action.payload.state,
        },
      };
    case DATASET_VARIABLE_UM_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          unstructuredMetadataLoadingState: action.payload.state,
        },
      };

    case DATASET_VISUALIZABLE_VARS_STORE:
      // create an object with a key for every variable
      // eslint-disable-next-line
      const dataByName = Object.fromEntries(
        action.payload.variables.map((v) => [
          v.Short_Name,
          { data: null, loadingState: states.notTried },
        ]),
      );

      if (
        state.datasetDetailsPage.visualizableVariablesLoadingState !==
        states.succeeded
      ) {
        return {
          ...state,
          datasetDetailsPage: {
            ...state.datasetDetailsPage,
            visualizableVariablesLoadingState: states.succeeded,
            visualizableVariables: action.payload,
            visualizationSelection: action.payload.variables[0].Short_Name,
            visualizableDataByName: dataByName,
          },
        };
      } else {
        return state;
      }
    case DATASET_VISUALIZABLE_VARS_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          visualizableVariablesLoadingState: action.payload.state,
        },
      };

    case DATASET_VARIABLE_VIS_DATA_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          visualizableDataByName: {
            ...state.datasetDetailsPage.visualizableDataByName,
            [action.payload.shortname]: {
              data: action.payload.data,
              loadingState: states.succeeded,
            },
          },
        },
      };

    case DATASET_VARIABLE_VIS_DATA_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          visualizableDataByName: {
            ...state.datasetDetailsPage.visualizableDataByName,
            [action.payload.shortname]: {
              data: null, // only STORE handles success; for every other state data is null
              loadingState: action.payload.state,
            },
          },
        },
      };
    case DATASET_VARIABLE_SELECT:
      return reduceDatasetVariableSelect(state, action);

    case DATASET_VIS_VAR_TAB_PREFERENCE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          tabPreference: action.payload.tab,
        },
      };

    /************** Programs Page **********************/
    case FETCH_PROGRAMS_SEND:
      return {
        ...state,
        programsRequestStatus: states.inProgress,
      };

    case FETCH_PROGRAMS_SUCCESS:
      return {
        ...state,
        programs: action.payload,
        programsRequestStatus: states.succeeded,
      };

    case FETCH_PROGRAMS_FAILURE:
      return {
        ...state,
        programsRequestStatus: states.failed,
      };
    /************** Program Details Page **********************/

    case FETCH_PROGRAM_DETAILS_SEND:
      return {
        ...state,
        programDetailsRequestStatus: states.inProgress,
        programDetails: {},
        programDetailsCruiseFocus: null,
      };

    case FETCH_PROGRAM_DETAILS_SUCCESS:
      return {
        ...state,
        programDetails: {
          id: action.payload.id,
          name: action.payload.programName,
          cruises: action.payload.cruises,
          datasets: action.payload.datasets,

          // user state
          programDatasetSelected: getFirstDatasetIdentifier(
            action.payload.datasets,
          ),
          programDatasetVariableSelected: getDefaultVariableIdentifier(
            action.payload.datasets,
          ),
        },
        programDetailsRequestStatus: states.succeeded,
      };

    case FETCH_PROGRAM_DETAILS_FAILURE:
      return {
        ...state,
        programDetails: null,
        programDetailsRequestStatus: states.failed,
        programDetailsError: {
          message: action.payload.message,
          // other info ?
        },
      };

    case SET_PROGRAM_CRUISE_TRAJECTORY_FOCUS:
      return {
        ...state,
        programDetailsCruiseFocus: action.payload.cruiseId,
      };

    case PROGRAM_DATASET_SELECT:
      return {
        ...state,
        programDetails: {
          ...(state.programDetails ? state.programDetails : {}),
          programDatasetSelected: action.payload, // { shortName, datasetId }
          programDatasetVariableSelected: null, // reset
          sampleVisData: null,
        },
      };

    case PROGRAM_DATASET_VARIABLE_SELECT:
      return {
        ...state,
        programDetails: {
          ...(state.programDetails ? state.programDetails : {}),
          programDatasetVariableSelected: action.payload, // { varShortName, varId, datasetId }
        },
      };

    case PROGRAM_SAMPLE_VIS_DATA_SET_LOADING_STATE:
      return {
        ...state,
        programDetails: {
          ...(state.programDetails ? state.programDetails : {}),
          sampleVisData: {
            // unlike dataset detail page, only keep active vis data
            ...(pathToVisData(state) ? pathToVisData(state) : {}),
            datasetShortName: action.payload.datasetShortName,
            variableData: action.payload.variableData,
            variableId: action.payload.variableId,
            loadingState: action.payload.status,
          },
        },
      };

    case PROGRAM_SAMPLE_VIS_DATA_STORE:
      return {
        ...state,
        programDetails: {
          ...(state.programDetails ? state.programDetails : {}),
          sampleVisData: {
            // unlike dataset detail page, only keep active vis data
            ...(pathToVisData(state) ? pathToVisData(state) : {}),
            datasetShortName: action.payload.datasetShortName,
            variableData: action.payload.variableData,
            variableId: action.payload.variableId,
            loadingState: states.succeeded,
            data: action.payload.data,
          },
        },
      };
    /************** Cruise Page **********************/

    case CRUISE_FULL_PAGE_DATA_STORE:
      return {
        ...state,
        cruiseFullPageData: action.payload.cruiseFullPageData,
      };
    case CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE:
      return {
        ...state,
        cruiseFullPageDataLoadingState: action.payload.state,
      };

    /************** Cache **********************/

    case FETCH_DATASET_FEATURES_SUCCESS:
      return {
        ...state,
        catalog: {
          ...state.catalog,
          datasetFeatures: action.payload,
        },
      };

    // handle dataset features failure

    /************** Dataset Download **********************/

    case CHECK_QUERY_SIZE_SEND:
      return {
        ...state,
        download: {
          ...state.download,
          currentRequest: action.payload.query,
          checkQueryRequestState: states.inProgress,
        },
      };

    case SET_CHECK_QUERY_SIZE_REQUEST_STATE:
      return {
        ...state,
        download: {
          ...state.download,
          checkQueryRequestState: action.payload,
        },
      };

    case STORE_CHECK_QUERY_SIZE_RESULT:
      return {
        ...state,
        download: {
          ...state.download,
          querySizeChecks: state.download.querySizeChecks
            .slice(-200) // keep cache size limited, fifo
            .concat(action.payload), // { queryString, result }
        },
      };

    case CLEAR_FAILED_SIZE_CHECKS:
      return {
        ...state,
        download: {
          ...state.download,
          querySizeChecks: state.download.querySizeChecks.filter(
            (item) => !item.result.status === 500,
          ),
        },
      };

    case FETCH_RECS_POPULAR_SEND:
      return {
        ...state,
        popularDatasetsRequestState: states.inProgress,
      };

    case FETCH_RECS_POPULAR_SUCCESS:
      return {
        ...state,
        popularDatasetsRequestState: states.succeeded,
        popularDatasets: action.payload,
      };

    case FETCH_RECS_POPULAR_FAILURE:
      return {
        ...state,
        popularDatasetsRequestState: states.failed,
      };

    case FETCH_RECS_RECENT_SEND:
      return {
        ...state,
        recentDatasetsRequestState: states.inProgress,
      };

    case FETCH_RECS_RECENT_SUCCESS:
    case FETCH_RECS_RECENT_CACHE_HIT:
      return {
        ...state,
        recentDatasetsRequestState: states.succeeded,
        recentDatasets: action.payload,
      };

    case FETCH_RECS_RECENT_FAILURE:
      return {
        ...state,
        recentDatasetsRequestState: states.failed,
      };

    case FETCH_RECS_RECOMMENDED_SEND:
      return {
        ...state,
        recommendedDatasetsRequestState: states.inProgress,
      };

    case FETCH_RECS_RECOMMENDED_SUCCESS:
    case FETCH_RECS_RECOMMENDED_CACHE_HIT:
      return {
        ...state,
        recommendedDatasetsRequestState: states.succeeded,
        recommendedDatasets: action.payload,
      };

    case FETCH_RECS_RECOMMENDED_FAILURE:
      return {
        ...state,
        recommendedDatasetsRequestState: states.failed,
      };

    case FETCH_DATASET_NAMES_SUCCESS:
      return {
        ...state,
        datasetNamesFullList: action.payload,
        datasetNamesRequestStatus: states.succeeded,
      };
    case SET_DATASET_NAMES_REQUEST_STATUS:
      return {
        ...state,
        datasetNamesRequestStatus: action.payload,
      };

    case FETCH_VAULT_LINK_SUCCESS:
      return {
        ...state,
        download: {
          ...state.download,
          vaultLink: action.payload,
          vaultLinkRequestStatus: states.succeeded,
        },
      };

    case SET_FETCH_VAULT_LINK_REQUEST_STATUS:
      return {
        ...state,
        download: {
          ...state.download,
          vaultLinkRequestStatus: action.payload.status,
          vaultLink: null, // for any status other than success, null vaultLink
        },
      };

    case DROPBOX_MODAL_OPEN:
      return {
        ...state,
        download: {
          ...state.download,
          dropboxModalOpen: 'open',
        },
        downloadDialog: {
          ...state.downloadDialog,
          open: false, // when opening or closing dbx modal, ensure download dialog is closed
        },
      };

    case DROPBOX_MODAL_CLEANUP:
      return {
        ...state,
        download: {
          ...state.download,
          dropboxModalOpen: 'cleanup',
        },
      };

    case DROPBOX_MODAL_CLOSE:
      return {
        ...state,
        download: {
          ...state.download,
          dropboxModalOpen: 'closed',
        },
      };

    default:
      return state;
  }
}

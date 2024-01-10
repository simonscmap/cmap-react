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
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_CLEAR,
  CART_ADD_MULTIPLE,
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
  SET_SORTING_OPTIONS,
} from '../actionTypes/catalog';
import states from '../../enums/asyncRequestStates';
import { sortResults } from '../../Components/Catalog/SortingControls';
import { safePath } from '../../Utility/objectUtils';

const reduceDatasetVariableSelect = (state, action) => {
  const variableIsInList = state.datasetDetailsPage.visualizableVariables.variables.some (v =>
    v.Short_Name === action.payload.shortname);
  const oldVariable = state.datasetDetailsPage.visualizationSelection;

  const newShortName = action.payload.shortname;

  // if the shortname in the payload exists in the list of variable, set it as the selection
  const newVariableSelection = variableIsInList
                             ? action.payload.shortname
                             : (() =>
                               console.log (`no ${newShortName} in var list`))() && oldVariable;

  const dataLengthIsOverThreshold = (varShortName, data) => {
    const THRESHOLD = 10000; // ten thousand datapoints
    const latsArray = safePath ([varShortName, 'data', 'lats']) (data);
    if (!Array.isArray (latsArray)) {
      return false;
    } else if (latsArray.length > THRESHOLD) {
      console.log ('examining variable data for size', `${varShortName} has ${latsArray.length} points`)
      return true;
    } else {
      console.log ('examining variable data for size', `${varShortName} has ${latsArray.length} points`)
      return false;
    }
  }

  // when switching variables, scan existing data and remove bigger caches of data
  let newData = state.datasetDetailsPage.visualizableDataByName;
  if (newData && typeof newData === 'object') {
    newData = Object.keys(newData).reduce ((acc, curr) => {
      const shouldBeCleared = dataLengthIsOverThreshold (curr, newData);
      if (shouldBeCleared) {
        console.log (`dereferencing ${curr}`);
        acc[curr] = {
          data: null, // dereference the data
          loadingState: states.notTried
        };
      } else {
        console.log (`retaining cache for ${curr}`)
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
    }
  };
}



export default function (state, action) {
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
        searchResults: sortResults (state.searchResults, action.payload),
      };

      /************** Dataset Detail Page **********************/

    case DATASET_FULL_PAGE_NAVIGATE:
      return {
        ...state,
        datasetDetailsPage: { // reset page, but set new shortname
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
          unstructuredVariableMetadata: null,

          visualizableVariables: null,
          visualizableVariablesLoadingState: states.notTried,
          visualizationSelection: null,
          visualizableDataByName: null,
        },
      };

    case DATASET_FULL_PAGE_DATA_STORE:
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
        }
      };
    case DATASET_VARIABLES_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          variables: action.payload.variables,
        }
      };
    case DATASET_VARIABLE_UM_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          unstructuredVariableMetadata: action.payload.variableUnstructuredMetadata,
        }
      };
    case DATASET_FULL_PAGE_DATA_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          primaryPageLoadingState: action.payload.state,
        }
      };
    case DATASET_VARIABLES_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          variablesLoadingState: action.payload.state,
        }
      };
    case DATASET_VARIABLE_UM_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          unstructuredMetadataLoadingState: action.payload.state,
        }
      };

    case DATASET_VISUALIZABLE_VARS_STORE:
      // create an object with a key for every variable
      // eslint-disable-next-line
      const dataByName = Object.fromEntries (action.payload.variables.map (v =>
            [v.Short_Name, { data: null, loadingState: states.notTried } ]));

      if (state.datasetDetailsPage.visualizableVariablesLoadingState !== states.succeeded) {
        return {
          ...state,
          datasetDetailsPage: {
            ...state.datasetDetailsPage,
            visualizableVariablesLoadingState: states.succeeded,
            visualizableVariables: action.payload,
            visualizationSelection: action.payload.variables[0].Short_Name,
            visualizableDataByName: dataByName,
          }
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
        }
      };

    case DATASET_VARIABLE_VIS_DATA_STORE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          visualizableDataByName: {
            ...state.datasetDetailsPage.visualizableDataByName,
            [action.payload.shortname] : {
              data: action.payload.data,
              loadingState: states.succeeded,
            }
          },
        }
      };

    case DATASET_VARIABLE_VIS_DATA_SET_LOADING_STATE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          visualizableDataByName: {
            ...state.datasetDetailsPage.visualizableDataByName,
            [action.payload.shortname] : {
              data: null, // only STORE handles success; for every other state data is null
              loadingState: action.payload.state,
            }
          }
        }
      };
    case DATASET_VARIABLE_SELECT:
      return reduceDatasetVariableSelect (state, action);


    case DATASET_VIS_VAR_TAB_PREFERENCE:
      return {
        ...state,
        datasetDetailsPage: {
          ...state.datasetDetailsPage,
          tabPreference: action.payload.tab,
        }
      }



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

      /************** Cart **********************/

    case CART_ADD_ITEM:
      return {
        ...state,
        cart: {
          ...state.cart,
          [action.payload.item.Long_Name]: action.payload.item,
        },
      };
    case CART_REMOVE_ITEM:
      return {
        ...state,
        cart: (() => {
          let newCart = { ...state.cart };
          delete newCart[action.payload.item.Long_Name];
          return newCart;
        })(),
      };
    case CART_CLEAR:
      return {
        ...state,
        cart: {},
      };
    case CART_ADD_MULTIPLE:
      return {
        ...state,
        cart: {
          ...state.cart,
          ...action.payload.items,
        },
      };

      /************** Cache **********************/

    case FETCH_DATASET_FEATURES_SUCCESS:
      return {
        ...state,
        catalog: {
          ...state.catalog,
          datasetFeatures: action.payload,
        }
      };

      // handle dataset features failure

      /************** Dataset Download **********************/

    case CHECK_QUERY_SIZE_SEND:
      return {
        ...state,
        download: {
          ...state.download,
          currentRequest: action.payload.query,
          checkQueryRequestState: states.inProgress
        }
      }

    case SET_CHECK_QUERY_SIZE_REQUEST_STATE:
      return {
        ...state,
        download: {
          ...state.download,
          checkQueryRequestState: action.payload,
        }
      };

    case STORE_CHECK_QUERY_SIZE_RESULT:
      return {
        ...state,
        download: {
          ...state.download,
          querySizeChecks: state.download.querySizeChecks
                                .slice(-200) // keep cache size limited, fifo
                                .concat(action.payload) // { queryString, result }

        }
      };

    case CLEAR_FAILED_SIZE_CHECKS:
      return {
        ...state,
        download: {
          ...state.download,
          querySizeChecks: state.download.querySizeChecks
                                .filter((item) => !item.result.status === 500)
        }
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



    default:
      return state;
  }
}

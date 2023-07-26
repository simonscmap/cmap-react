import {
  STORE_SUBMISSION_OPTIONS,
  KEYWORDS_STORE,
  SEARCH_OPTIONS_STORE,
  SEARCH_RESULTS_STORE,
  SEARCH_RESULTS_SET_LOADING_STATE,
  DATASET_FULL_PAGE_DATA_STORE,
  DATASET_FULL_PAGE_DATA_SET_LOADING_STATE,
  DATASET_VARIABLES_STORE,
  DATASET_VARIABLES_SET_LOADING_STATE,
  DATASET_VARIABLE_UM_STORE,
  DATASET_VARIABLE_UM_SET_LOADING_STATE,
  CRUISE_FULL_PAGE_DATA_STORE,
  CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE,
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_CLEAR,
  CART_ADD_MULTIPLE,
  FETCH_DATASET_FEATURES_SUCCESS,
} from '../actionTypes/catalog';

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

      /************** Dataset Detail Page **********************/

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

    default:
      return state;
  }
}

import {
  STORE_SUBMISSION_OPTIONS,
  KEYWORDS_STORE,
  SEARCH_OPTIONS_STORE,
  SEARCH_RESULTS_STORE,
  SEARCH_RESULTS_SET_LOADING_STATE,
  DATASET_FULL_PAGE_DATA_STORE,
  DATASET_FULL_PAGE_DATA_SET_LOADING_STATE,
  CRUISE_FULL_PAGE_DATA_STORE,
  CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE,
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_CLEAR,
  CART_ADD_MULTIPLE,
  TABLES_WITH_ANCILLARY_DATA_STORE,
} from '../actionTypes/catalog';

export default function (state, action) {
  switch (action.type) {
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
    case DATASET_FULL_PAGE_DATA_STORE:
      return {
        ...state,
        datasetFullPageData: action.payload.datasetFullPageData,
      };
    case DATASET_FULL_PAGE_DATA_SET_LOADING_STATE:
      return {
        ...state,
        datasetFullPageDataLoadingState: action.payload.state,
      };
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
    case TABLES_WITH_ANCILLARY_DATA_STORE:
      return {
        ...state,
        tablesWithAncillaryData: action.payload.result,
      };
    default:
      return state;
  }
}

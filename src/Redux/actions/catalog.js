import * as catalogActionTypes from '../actionTypes/catalog';

export const retrievalRequestSend = () => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_SEND
});

export const retrievalRequestProcessing = () => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_PROCESSING
});

export const retrievalRequestSuccess = (catalog) => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_SUCCESS,
    payload: {
        catalog
    }
});

export const retrievalRequestFailure = () => ({
    type:catalogActionTypes.RETRIEVAL_REQUEST_FAILURE
});

export const datasetRetrievalRequestSend = () => ({
    type: catalogActionTypes.DATASET_RETRIEVAL_REQUEST_SEND
});

export const datasetRetrievalRequestProcessing = () => ({
    type: catalogActionTypes.DATASET_RETRIEVAL_REQUEST_PROCESSING
});

export const datasetRetrievalRequestSuccess = (datasets) => ({
    type: catalogActionTypes.DATASET_RETRIEVAL_REQUEST_SUCCESS,
    payload: {
        datasets
    }
});

export const datasetRetrievalRequestFailure = () => ({
    type: catalogActionTypes.DATASET_RETRIEVAL_REQUEST_FAILURE
});

export const submissionOptionsRetrieval = () => ({
    type: catalogActionTypes.SUBMISSION_OPTIONS_RETRIEVAL
});

export const storeSubmissionOptions = (options) => ({
    type: catalogActionTypes.STORE_SUBMISSION_OPTIONS,
    payload: {
        options
    }
});

export const searchOptionsFetch = () => ({
    type: catalogActionTypes.SEARCH_OPTIONS_FETCH
});

export const keywordsFetch = () => ({
    type: catalogActionTypes.KEYWORDS_FETCH
});

export const keywordsStore = (keywords) => ({
    type: catalogActionTypes.KEYWORDS_STORE,
    payload: {
        keywords
    }
});

export const searchResultsFetch = (queryString) => ({
    type: catalogActionTypes.SEARCH_RESULTS_FETCH,
    payload: {
        queryString
    }
});

export const searchResultsStore = (searchResults, submissionOptions) => ({
    type: catalogActionTypes.SEARCH_RESULTS_STORE,
    payload: {
        searchResults,
        submissionOptions
    }
});

export const searchResultsSetLoadingState = (state) => ({
    type: catalogActionTypes.SEARCH_RESULTS_SET_LOADING_STATE,
    payload: {
        state
    }
});

export const datasetFullPageDataFetch = (shortname) => ({
    type: catalogActionTypes.DATASET_FULL_PAGE_DATA_FETCH,
    payload: {
        shortname
    }
});

export const datasetFullPageDataStore = (datasetFullPageData) => ({
    type: catalogActionTypes.DATASET_FULL_PAGE_DATA_STORE,
    payload: {
        datasetFullPageData
    }
});

export const datasetFullPageDataSetLoadingState = (state) => ({
    type: catalogActionTypes.DATASET_FULL_PAGE_DATA_SET_LOADING_STATE,
    payload: {
        state
    }
});

export const cruiseFullPageDataFetch = (name) => ({
    type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_FETCH,
    payload: {
        name
    }
});

export const cruiseFullPageDataStore = (cruiseFullPageData) => ({
    type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_STORE,
    payload: {
        cruiseFullPageData
    }
});

export const cruiseFullPageDataSetLoadingState = (state) => ({
    type: catalogActionTypes.CRUISE_FULL_PAGE_DATA_SET_LOADING_STATE,
    payload: {
        state
    }
});

export const cartAddItem = (item) => ({
    type: catalogActionTypes.CART_ADD_ITEM,
    payload: {
        item
    }
});

export const cartRemoveItem = (item) => ({
    type: catalogActionTypes.CART_REMOVE_ITEM,
    payload: {
        item
    }
});

export const cartClear = () => ({
    type: catalogActionTypes.CART_CLEAR
});

export const cartAddMultiple = (items) => ({
    type: catalogActionTypes.CART_ADD_MULTIPLE,
    payload: {
        items
    }
});

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
import * as catalogActionTypes from '../actionTypes/catalog';

export const retrievalRequestSend = () => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_SEND
})

export const retrievalRequestProcessing = () => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_PROCESSING
})

export const retrievalRequestSuccess = (catalog) => ({
    type: catalogActionTypes.RETRIEVAL_REQUEST_SUCCESS,
    payload: {
        catalog
    }
})

export const retrievalRequestFailure = () => ({
    type:catalogActionTypes.RETRIEVAL_REQUEST_FAILURE
})
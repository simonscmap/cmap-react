import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';

export const retrieveDataSubmissionsByUser = () => ({
    type: dataSubmissionActionTypes.RETRIEVE_SUBMISSIONS_BY_USER
});

export const addSubmissionComment = (submissionID, comment) => ({
    type: dataSubmissionActionTypes.ADD_SUBMISSION_COMMENT,
    payload: {
        submissionID,
        comment
    }
});

export const retrieveSubmissionCommentHistory = (submissionID) => ({
    type: dataSubmissionActionTypes.RETRIEVE_SUBMISSION_COMMENT_HISTORY,
    payload: {
        submissionID
    }
});

export const uploadSubmission = (file) => ({
    type: dataSubmissionActionTypes.UPLOAD_SUBMISSION,
    payload: {
        file
    }
});

export const setSubmissionPhase = (submissionID, phaseID) => ({
    type: dataSubmissionActionTypes.SET_SUBMISSION_PHASE,
    payload: {
        submissionID,
        phaseID
    }
});

export const storeSubmissions = (submissions) => ({
    type: dataSubmissionActionTypes.STORE_SUBMISSIONS,
    payload: {
        submissions
    }
})

export const storeSubmissionComments = (payload) => ({
    type: dataSubmissionActionTypes.STORE_SUBMISSION_COMMENTS,
    payload
});

export const retrieveAllSubmissions = () => ({
    type: dataSubmissionActionTypes.RETRIEVE_ALL_SUBMISSIONS
});

export const setSubmissionCommentHistoryRetrievalState = (state) => ({
    type: dataSubmissionActionTypes.SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
    payload: {
        state
    }
});
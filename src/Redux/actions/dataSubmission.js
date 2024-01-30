import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';

export const retrieveDataSubmissionsByUser = () => ({
  type: dataSubmissionActionTypes.RETRIEVE_SUBMISSIONS_BY_USER,
});

export const setRetrieveDataSubsRequestStatus = (status) => ({
  type: dataSubmissionActionTypes.SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS,
  payload: status,
});

export const addSubmissionComment = (submissionID, comment, source) => ({
  type: dataSubmissionActionTypes.ADD_SUBMISSION_COMMENT,
  payload: {
    submissionID,
    comment,
    source,
  },
});

export const retrieveSubmissionCommentHistory = (submissionID) => ({
  type: dataSubmissionActionTypes.RETRIEVE_SUBMISSION_COMMENT_HISTORY,
  payload: {
    submissionID,
  },
});

export const uploadSubmission = ({
  file,
  datasetName,
  datasetLongName,
  dataSource,
}) => ({
  type: dataSubmissionActionTypes.UPLOAD_SUBMISSION,
  payload: {
    file,
    datasetName,
    datasetLongName,
    dataSource,
  },
});

export const setSubmissionPhase = (submissionID, phaseID) => ({
  type: dataSubmissionActionTypes.SET_SUBMISSION_PHASE,
  payload: {
    submissionID,
    phaseID,
  },
});

export const storeSubmissions = (submissions) => ({
  type: dataSubmissionActionTypes.STORE_SUBMISSIONS,
  payload: {
    submissions,
  },
});

export const storeSubmissionComments = (payload) => ({
  type: dataSubmissionActionTypes.STORE_SUBMISSION_COMMENTS,
  payload,
});

export const retrieveAllSubmissions = () => ({
  type: dataSubmissionActionTypes.RETRIEVE_ALL_SUBMISSIONS,
});

export const setSubmissionCommentHistoryRetrievalState = (state) => ({
  type: dataSubmissionActionTypes.SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
  payload: {
    state,
  },
});

export const retrieveMostRecentFile = (submissionID) => ({  type: dataSubmissionActionTypes.RETRIEVE_MOST_RECENT_FILE,
  payload: {
    submissionID,
  },
});

export const storeSubmissionFile = (file) => ({
  type: dataSubmissionActionTypes.STORE_SUBMISSION_FILE,
  payload: {
    file,
  },
});

export const checkSubmissionOptionsAndStoreFile = (file) => ({
  type: dataSubmissionActionTypes.CHECK_SUBMISSION_OPTIONS_AND_STORE_FILE,
  payload: {
    file,
  },
});

export const setUploadState = (state) => ({
  type: dataSubmissionActionTypes.SET_UPLOAD_STATE,
  payload: {
    state,
  },
});

export const downloadMostRecentFile = (submissionID) => ({
  type: dataSubmissionActionTypes.DOWNLOAD_MOST_RECENT_FILE,
  payload: {
    submissionID,
  },
});

export const dataSubmissionSelectOptionsFetch = () => ({
  type: dataSubmissionActionTypes.DATA_SUBMISSION_SELECT_OPTIONS_FETCH,
});

export const dataSubmissionSelectOptionsStore = (
  dataSubmissionSelectOptions,
) => ({
  type: dataSubmissionActionTypes.DATA_SUBMISSION_SELECT_OPTION_STORE,
  payload: {
    dataSubmissionSelectOptions,
  },
});

export const dataSubmissionDelete = (submission) => ({
  type: dataSubmissionActionTypes.DATA_SUBMISSION_DELETE,
  payload: {
    submission,
  },
});

export const checkSubmNameRequestSend = (name) => ({
  type: dataSubmissionActionTypes.CHECK_SUBM_NAME_REQUEST_SEND,
  payload: name,
});

export const setCheckSubmNameRequestStatus = (status) => ({
  type: dataSubmissionActionTypes.SET_CHECK_SUBM_NAME_REQUEST_STATUS,
  payload: status,
});

export const checkSubmNameResponseStore = (resp) => ({
  type: dataSubmissionActionTypes.CHECK_SUBM_NAME_RESPONSE_STORE,
  payload: resp,
});

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
  submissionType,
  submissionId,
  file,
  rawFile, // file before any alteration
  datasetName,
  datasetLongName,
  dataSource,
}) => ({
  type: dataSubmissionActionTypes.UPLOAD_SUBMISSION,
  payload: {
    submissionType,
    submissionId,
    file,
    rawFile,
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

export const storeSubmissionFile = (file, submissionId) => ({
  type: dataSubmissionActionTypes.STORE_SUBMISSION_FILE,
  payload: {
    file,
    submissionId,
  },
});

export const clearSubmissionFile = () => ({
  type: dataSubmissionActionTypes.CLEAR_SUBMISSION_FILE,
});

export const checkSubmissionOptionsAndStoreFile = (file, submissionId) => ({
  type: dataSubmissionActionTypes.CHECK_SUBMISSION_OPTIONS_AND_STORE_FILE,
  payload: {
    file,
    submissionId,
  },
});

export const setUploadState = (state, shortName) => ({
  type: dataSubmissionActionTypes.SET_UPLOAD_STATE,
  payload: {
    state,
    shortName
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

export const checkSubmNamesRequestSend = ({ shortName, longName, submissionId }) => ({
  type: dataSubmissionActionTypes.CHECK_SUBM_NAME_REQUEST_SEND,
  payload: { shortName, longName, submissionId },
});

export const setCheckSubmNameRequestStatus = (status, responseText) => ({
  type: dataSubmissionActionTypes.SET_CHECK_SUBM_NAME_REQUEST_STATUS,
  payload: {
    status,
    responseText,
  }
});

export const checkSubmNameResponseStore = (resp) => ({
  type: dataSubmissionActionTypes.CHECK_SUBM_NAME_RESPONSE_STORE,
  payload: resp,
});

export const setSubmissionType = (t) => ({
  type: dataSubmissionActionTypes.SET_SUBM_TYPE,
  payload: t,
});

export const setSubmissionId = (id) => ({
  type: dataSubmissionActionTypes.SET_SUBM_ID,
  payload: id,
});

export const setAudit = (auditReport) => ({
  type: dataSubmissionActionTypes.SET_AUDIT,
  payload: auditReport,
});

export const setWorkbookAudit = (workbookAudit) => ({
  type: dataSubmissionActionTypes.SET_WORKBOOK_AUDIT,
  payload: workbookAudit,
});

export const setSheetAudit = ({ sheetName, sheetAudit }) => ({
  type: dataSubmissionActionTypes.SET_SHEET_AUDIT,
  payload: {
    sheetName,
    sheetAudit,
  },
});

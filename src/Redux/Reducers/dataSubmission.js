import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import states from '../../enums/asyncRequestStates';
import { amendReportWithErrorCount } from '../../Components/DataSubmission/Helpers/countErrors';

// Define initial state for dataSubmission slice reducer
export const initialDataSubmissionState = {
  dataSubmissions: [],
  retrieveUserDataSubmsissionsRequestStatus: states.notTried,
  submissionStep: 0, // start at 0
  submissionType: 'new', // 'new' | 'update'
  submissionToUpdate: null, // Id
  submissionComments: [],
  submissionCommentHistoryRetrievalState: states.succeeded,
  submissionFile: null,
  submissionUploadState: null,
  dataSubmissionSelectOptions: null,
  auditReport: null,
  checkSubmissionNameRequestStatus: states.notTried,
  checkSubmissionNameResult: null,
};
const {
  STORE_SUBMISSIONS,
  SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
  STORE_SUBMISSION_COMMENTS,
  STORE_SUBMISSION_FILE,
  SET_UPLOAD_STATE,
  DATA_SUBMISSION_SELECT_OPTION_STORE,
  SET_CHECK_SUBM_NAME_REQUEST_STATUS,
  CHECK_SUBM_NAME_RESPONSE_STORE,
  SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS,
  SET_SUBM_ID,
  SET_SUBM_TYPE,
  SET_AUDIT,
  SET_WORKBOOK_AUDIT,
  SET_SHEET_AUDIT,
  CLEAR_SUBMISSION_FILE,
  SET_SUBMISSION_STEP, // validaitor
} = dataSubmissionActionTypes;

export default function (state = initialDataSubmissionState, action) {
  switch (action.type) {
    case SET_SUBMISSION_STEP:
      return {
        ...state,
        submissionStep: action.payload.step,
      };
    case STORE_SUBMISSIONS:
      return {
        ...state,
        dataSubmissions: action.payload.submissions,
        retrieveUserDataSubmsissionsRequestStatus: states.succeeded,
      };

    case SET_RETRIEVE_ALL_SUBS_REQUEST_STATUS:
      return {
        ...state,
        retrieveUserDataSubmsissionsRequestStatus: action.payload,
      };
    case SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE:
      return {
        ...state,
        submissionCommentHistoryRetrievalState: action.payload.state,
      };

    case STORE_SUBMISSION_COMMENTS:
      // eslint-disable-next-line
      let updatedComments = [...state.submissionComments];
      updatedComments[action.payload.submissionID] = action.payload.comments;

      return {
        ...state,
        submissionComments: updatedComments,
      };

    case STORE_SUBMISSION_FILE:
      return {
        ...state,
        submissionFile: action.payload.file,
        submissionType: action.payload.submissionId ? 'update' : 'new',
        submissionToUpdate: action.payload.submissionId
          ? parseInt(action.payload.submissionId, 10)
          : null,
        submissionUploadState: states.notTried,
      };

    case CLEAR_SUBMISSION_FILE:
      return {
        ...state,
        submissionFile: null,
        submissionType: 'new',
        submissionToUpdate: null,
        // submissionUploadState: states.notTried,
        checkSubmissionNameRequestStatus: states.notTried,
        checkSubmissionNameResponseText: null,
        checkSubmissionNameResult: null,
      };

    case SET_UPLOAD_STATE:
      return {
        ...state,
        submissionUploadState: action.payload.state,
        lastSuccessfulSubmission: action.payload.shortName, // TODO: this is not always set
      };

    case DATA_SUBMISSION_SELECT_OPTION_STORE:
      return {
        ...state,
        dataSubmissionSelectOptions: action.payload.dataSubmissionSelectOptions,
      };

    case SET_CHECK_SUBM_NAME_REQUEST_STATUS:
      return {
        ...state,
        checkSubmissionNameRequestStatus: states[action.payload.status],
        checkSubmissionNameResponseText: action.payload.responseText,
      };

    case CHECK_SUBM_NAME_RESPONSE_STORE:
      return {
        ...state,
        checkSubmissionNameResult: action.payload,
      };

    case SET_SUBM_TYPE:
      return {
        ...state,
        submissionType: action.payload,
        submissionToUpdate:
          action.payload === 'new' ? null : state.submissionToUpdate,
      };

    case SET_SUBM_ID:
      return {
        ...state,
        submissionToUpdate: action.payload,
      };

    case SET_AUDIT:
      return {
        ...state,
        auditReport: action.payload,
      };

    case SET_WORKBOOK_AUDIT:
      return {
        ...state,
        auditReport: amendReportWithErrorCount({
          ...(state.auditReport || {}),
          workbook: action.payload,
        }),
      };

    case SET_SHEET_AUDIT:
      return {
        ...state,
        auditReport: amendReportWithErrorCount({
          ...(state.auditReport || {}),
          [action.payload.sheetName]: action.payload.sheetAudit,
        }),
      };
    default:
      return state;
  }
}

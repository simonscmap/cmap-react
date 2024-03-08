import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import states from '../../enums/asyncRequestStates';
import { amendReportWithErrorCount } from '../../Components/DataSubmission/Helpers/countErrors';
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
} = dataSubmissionActionTypes;

export default function (state, action) {
  switch (action.type) {
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
        submissionToUpdate: action.payload.submissionId ? parseInt (action.payload.submissionId, 10) : null,
      };

    case CLEAR_SUBMISSION_FILE:
      return {
        ...state,
        submissionFile: null,
        submissionType: 'new',
        submissionToUpdate: null,
      };

    case SET_UPLOAD_STATE:
      return {
        ...state,
        submissionUploadState: action.payload.state,
      };

    case DATA_SUBMISSION_SELECT_OPTION_STORE:
      return {
        ...state,
        dataSubmissionSelectOptions: action.payload.dataSubmissionSelectOptions,
      };

    case SET_CHECK_SUBM_NAME_REQUEST_STATUS:
      return {
        ...state,
        checkSubmissionNameRequestStatus: states[action.payload],
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
        auditReport: {
          ...(state.auditReport || {}),
          workbook: action.payload,
        }
      };

    case SET_SHEET_AUDIT:
      return {
        ...state,
        auditReport: amendReportWithErrorCount({
          ...(state.auditReport || {}),
          [action.payload.sheetName]: action.payload.sheetAudit,
        })
      };
    default:
      return state;
  }
}

import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import states from '../../enums/asyncRequestStates';

const {
  STORE_SUBMISSIONS,
  SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE,
  STORE_SUBMISSION_COMMENTS,
  STORE_SUBMISSION_FILE,
  SET_UPLOAD_STATE,
  DATA_SUBMISSION_SELECT_OPTION_STORE,
  SET_CHECK_SUBM_NAME_REQUEST_STATUS,
  CHECK_SUBM_NAME_RESPONSE_STORE,
} = dataSubmissionActionTypes;

export default function (state, action) {
  switch (action.type) {
    case STORE_SUBMISSIONS:
      return {
        ...state,
        dataSubmissions: action.payload.submissions
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


    default:
      return state;
  }
}

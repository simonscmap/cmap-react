import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';

export default function(state, action) {
  
  switch (action.type) {    
    case dataSubmissionActionTypes.STORE_SUBMISSIONS: return {...state, dataSubmissions: action.payload.submissions}
    case dataSubmissionActionTypes.SET_SUBMISSION_COMMENT_HISTORY_RETRIEVAL_STATE: return {...state, submissionCommentHistoryRetrievalState: action.payload.state}
    case dataSubmissionActionTypes.STORE_SUBMISSION_COMMENTS:
      let updatedComments = [...state.submissionComments];
      updatedComments[action.payload.submissionID] = action.payload.comments;

      return {
        ...state,
        submissionComments: updatedComments
      }

    case dataSubmissionActionTypes.STORE_SUBMISSION_FILE: return {...state, submissionFile: action.payload.file}
    case dataSubmissionActionTypes.SET_UPLOAD_STATE: return {...state, submissionUploadState: action.payload.state}

    case dataSubmissionActionTypes.DATA_SUBMISSION_SELECT_OPTION_STORE: return {...state, dataSubmissionSelectOptions: action.payload.dataSubmissionSelectOptions}
      
    default: return state;
    }
}
import * as catalogActionTypes from '../actionTypes/catalog';

import states from '../../asyncRequestStates';

export default function(state, action) {
  switch (action.type) {
    case catalogActionTypes.RETRIEVAL_REQUEST_SUCCESS: return {
      ...state, 
      catalogRequestState: states.succeeded, 
      catalog: action.payload.catalog
    }
    case catalogActionTypes.RETRIEVAL_REQUEST_FAILURE: return {...state, catalogRequestState: states.failed}
    case catalogActionTypes.RETRIEVAL_REQUEST_PROCESSING: return {...state, catalogRequestState: states.inProgress}
    
    default:
      return state;
  }
}
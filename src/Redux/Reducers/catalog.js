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

    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_SUCCESS: return {...state,
      datasetsRequestState: states.succeeded, 
      datasets: action.payload.datasets
    }
    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_FAILURE: return {...state, datasetsRequestState: states.failed}
    case catalogActionTypes.DATASET_RETRIEVAL_REQUEST_PROCESSING: return {...state, datasetsRequestState: states.inProgress}
    
    default:
      return state;
  }
}
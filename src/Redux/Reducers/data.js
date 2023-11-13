import * as dataActionTypes from '../actionTypes/data';
import states from '../../enums/asyncRequestStates';

export default function (state, action) {

  switch (action.type) {
    case dataActionTypes.SST_ANOMALY_DATA_REQUEST_SEND:
      return {
        ...state,
        sstReqStatus: states.inProgress,
      };

    case dataActionTypes.SST_ANOMALY_DATA_REQUEST_PROCESSING:
      return {
        ...state,
        sstReqStatus: states.processing,
      };

    case dataActionTypes.SST_ANOMALY_DATA_REQUEST_SUCCESS:
      return {
        ...state,
        sstReqStatus: states.succeeded,
      };

    case dataActionTypes.SST_ANOMALY_DATA_REQUEST_FAILURE:
      return {
        ...state,
        sstReqStatus: states.failed,
      };

      /* ADT */

    case dataActionTypes.ADT_ANOMALY_DATA_REQUEST_SEND:
      return {
        ...state,
        adtReqStatus: states.inProgress,
      };

    case dataActionTypes.ADT_ANOMALY_DATA_REQUEST_PROCESSING:
      return {
        ...state,
        adtReqStatus: states.processing,
      };

    case dataActionTypes.ADT_ANOMALY_DATA_REQUEST_SUCCESS:
      return {
        ...state,
        adtReqStatus: states.succeeded,
      };

    case dataActionTypes.ADT_ANOMALY_DATA_REQUEST_FAILURE:
      return {
        ...state,
        adtReqStatus: states.failed,
      };

    default:
      return state;
  }
}

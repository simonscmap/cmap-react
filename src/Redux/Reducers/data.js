import * as dataActionTypes from '../actionTypes/data';
import states from '../../enums/asyncRequestStates';

export default function (state, action) {
  switch (action.type) {
    /* SST */

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

    /* AVG SST */

    case dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_SEND:
      return {
        ...state,
        avgSstReqStatus: states.inProgress,
      };

    case dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_PROCESSING:
      return {
        ...state,
        avgSstReqStatus: states.processing,
      };

    case dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_SUCCESS:
      return {
        ...state,
        avgSstReqStatus: states.succeeded,
        avgSSTData: action.payload,
      };

    case dataActionTypes.AVG_SST_ANOMALY_DATA_REQUEST_FAILURE:
      return {
        ...state,
        avgSstReqStatus: states.failed,
      };

    /* AVG ADT */

    case dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_SEND:
      return {
        ...state,
        avgAdtReqStatus: states.inProgress,
      };

    case dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_PROCESSING:
      return {
        ...state,
        avgAdtReqStatus: states.processing,
      };

    case dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_SUCCESS:
      return {
        ...state,
        avgAdtReqStatus: states.succeeded,
        avgADTData: action.payload,
      };

    case dataActionTypes.AVG_ADT_ANOMALY_DATA_REQUEST_FAILURE:
      return {
        ...state,
        avgAdtReqStatus: states.failed,
      };

    default:
      return state;
  }
}

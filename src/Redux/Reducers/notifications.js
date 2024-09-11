import * as actionTypes from '../actionTypes/notifications';
import states from '../../enums/asyncRequestStates';
import generateKey from '../../Components/Admin/News/generateKey';

export default function (state, action) {
  switch (action.type) {
    case actionTypes.FETCH_NOTIFICATION_HISTORY_SUCCESS:
      return {
        ...state,
        notificationHistory: {
          ...state.notificationHistory,
          ...action.payload,
        }
      }
    case actionTypes.SET_NOTIFICATION_HISTORY_REQUEST_STATUS:
      return {
        ...state,
        notificationHistoryRequestStatus: action.payload,
      }

    case actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION_SUCCESS:
      return {
        ...state,
        notificationRecipientProjections: {
          ...state.notificationRecipientProjections,
          [generateKey (action.payload.tags)]: {
            ...action.payload,
          },
        },
        notificationRecipientProjectionsRequestStatus: {
          ...state.notificationRecipientProjectionsRequestStatus,
          [generateKey (action.payload.tags)]: {
            status: states.succeeded,
            time: Date.now(),
          }
        }
      };

    case actionTypes.SET_NOTIFICATION_RECIPIENT_PROJECTION_REQUEST_STATUS:
      return {
        ...state,
        notificationRecipientProjectionsRequestStatus: {
          ...state.notificationRecipientProjectionsRequestStatus,
          [generateKey (action.payload.tags)]: {
            status: action.payload.status,
            time: Date.now(),
          }
        },
      };

  case actionTypes.FETCH_NOTIFICATION_PREVIEWS_SUCCESS:
    return {
      ...state,
      notificationPreviews: action.payload,
      notificationPreviewsRequestStatus: states.succeeded
    };


  case actionTypes.SET_FETCH_NOTIFICATION_PREVIEWS_REQUEST_STATUS:
    return {
      ...state,
      notificationPreviewsRequestStatus: action.payload,
    };

    default:
      return state;
    }
}

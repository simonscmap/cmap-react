import * as actionTypes from '../actionTypes/notifications';
import states from '../../enums/asyncRequestStates';
import generateKey from '../../Components/Admin/News/generateKey';

export default function (state, action) {
  switch (action.type) {
  case actionTypes.FETCH_NOTIFICATION_HISTORY_SUCCESS:
    // notificationHistory is an object with newsIds as keys
    return {
      ...state,
      notificationHistory: {
        ...state.notificationHistory,
        // spreading the payload will automatically update any existing keys with new data
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

  case actionTypes.SEND_NOTIFICATIONS_RESULT:
    return {
      ...state,
      sentNotifications: [
        ...(state.sentNotifications || []),
        action.payload,
      ]
    };

  case actionTypes.SET_SEND_NOTIFICATIONS_STATUS:
    return {
      ...state,
      sendNotificationsStatus: [
        ...(state.sendNotificationsStatus || []),
        action.payload,
      ]
    }

  default:
    return state;
  }
}

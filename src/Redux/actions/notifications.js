import * as actionTypes from '../actionTypes/notifications';

export const fetchNotificationHistory = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_HISTORY,
  payload: args
});

export const fetchNotificationHistorySuccess = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_HISTORY_SUCCESS,
  payload: args
});

export const setNotificationHistoryRequestStatus = (args) => ({
  type: actionTypes.SET_NOTIFICATION_HISTORY_REQUEST_STATUS,
  payload: args
});

// fetch projection

export const fetchNotificationRecipientProjection = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION,
  payload: args
});

export const fetchNotificationRecipientProjectionSuccess = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION_SUCCESS,
  payload: args
});

export const setNotificationRecipientProjectionRequestStatus = ({ tags, status }) => ({
  type: actionTypes.SET_NOTIFICATION_RECIPIENT_PROJECTION_REQUEST_STATUS,
  payload: {
    tags,
    status,
  }
});


// fetch preview

export const fetchNotificationPreviews = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_PREVIEWS,
  payload: {
    newsId: args.newsId
  },
});

export const fetchNotificationPreviewsSuccess = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_PREVIEWS_SUCCESS,
  payload: args,
});

export const setFetchNotificationPreviewsRequestStatus = (status) => ({
  type: actionTypes.SET_FETCH_NOTIFICATION_PREVIEWS_REQUEST_STATUS,
  payload: status,
});

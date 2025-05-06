import * as actionTypes from '../actionTypes/notifications';

export const fetchNotificationHistory = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_HISTORY,
  payload: args,
});

export const fetchNotificationHistorySuccess = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_HISTORY_SUCCESS,
  payload: args,
});

export const setNotificationHistoryRequestStatus = (args) => ({
  type: actionTypes.SET_NOTIFICATION_HISTORY_REQUEST_STATUS,
  payload: args,
});

// fetch projection

export const fetchNotificationRecipientProjection = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION,
  payload: args,
});

export const fetchNotificationRecipientProjectionSuccess = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION_SUCCESS,
  payload: args,
});

export const setNotificationRecipientProjectionRequestStatus = ({
  tags,
  status,
}) => ({
  type: actionTypes.SET_NOTIFICATION_RECIPIENT_PROJECTION_REQUEST_STATUS,
  payload: {
    tags,
    status,
  },
});

// fetch preview

export const fetchNotificationPreviews = (args) => ({
  type: actionTypes.FETCH_NOTIFICATION_PREVIEWS,
  payload: {
    newsId: args.newsId,
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

// send

export const sendNotifications = (args) => ({
  type: actionTypes.SEND_NOTIFICATIONS,
  payload: args,
});

export const sendNotificationsResult = (args) => ({
  type: actionTypes.SEND_NOTIFICATIONS_RESULT,
  payload: args,
});

export const setSendNotificationsStatus = (args) => ({
  type: actionTypes.SET_SEND_NOTIFICATIONS_STATUS,
  payload: args, // not just a status, but a status + metadata
});

// re-send
export const reSendNotifications = (args) => ({
  type: actionTypes.RESEND_NOTIFICATIONS,
  payload: args,
});

export const reSendNotificationsResult = (args) => ({
  type: actionTypes.RESEND_NOTIFICATIONS_RESULT,
  payload: args,
});

export const setReSendNotificationsStatus = (args) => ({
  type: actionTypes.SET_RESEND_NOTIFICATIONS_STATUS,
  payload: args, // not just a status, but a status + metadata
});

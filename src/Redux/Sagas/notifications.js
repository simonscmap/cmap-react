import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';

import api from '../../api/api';
import states from '../../enums/asyncRequestStates';
import * as actions from '../actions/notifications';
import * as actionTypes from '../actionTypes/notifications';
import * as interfaceActions from '../actions/ui';


export function* fetchNotificationHistory (action) {
  let response = yield call(api.notifications.history, null);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(actions.fetchNotificationHistorySuccess (jsonResponse));
  } else {
    yield put(actions.setNotificationHistoryRequestStatus ());
  }

} // ⮷ &. Watcher ⮷

export function* watchFetchNotificationHistory () {
  yield takeLatest(
    actionTypes.FETCH_NOTIFICATION_HISTORY,
    fetchNotificationHistory
  );
}


/* fetchProjection
 * sends request to api for projection of recipients
 * for a news item with the specified tags
 */
export function* fetchProjection (action) {
  yield put(actions.setNotificationRecipientProjectionRequestStatus ({
      tags: action.payload.tags,
      status: states.inProgress
    }));

  let response = yield call(api.notifications.recipients, action.payload);

  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(actions.fetchNotificationRecipientProjectionSuccess ({
      tags: action.payload.tags,
      ... jsonResponse
    }));
  } else {
    yield put(actions.setNotificationRecipientProjectionRequestStatus ({
      tags: action.payload.tags,
      status: states.failed
    }));
  }

} // ⮷ &. Watcher ⮷
export function* watchFetchNotificationProjection () {
  yield takeLatest(
    actionTypes.FETCH_NOTIFICATION_RECIPIENT_PROJECTION,
    fetchProjection
  );
}


/* fetchPreviews
 * sends a request to the api to get an html preview of a potential email
 * notification for the spacified news item
 */
export function* fetchPreviews (action) {
  yield put(actions.setFetchNotificationPreviewsRequestStatus (states.inProgress));

  let response = yield call(api.notifications.previews, action.payload);

  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(actions.fetchNotificationPreviewsSuccess (jsonResponse));
  } else {
    yield put(actions.setFetchNotificationPreviewsRequestStatus (states.failed));
  }

} // ⮷ &. Watcher ⮷
export function* watchFetchNotificationPreviews () {
  yield takeLatest(
    actionTypes.FETCH_NOTIFICATION_PREVIEWS,
    fetchPreviews
  );
}

/* sendNotification
 * sends email notification and returns result
 */
export function* sendNotifications (action) {
  console.log ('Send Notification Saga', action)
  yield put(actions.setSendNotificationsStatus ({
    status: states.inProgress,
    newsId: action.payload.newsId,
    tempId: action.payload.tempId,
    timestamp: Date.now(),
  }));

  let response = yield call(api.notifications.send, action.payload);

  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(actions.sendNotificationsResult ({
      ...action.payload,
      data: jsonResponse
    }));
    yield put(actions.setSendNotificationsStatus ({
      status: states.succeeded,
      newsId: action.payload.newsId,
      tempId: action.payload.tempId,
      timestamp: Date.now(),
    }));
    yield put(interfaceActions.snackbarOpen('Notifications sent!'));

  } else {
    let data;
    try {
      data = yield response.json();
    } catch (e) {
      console.log ('failed to decode json response');
    }
    yield put(actions.sendNotificationsResult ({
      ...action.payload,
      data,
    }));
    yield put(actions.setSendNotificationsStatus ({
      status: states.failed,
      newsId: action.payload.newsId,
      tempId: action.payload.tempId,
      timestamp: Date.now(),
    }));
    yield put(interfaceActions.snackbarOpen('Operation failed'));
  }

} // ⮷ &. Watcher ⮷
export function* watchSendNotifications () {
  yield takeLatest(
    actionTypes.SEND_NOTIFICATIONS,
    sendNotifications,
  );
}

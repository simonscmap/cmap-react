import { call, delay, put, takeLatest } from 'redux-saga/effects';

import api from '../../api/api';
import states from '../../enums/asyncRequestStates';
import * as actions from '../actions/notifications';
import * as actionTypes from '../actionTypes/notifications';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';

import logInit from '../../Services/log-service';

const log = logInit ('redux/sagas/notifications');

export function* fetchNotificationHistory (action) {
  if (!action.payload.newsId) {
    log.warn ('missing arg in fetchNotificationHistory', { ...action })
  }
  let response = yield call(api.notifications.history, action.payload);
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


function* pollHistory (newsId, n) {
  log.debug ('poll history', { newsId, n })
  if (n < 1) {
    return;
  }
  const remaining = n - 1;
  yield delay (1000 * 60); // wait 1 minute
  log.debug ('call fetchNotificationHistor from pollHistory', { newsId, n })
  yield fetchNotificationHistory ({ payload: { newsId }});
  yield pollHistory (newsId, remaining);
  return;
}

/* sendNotification
 * sends email notification and returns result
 */
export function* sendNotifications (action) {
  yield put(actions.setSendNotificationsStatus ({
    status: states.inProgress,
    newsId: action.payload.newsId,
    tempId: action.payload.tempId,
    timestamp: Date.now(),
  }));

  let response = yield call(api.notifications.send, action.payload);

  if (response.status === 401) {
    yield put(userActions.refreshLogin());
  }

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
    const responseText = yield response.text();
    yield put(actions.sendNotificationsResult ({
      ...action.payload,
      responseText,
    }));
    yield put(actions.setSendNotificationsStatus ({
      status: states.failed,
      newsId: action.payload.newsId,
      tempId: action.payload.tempId,
      timestamp: Date.now(),
    }));
    yield put(interfaceActions.snackbarOpen(`Operation failed: ${responseText}`));
  }
  log.info ('kick off polling history 10 times', { newsId: action.payload.newsId });
  yield pollHistory (action.payload.newsId, 10);
} // ⮷ &. Watcher ⮷
export function* watchSendNotifications () {
  yield takeLatest(
    actionTypes.SEND_NOTIFICATIONS,
    sendNotifications,
  );
}


/* reSendNotification
 * gets failed recipients and resends email
 */
export function* reSendNotifications (action) {
  yield put(actions.setReSendNotificationsStatus ({
    status: states.inProgress,
    newsId: action.payload.newsId,
    emailId: action.payload.emailId,
    timestamp: Date.now(),
  }));

  let response = yield call(api.notifications.reSend, action.payload);
  if (response.status === 401) {
    yield put(userActions.refreshLogin());
  }

  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(actions.reSendNotificationsResult ({
      ...action.payload,
      data: jsonResponse
    }));
    yield put(actions.setReSendNotificationsStatus ({
      status: states.succeeded,
      newsId: action.payload.newsId,
      emailId: action.payload.emailId,
      timestamp: Date.now(),
    }));
    yield put(interfaceActions.snackbarOpen('ReSending Notifications'));
  } else {
    const responseText = yield response.text();
    yield put(actions.reSendNotificationsResult ({
      ...action.payload,
      responseText,
    }));
    yield put(actions.setReSendNotificationsStatus ({
      status: states.failed,
      newsId: action.payload.newsId,
      emailId: action.payload.emailId,
      timestamp: Date.now(),
    }));
    yield put(interfaceActions.snackbarOpen('Operation failed'));
  }
  log.info ('kick off polling history 10 times', { newsId: action.payload.newsId });
  yield pollHistory (action.payload.newsId, 10);

} // ⮷ &. Watcher ⮷
export function* watchReSendNotifications () {
  yield takeLatest(
    actionTypes.RESEND_NOTIFICATIONS,
    reSendNotifications,
  );
}

import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';

import api from '../../api/api';
import states from '../../enums/asyncRequestStates';
import * as actions from '../actions/notifications';
import * as actionTypes from '../actionTypes/notifications';

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

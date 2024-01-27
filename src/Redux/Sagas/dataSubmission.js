import api from '../../api/api';
import * as dataSubmissionActions from '../actions/dataSubmission';
import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import states from '../../enums/asyncRequestStates';

import { call, put, takeLatest, select } from 'redux-saga/effects';

export function* checkSubmissionName (action) {
  let response = yield call(api.dataSubmission.checkName, action.payload);
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(dataSubmissionActions.checkSubmNameResponseStore(jsonResponse));
  } else {
    yield put(dataSubmissionActions.setCheckSubmNameRequestStatus(states.failed));
  }
}

export function* watchCheckSubmissionNameRequestSend () {
  yield takeLatest(
    dataSubmissionActionTypes.CHECK_SUBM_NAME_REQUEST_SEND,
    checkSubmissionName
  );
}

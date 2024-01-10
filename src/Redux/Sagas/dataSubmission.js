import api from '../../api/api';
import * as dataSubmissionActions from '../actions/dataSubmission';
import * as dataSubmissionActionTypes from '../actionTypes/dataSubmission';
import states from '../../enums/asyncRequestStates';

import { call, put, takeLatest, delay } from 'redux-saga/effects';

export function* checkSubmissionName (action) {
  let response;
  try {
    response = yield call(api.dataSubmission.checkName, action.payload);
  } catch (e) {
     yield put(dataSubmissionActions.setCheckSubmNameRequestStatus(states.failed));
  }
  if (response && response.ok) {
    let jsonResponse = yield response.json();
    yield put(dataSubmissionActions.checkSubmNameResponseStore(jsonResponse));
  } else {
    let responseText = yield response.text();
    yield put(dataSubmissionActions.setCheckSubmNameRequestStatus(states.failed, responseText));
  }
}

export function* watchCheckSubmissionNameRequestSend () {
  yield takeLatest(
    dataSubmissionActionTypes.CHECK_SUBM_NAME_REQUEST_SEND,
    checkSubmissionName
  );
}


// utils

export function* uploadFileParts ({ uploadSessionId, file, customChunkSize }) {
  console.log ('start uploadFileParts');

  let offset = 0;
  let retries = 0;
  let chunkSize = customChunkSize || 5 * 1024 * 1024;

  let currentPartSucceeded = false;

  let error = false;
  while (offset < file.size && !error) { // while more chunks, upload part
    currentPartSucceeded = false;

    while (currentPartSucceeded === false && retries < 3) {
      let part = file.slice(offset, offset + chunkSize);

      let formData = new FormData();
      formData.append('part', part);
      formData.append('offset', offset);
      formData.append('sessionID', uploadSessionId);

      console.log ('decide if upload part should close', file.size, offset + chunkSize);
      if (file.size < offset + chunkSize)  {
        formData.append ('close', true);
      }

      let uploadPartResponse = yield call(
        api.dataSubmission.uploadPart,
        formData,
      );

      if (uploadPartResponse.ok) {
        currentPartSucceeded = true;
      } else {
        retries++;
        yield delay(2000);
      }
    }

    if (currentPartSucceeded === false) {
      error = true;
    } else {
      offset += chunkSize;
    }
  }
  console.log ('uploadFileParts done', `offset: ${offset}`,`error: ${error}`);
  return [error];
}

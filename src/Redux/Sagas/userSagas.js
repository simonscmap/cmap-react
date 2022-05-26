import Cookies from 'js-cookie';
import { call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/api';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import * as userActionTypes from '../actionTypes/user';

/* userLogin, watchUserLogin
 * triggering action: LOGIN_REQUEST_SEND
 * subsequent actions
 * - INTERFACE_HIDE_LOGIN_DIALOG
 * - LOGIN_REQUEST_SUCCESS,
 * - LOGIN_REQUEST_FAILURE
 * - STORE_INFO
 * - SNACKBAR_OPEN
 * - GET_CART_AND_STORE,
 * downstream apis: user.getCart
 * store key: cart
 * dispatched in: LoginDialog.js
 */
export function* userLogin(action) {
  yield put(userActions.userLoginRequestProcessing());
  let result = yield call(api.user.login, action.payload);

  if (result.ok) {
    yield put(interfaceActions.hideLoginDialog());
    // TODO: handle JSON.parse throw
    var userInfo = JSON.parse(Cookies.get('UserInfo'));
    yield put(userActions.userLoginRequestSuccess());
    yield put(userActions.storeInfo(userInfo));
    yield put(interfaceActions.snackbarOpen('Login was successful!'));
    yield put(userActions.cartGetAndStore());
    if (window.location.pathname === '/login') {
      let search = new URLSearchParams(window.location.search)
      let redirect = search.get('redirect');
      // if a redirect is requested, go to it
      if (redirect) {
        window.location.href = `/${redirect}`
      } else {
       // default to /catalog page
       window.location.href = '/catalog';
      }
    }
  } else {
    yield put(userActions.userLoginRequestFailure());
    yield put(interfaceActions.snackbarOpen('Login failed.'));
  }
} // ⮷ &. Watcher ⮷

export function* watchUserLogin() {
  yield takeLatest(userActionTypes.LOGIN_REQUEST_SEND, userLogin);
}

/* userRegistration, watchUserRegistration
 * ---------------------------------------
 * triggering action: REGISTRATION_REQUEST_SEND
 * dispatched by: User/RegistrationStepper.js
 * subsequent actions:
 * - REGISTRATION_REQUEST_PROCESSING
 * - REGISTRATION_NEXT_ACTIVE_STEP
 * - REGISTRATION_REQUEST_FAILURE
 * - SNACKBAR_OPEN
 * downstream apis: user.register
 * store key: userRegistrationState
 */
function* userRegistration(action) {
  yield put(userActions.userRegistrationRequestProcessing());
  let result = yield call(api.user.register, action.payload);

  if (result.ok) {
    yield put(interfaceActions.registrationNextActiveStep());
  } else {
    yield put(userActions.userRegistrationRequestFailure());
    yield put(
      interfaceActions.snackbarOpen(
        'Registration failed. Please try again later.',
      ),
    );
  }
} // ⮷ &. Watcher ⮷

export function* watchUserRegistration() {
  yield takeLatest(userActionTypes.REGISTRATION_REQUEST_SEND, userRegistration);
}

// userValidation, watchUserValidation
function* userValidation(action) {
  yield put(userActions.userValidationRequestProcessing());
  let result = yield call(api.user.validate, action.payload);
  let isValid = yield result.json();

  if (isValid) {
    yield put(userActions.userValidationRequestSuccess());
    yield put(interfaceActions.registrationNextActiveStep());
  } else {
    yield put(userActions.userValidationRequestFailure());
  }
} // ⮷ &. Watcher ⮷

export function* watchUserValidation() {
  yield takeLatest(userActionTypes.VALIDATION_REQUEST_SEND, userValidation);
}

// userLogout, watchUserLogout
function* userLogout() {
  let authInstance = yield window.gapi.auth2.getAuthInstance();
  yield authInstance.signOut();
  yield call(api.user.logout);
  yield put(userActions.destroyInfo());
  yield (window.location.href = '/');
} // ⮷ &. Watcher ⮷

export function* watchUserLogout() {
  yield takeLatest(userActionTypes.LOG_OUT, userLogout);
}

// googleLoginRequest, watchGoogleloginRequest
// GOOGLE_LOGIN_REQUEST_SEND
function* googleLoginRequest(action) {
  yield put(userActions.googleLoginRequestProcessing());
  let result = yield call(
    api.user.googleLoginRequest,
    action.payload.userIDToken,
  );

  if (result.ok) {
    yield put(interfaceActions.hideLoginDialog());
    var userInfo = JSON.parse(Cookies.get('UserInfo'));
    yield put(userActions.userLoginRequestSuccess());
    yield put(userActions.storeInfo(userInfo));
    yield put(userActions.cartGetAndStore());
    if (window.location.pathname === '/login') {
      window.location.href = '/';
    }
  } else {
    yield put(userActions.userLoginRequestFailure());
    yield put(interfaceActions.snackbarOpen('Login failed.'));
  }
} // ⮷ &. Watcher ⮷

export function* watchGoogleLoginRequest() {
  yield takeLatest(
    userActionTypes.GOOGLE_LOGIN_REQUEST_SEND,
    googleLoginRequest,
  );
}

// keyRetrieval, watchKeyRetrieval
function* keyRetrieval() {
  let result = yield call(api.user.keyRetrieval);

  if (result.status === 401) {
    yield put(userActions.refreshLogin());
  }

  if (!result.ok) {
    yield put(userActions.keyRetrievalRequestFailure());
    yield put(interfaceActions.snackbarOpen('API Key Retrieval Failed'));
  } else {
    let response = yield result.json();
    yield put(userActions.keyRetrievalRequestSuccess(response.keys));
  }
} // ⮷ &. Watcher ⮷

export function* watchKeyRetrieval() {
  yield takeLatest(userActionTypes.KEY_RETRIEVAL_REQUEST_SEND, keyRetrieval);
}

// keyCreation, watchKeyCreationRequest
// create an api key
function* keyCreation(action) {
  yield put(userActions.keyCreationRequestProcessing());
  let result = yield call(api.user.keyCreation, action.payload.description);

  if (result.status === 401) {
    yield put(userActions.refreshLogin());
    return;
  }

  if (!result.ok) {
    yield put(
      interfaceActions.snackbarOpen('We were unable to create a new API key.'),
    );
  } else {
    yield put(interfaceActions.snackbarOpen('A new API key was created'));
    yield put(userActions.keyCreationRequestSuccess());
    yield put(userActions.keyRetrievalRequestSend());
  }
} // ⮷ &. Watcher ⮷

export function* watchKeyCreationRequest() {
  yield takeLatest(userActionTypes.KEY_CREATION_REQUEST_SEND, keyCreation);
}

/* contactUsRequest, watchContactUs
 * downstream apis: user.contactUs
 * store key: contactUs.requestState
 * dispatched in: Contact.js
 */
function* contactUsRequest(action) {
  let result = yield call(api.user.contactUs, action.payload);
  if (result.ok) {
    yield put(userActions.contactUsRequestSuccess());
  } else {
    yield put(userActions.contactUsRequestFailure({
      message: 'failed',
      data: result,
    }));
  }
} // ⮷ &. Watcher ⮷

export function* watchContactUs() {
  yield takeLatest(userActionTypes.CONTACT_US_REQUEST_SEND, contactUsRequest);
}

/* nominateNewData, watchNominateNewData
 * downstream apis: user.contactUs
 * store key: nominateNewData.requestState
 * dispatched in: NominateNewData.js
 */
function* nominateNewData(action) {
  // nominate new data uses /api/user/contactus
  let result = yield call(api.user.nominateNewData, action.payload);
  if (result.ok) {
    yield put(userActions.nominateNewDataRequestSuccess());
  } else {
    yield put(
      userActions.nominateNewDataRequestFailure({
        message: 'failed',
        data: result,
      }),
    );
  }
} // ⮷ &. Watcher ⮷

export function* watchNominateNewData() {
  yield takeLatest(
    userActionTypes.NOMINATE_NEW_DATA_REQUEST_SEND,
    nominateNewData,
  );
}

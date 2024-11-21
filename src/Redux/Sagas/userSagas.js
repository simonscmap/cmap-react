import Cookies from 'js-cookie';
import { call, put, takeLatest, select } from 'redux-saga/effects';
import api from '../../api/api';
import * as interfaceActions from '../actions/ui';
import * as userActions from '../actions/user';
import * as userActionTypes from '../actionTypes/user';
import * as catalogActions from '../actions/catalog';
import * as communityActions from '../actions/community';
import parseError from '../../Utility/parseError';
import states from '../../enums/asyncRequestStates';
import logInit from '../../Services/log-service';

const log = logInit ('redux/sagas/userSagas');

/* userLogin, watchUserLogin
 * triggering action: LOGIN_REQUEST_SEND
 * subsequent actions
 * - INTERFACE_HIDE_LOGIN_DIALOG
 * - LOGIN_REQUEST_SUCCESS,
 * - LOGIN_REQUEST_FAILURE
 * - STORE_INFO
 * - SNACKBAR_OPEN
 * dispatched in: LoginDialog.js
 */
export function* userLogin(action) {
  const tag = { tag: 'userLogin' };

  // send login request
  yield put(userActions.userLoginRequestProcessing());
  let response = yield call(api.user.login, action.payload);

  if (response.ok) {
    yield put(interfaceActions.hideLoginDialog());
    // TODO: handle JSON.parse throw
    var userInfo = JSON.parse(Cookies.get('UserInfo'));
    yield put(userActions.userLoginRequestSuccess());
    yield put(userActions.storeInfo(userInfo));
    yield put(interfaceActions.snackbarOpen('You are now logged in.', tag));

    const userSubscriptions = yield select ((state) => state.userSubscriptions);
    if (!userSubscriptions) {
      yield fetchSubscriptions ();
    }

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
    } else {

      // get catalog state
      let downloadState = yield select((state) => state.download);


      if (downloadState.currentRequest && downloadState.checkQueryRequestState === states.failed) {
        // retry the query check if the last request failed (it was probably a 401)
        yield put(catalogActions.checkQuerySize(downloadState.currentRequest))
      }
    }

  } else {
    yield put(userActions.userLoginRequestFailure());
    yield put(interfaceActions.snackbarOpen('Login failed.', tag));
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
  const tag = { tag: 'userRegistration' };
  yield put(userActions.userRegistrationRequestProcessing());
  let result = yield call(api.user.register, action.payload);

  if (result.ok) {
    yield put(interfaceActions.registrationNextActiveStep());
  } else {
    yield put(userActions.userRegistrationRequestFailure());
    yield put(
      interfaceActions.snackbarOpen(
        'Registration failed. Please try again later.',
        tag
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
  yield put(userActions.destroyInfo()); // clear app state
  const result = yield call (api.user.logout); // clear jwt
  if (result.ok) {
    yield put (interfaceActions.snackbarOpen('You have been logged out.'));
  } else {
    yield put (interfaceActions.snackbarOpen('There was an unexpected error while logging out.'));
  }
} // ⮷ &. Watcher ⮷

export function* watchUserLogout() {
  yield takeLatest(userActionTypes.LOG_OUT, userLogout);
}

// googleLoginRequest, watchGoogleloginRequest
// GOOGLE_LOGIN_REQUEST_SEND
function* googleLoginRequest(action) {
  yield put(userActions.googleLoginRequestProcessing());
  let response = yield call(
    api.user.googleLoginRequest,
    action.payload,
  );

  if (response.ok) {
    yield put(interfaceActions.hideLoginDialog());
    yield put(userActions.userLoginRequestSuccess());

    const userInfo = JSON.parse(Cookies.get('UserInfo'));
    let info;
    try {
      info = yield response.json();
    } catch (e) {
      console.log ('error parsing json from response', response);
      return;
    }

    if (info && (info.login || info.attach)) {
      yield put(interfaceActions.snackbarOpen('You are now logged in using your Google Account.'));
    } else if (info && info.register) {
      yield put(interfaceActions.snackbarOpen('You have successfully registered using your Google Account.'));
    } else {
      console.log ('unknown response from login', response);
    }

    yield put(userActions.storeInfo(userInfo));

    if (window.location.pathname === '/login') {
      window.location.href = '/';
    }
  } else {
    console.log ('google login failure', response);
    yield put(userActions.userLoginRequestFailure());
    if (action.payload.originator == 'login form') {
      yield put(interfaceActions.snackbarOpen('There was a problem logging you in with your Google Account.'));
    } else if (action.payload.originator == 'register') {
      yield put(interfaceActions.snackbarOpen('There was a problem registering you with your Google Account.'));
    } else {
      // removing user message because this login attempt can be triggered automatically
      // and an error message without a prior user action can be confusing
      // yield put(interfaceActions.snackbarOpen('Login failed.'));
    }
  }
} // ⮷ &. Watcher ⮷

export function* watchGoogleLoginRequest() {
  yield takeLatest(
    userActionTypes.GOOGLE_LOGIN_REQUEST_SEND,
    googleLoginRequest,
  );
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function* promptGSILogin () {
  const user = yield select((state) => state.user);
  if (user) {
    console.log ('user is already logged in');
    return;
  }
  const google = window.google;
  if (google) {
    if (google.accounts) {
      if (google.accounts.id) {
        if (google.accounts.id.prompt) {
          // the client was initialized with a reference to the callback
          // that will handle the credential and call the cmap login api
          // this prompt merely kicks off that process
          google.accounts.id.prompt((notification) => {
            const cmapStore = window.cmapStore;
            const t = notification.getMomentType();
            switch (t) {
            case 'display':
              if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.log ('not displayed', reason);
                if (cmapStore) {
                  cmapStore.dispatch({ type: 'INTERFACE_HIDE_LOGIN_DIALOG' });
                  let message = `Google login is not available`;
                  if (reason === 'suppressed_by_user') {
                    message += ' because you have recently closed the Google login prompt. It will be available again after a cooldown period determined by Google. You may create a password and login via password using your email as username.';
                  }
                  cmapStore.dispatch({ type: 'SNACKBAR_OPEN', payload: { message }});
                }
              }
              break;
            case 'skipped':
              console.log ('google login skipped', notification.getSkippedReason());
              if (cmapStore) {
                window.cmapStore.dispatch({ type: 'INTERFACE_HIDE_LOGIN_DIALOG' });
                window.cmapStore.dispatch({ type: 'SNACKBAR_OPEN', payload: { message: 'Google login is not available' }})
              }
              break;
            case 'dismissed':
              console.log ('google login dismissed', notification.getDismissedReason())
              break;
            }

          });
        } else {
          console.log ('no google.accounts.id.prompt');
        }
      } else {
        console.log ('no google.accounts.id object');
      }
    } else {
      console.log ('no google.accounts object');
    }
  } else {
    console.log ('no globale google object loaded');
  }
}

export function* watchPromptGoogleLogin() {
  yield takeLatest(
    userActionTypes.PROMPT_GOOGLE_LOGIN,
    promptGSILogin,
  );
}

// keyRetrieval, watchKeyRetrieval
function* keyRetrieval() {
  const tag = { tag: 'keyRetrieval' };

  let result = yield call(api.user.keyRetrieval);

  if (result.status === 401) {
    yield put(userActions.refreshLogin());
  }

  if (!result.ok) {
    yield put(userActions.keyRetrievalRequestFailure());
    yield put(interfaceActions.snackbarOpen('API Key Retrieval Failed', tag));
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
  const tag = { tag: 'keyCreation' };

  yield put(userActions.keyCreationRequestProcessing());
  let result = yield call(api.user.keyCreation, action.payload.description);

  if (result.status === 401) {
    yield put(userActions.refreshLogin());
    return;
  }

  if (!result.ok) {
    yield put(
      interfaceActions.snackbarOpen('We were unable to create a new API key.', tag),
    );
  } else {
    yield put(interfaceActions.snackbarOpen('A new API key was created', tag));
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


/* fetchLastDatasetTouch
 */
function* fetchLastDatasetTouch (action) {
  const loggedInUser = yield select((state) => state.user);
  const userId = action.payload;

  if (!userId || !loggedInUser) {
    console.log ('no user id provided; cannot fetch last api call');
  } else if (loggedInUser.id !== userId) {
    console.log ('requested user id does not match logged in user; aborting request');
  } else {
    console.log ('setting to in-progress; initiating call');
    yield put (userActions.requestUserApiCallsStatus (userId, states.inProgress));
    let result = yield call(api.user.getLastDatasetTouch, userId);
    if (result && result.ok) {
      const record = yield result.json();
      if (record && record.date_time) {
        const touch = new Date(record.date_time);
        yield put (userActions.requestUserApiCallsStatus (userId, states.succeeded));
        yield put(userActions.setLastDatasetTouch({ userId, dateObj: touch }));
      } else {
        console.log ('failed to parse response from getLastDatasetTouch');
        yield put (userActions.requestUserApiCallsStatus (userId, states.failed));
      }
    } else {
      console.log('failed to get last user touch');
      yield put (userActions.requestUserApiCallsStatus (userId, states.failed));
    }
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchLastUserTouch() {
  yield takeLatest(
    userActionTypes.REQUEST_USER_API_CALLS_SEND,
    fetchLastDatasetTouch,
  );
}


/* fetchSubscriptions
 */
function* fetchSubscriptions () {
  const loggedInUser = yield select((state) => state.user);
  const tag = { tag: 'fetchSubscriptions' };

  if (!loggedInUser) {
    log.warn ('no user id provided; cannot fetch subscriptions');
  } else {
    log.debug ('setting to in-progress; initiating call');
    yield put (userActions.setFetchSubsRequestStatus (states.inProgress));
    let result;
    try {
      result = yield call(api.user.getSubscriptions);
    } catch (e) {
      log.error ('error getting subscriptions', { user: loggedInUser });
      yield put (userActions.setFetchSubsRequestStatus (states.failed));
      yield put(interfaceActions.snackbarOpen('Failed to fetch subscriptions', tag));
      return;
    }
    if (result && result.ok) {
      let subs;
      try {
        subs = yield result.json();
      } catch (e) {
        log.error ('failed to parse response', { error: e });
        yield put (userActions.setFetchSubsRequestStatus (states.failed));
        yield put (interfaceActions.snackbarOpen('Failed to fetch subscriptions', tag));
      }
      if (subs) {
        log.info ('retrieved subscriptions', { subs });
        yield put(userActions.fetchSubscriptionsSuccess ({ subscriptions: subs }));
      } else {
        log.error ('failed to parse response', { result, subs });
        yield put (userActions.setFetchSubsRequestStatus (states.failed));
        yield put (interfaceActions.snackbarOpen('Failed to fetch subscriptions', tag));
      }
    } else if (result && result.status === 401) {
      log.error ('request to fetch subscriptions rejected by authetication', { result });
      yield put (userActions.setFetchSubsRequestStatus (states.failed));
      yield put(userActions.refreshLogin());
      return;
    } else {
      log.error ('failed to get user subscriptions');
      yield put (userActions.setFetchSubsRequestStatus (states.failed));
      yield put (interfaceActions.snackbarOpen('Failed to fetch subscriptions', tag));
    }
  }
} // ⮷ &. Watcher ⮷

export function* watchFetchUserSubscriptions () {
  yield takeLatest(
    userActionTypes.FETCH_SUBSCRIPTIONS_SEND,
    fetchSubscriptions,
  );
}

/* createSubscription
 */
function* createSubscription (action) {
  const loggedInUser = yield select((state) => state.user);
  const tag = { tag: 'createSubscriptions' };

  if (!loggedInUser) {
    log.warn ('no user; cannot create subscriptions');
    return;
  } else if (!action.payload) {
    log.warn ('no dataset name; cannot create subscriptions');
    return;
  } else {
    log.debug ('setting to in-progress; initiating call');
    yield put (userActions.setCreateSubsRequestStatus (states.inProgress));
    let result;
    try {
      result = yield call(api.user.createSubscription, action.payload);
    } catch (e) {
      log.error ('error creating subscription', { user: loggedInUser });
      yield put (userActions.setCreateSubsRequestStatus (states.failed));
      yield put(interfaceActions.snackbarOpen('Failed to create subscriptions', tag));
      return;
    }
    if (result && result.ok) {
      yield put (userActions.setCreateSubsRequestStatus (states.succeeded));
      const payload = yield result.json();
      const message = payload.message; // could be "subscription created" or "subscription already exists"
      yield put(interfaceActions.snackbarOpen(`Success: ${message}`, tag));
      // refetch
      yield fetchSubscriptions ();
      return;
    } else if (result && result.status === 401) {
      log.error ('request to creat subscription rejected by authetication', { result });
      yield put (userActions.setCreateSubsRequestStatus (states.failed));

      // prompt login
      yield put(userActions.refreshLogin());
      return;
    } else {
      log.error ('failed to create subscription', result);
      yield put (userActions.setCreateSubsRequestStatus (states.failed));
      yield put(interfaceActions.snackbarOpen('Failed to create subscriptions', tag));
      return;
    }
  }
} // ⮷ &. Watcher ⮷

export function* watchCreateSubscription () {
  yield takeLatest(
    userActionTypes.CREATE_SUBSCRIPTION_SEND,
    createSubscription,
  );
}

/* deleteSubscription
 */
function* deleteSubscriptions (action) {
  const loggedInUser = yield select((state) => state.user);
  const tag = { tag: 'deleteSubscriptions' };

  if (!loggedInUser) {
    log.warn ('no user; cannot modify subscriptions');
  } else if (!Array.isArray(action.payload) || action.payload.length === 0) {
    log.warn ('no dataset names; cannot delete subscriptions');
  } else {
    log.debug ('setting to in-progress; initiating call');
    yield put (userActions.setDeleteSubsRequestStatus (states.inProgress));
    let result;
    try {
      result = yield call(api.user.deleteSubscriptions, action.payload);
    } catch (e) {
      log.error ('error deleting subscription', { user: loggedInUser });
      yield put (userActions.setDeleteSubsRequestStatus (states.failed));
      yield put(interfaceActions.snackbarOpen('Failed to unsubscribe dataset(s)', tag));
      return;
    }
    if (result && result.ok) {
      yield put(interfaceActions.snackbarOpen('Success unsubscribing', tag));
      yield put (userActions.setDeleteSubsRequestStatus (states.succeeded));
      // refetch
      yield fetchSubscriptions ();
      return;
    } else if (result && result.status === 401) {
      log.error ('request to delete subscription rejected by authetication', { result });
      yield put (userActions.setDeleteSubsRequestStatus (states.failed));

      // prompt login
      yield put(userActions.refreshLogin());
      return;
    } else {
      log.error ('failed to create subscription', result);
      yield put (userActions.setDeleteSubsRequestStatus (states.failed));
      yield put(interfaceActions.snackbarOpen('Failed to unsubscribe dataset(s)', tag));
      return;
    }
  }
} // ⮷ &. Watcher ⮷

export function* watchDeleteSubscriptions () {
  yield takeLatest(
    userActionTypes.DELETE_SUBSCRIPTIONS_SEND,
    deleteSubscriptions,
  );
}

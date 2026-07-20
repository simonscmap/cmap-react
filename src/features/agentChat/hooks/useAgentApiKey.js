// Resolves whether the current visitor can talk to the agent, and with which
// API key.
//
// The web application already retrieves the user's CMAP API keys for the API
// Key page: the keyRetrievalRequestSend action calls /api/user/retrieveapikeys
// and the result is stored on redux state as `apiKeys`, an array of records
// shaped { Api_Key, Description }. The agent authenticates with exactly those
// keys, so no new plumbing is needed; the keys are simply requested on demand
// when the chat panel is first opened.

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { keyRetrievalRequestSend } from '../../../Redux/actions/user';
import states from '../../../enums/asyncRequestStates';

// Access states, in the order they are resolved.
export const ACCESS = {
  loggedOut: 'loggedOut',
  loadingKeys: 'loadingKeys',
  retrievalFailed: 'retrievalFailed',
  noKey: 'noKey',
  ready: 'ready',
};

const useAgentApiKey = (isPanelOpen) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const apiKeys = useSelector((state) => state.apiKeys);
  const retrievalState = useSelector((state) => state.apiKeyRetrievalState);

  const isLoggedIn = Boolean(user);

  // Request the keys the first time the panel is opened by a logged-in user
  // who has none loaded. Requesting only on open avoids an unnecessary call on
  // every page load for visitors who never use the agent.
  useEffect(() => {
    if (isPanelOpen && isLoggedIn && apiKeys === null) {
      dispatch(keyRetrievalRequestSend());
    }
  }, [isPanelOpen, isLoggedIn, apiKeys, dispatch]);

  if (!isLoggedIn) {
    return { access: ACCESS.loggedOut, apiKey: null };
  }

  if (apiKeys === null) {
    // A failed retrieval leaves the key list null and records the failure
    // separately, so waiting on the list alone would spin indefinitely.
    if (retrievalState === states.failed) {
      return { access: ACCESS.retrievalFailed, apiKey: null };
    }
    return { access: ACCESS.loadingKeys, apiKey: null };
  }

  if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
    return { access: ACCESS.noKey, apiKey: null };
  }

  // A user may hold several keys; any of them authenticates the same user, so
  // the first is used.
  const firstKey = apiKeys[0];
  const value = firstKey && firstKey.Api_Key ? firstKey.Api_Key : null;

  if (!value) {
    return { access: ACCESS.noKey, apiKey: null };
  }

  return { access: ACCESS.ready, apiKey: value };
};

export default useAgentApiKey;

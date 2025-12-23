import store from '../Redux/store';
import { refreshLoginWithMessage } from '../Redux/actions/user';

/**
 * Fetch wrapper that handles 401 (Unauthorized) responses globally.
 *
 * When any API call returns 401, this wrapper automatically dispatches
 * the refreshLogin action to show the login dialog. This centralizes
 * auth error handling so individual stores and components don't need
 * to handle it.
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} The fetch Response object
 */
const fetchWithAuth = async (url, options) => {
  const response = await fetch(url, options);

  if (response.status === 401) {
    store.dispatch(refreshLoginWithMessage());
  }

  return response;
};

export default fetchWithAuth;

# User

For more information about the Google API, see the InfrastructureOverview doc.

## Auth

Users can sign in with password or their google account.

Note that user accounts _can_ have both password and google account.

The logged-in state is maintained with the exchange of JWTs. The user model is encoded in the JWT and informs the web client about user profile information, including information about news subscriptions, etc.

## Username

The CMAP login dialog used to accept only the user's username. However, many users entered their email address and then had trouble logging in. We changed the dialog and auth to accept email address as well. However, many users enter a different email address than the one they registered with; this seems to follow from the use of both institutional emails and personal emails, or users who have changed institutions.

## Google

CMAP migrated to Google's one-tap signin experience, which replaces Google oAuth. CMAP encountered a number of problems with the oAuth flow; the cause seems to have been a combination of privacy settings and third-party extensions that interfered with the use of third-party cookies. The new Google Sign In flow seems to have reduced or eliminated this problem. However, there remains in our system detailed logging surrounding log in attempts to help monitor log in issues.

To implement the new Sign In flow, we use the `@react-oauth/google` package. The way Google has set up this flow requires the website to fetch the script that creates a log in client from google every time. The `@react-oauth/google` package handles this process, ensuring the client is globally available. This can be seen in `/src/App.js` where the package provided component `GoogleOAuthProvider` is rendered along with our Google Client Id (which can be created or configured at https://console.cloud.google.com/apis/dashboard ). Then for the log-in UI, the package-provided `GoogleLogin` component is rendered in our `LoginForm` (`/src/Components/User/LoginForm.js`), and is porvided callbacks to handle success and error. Note that the successful Google Sign In does not yet log the user into the CMAP system, we still have to handle that. Google Sign In is just an authentication layer, which identifies that the user is associated with this google id. The success handler we provide takes that id and calls the API so that we can look up the CMAP user by their Google Id. The success handler takes the credential response from google and dispatches it; the saga `googleLoginRequest` is called in `/src/Redux/Sagas/userSagas.js`, which makes the API call with the credential. A successful response from the user includes a JWT token with the user information, which is then persisted in redux with the `userActions.storeInfo` action that is processed by the user reducer `/src/Redux/Reducers/user.js`.

## Registration

The same Google Sign In implementation is used in the registration process, the only difference is the calling context: the dispatch that includes the Google credential includes a flag that indicates whether to register the user or not. This is used by the API. You can find the registration flow in the API repository in `/controllers/user/googleAuth.js`.

If a user opts to use a password for logging in, then the registration flow works by sending the user an email with a link pointing to a web page for choosing a password. -- There have been bugs in the past with generating correct links when the `NODE_ENV` was not correctly consulted, and a link pointing to `localhost` was sent. This is controlled by the API, which sends user emails.

## Signing Out

Signing a user out requires 3 distinct steps. This is implemented in the `userLogout` saga in `/src/Redux/Sagas/userSagas.js`.

1. In order to correctly sign a user out, the Google Client's signout method must be called. We use the `googleLogout` function provided by the `@react-oauth/google` package.
2. Information in redux is removed and reset: the `user`, `apiKeys`, login dialog state, and `userApiCallsRequestStatus`.
3. The session must be cleared, so a call to the API is made to `/api/user/signout`, which clears the `UserInfo` and `jwt` cookies.

## User Profile

Some useful data is stored on the User Profile:

- a flag indicating whether the user has subscribed to receive news updates via email (in contrast to subscriptions to specific datasets, which is stored in a separate table)
- a flag indicating whether the user is an admin or not: this is referenced when restricting access to the Data Submissions dashboard and the News Admin dashboard

The user can change the data in their profile, which uses the `/api/user/updateinfo` API. This deals in whole user profile objects; profiles are not updated per field.

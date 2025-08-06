# CMAP Web Client - Project Overview

## Code organization

The entrypoint of the application is `src/index.js`, which creates the redux store (`src/Redux/store.js`) and mounts the react app to the DOM.

The react app root is `src/App.js`, where the routes are all registered and their components specified. This roughly maps to what is presented in the top navigation on the page.

Most components are defined in `src/Components`.

Two important features are in `src/Services`: the log-service (which provides a convenience function for creating logs with context, but does not send logs to any persistence layer), and the `persist` service, which allows for certain redux actions to be persisted in local storage (this is used for saving state for page tours and help features, which can be toggled on and off by the user).

Enums (constants) are defined in `src/enums`. These are particularly important for correct behavior of the app. For example, `src/enums/temporalResolutions.js` is critical for visualization calculations and download functionality, and `src/enumns/asyncRequestStates.js` is used frequently to organize UI behavior and api call handling (such as retries and exponential backoff).

Shared functions, constants, and enums can be found in `src/Utility`. Helper functions are often defined in modules within `src/Components` as well.

API definitions are in `src/api`. Visualization data classes are also defined there, since they are instantiated upon receiving streamed data responses from the API.

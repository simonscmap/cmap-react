import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { LicenseManager } from 'ag-grid-enterprise';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import * as serviceWorker from './serviceWorker';
import store from './Redux/store';
import App from './App';
import { addBreadcrumb } from './shared/errorCapture/breadcrumbs';
import './Stylesheets/index.css';
import 'ag-grid-enterprise';

LicenseManager.setLicenseKey(
  'School_of_Oceanography_Simons_CMAP_1Devs_1Deployment_19_June_2020__MTU5MjUyMTIwMDAwMA==aec33f954c06d90afed06467402921bd',
);

var SENTRY_DSN_PRODUCTION = 'https://235dc211fb6c038ff5713280b5172696@o4509317255004160.ingest.us.sentry.io/4509317256249344';
var SENTRY_DSN_STAGING = 'https://21180e3f5acde2601c05415936b5ebee@o4509317255004160.ingest.us.sentry.io/4510547464683520';

function getSentryConfig() {
  var hostname = window.location.hostname;
  if (hostname === 'simonscmap.com') {
    return { dsn: SENTRY_DSN_PRODUCTION, environment: 'production' };
  }
  if (hostname === 'simonscmap.dev') {
    return { dsn: SENTRY_DSN_STAGING, environment: 'staging' };
  }
  return { dsn: SENTRY_DSN_STAGING, environment: 'development' };
}

if (
  process.env.NODE_ENV === 'production' ||
  process.env.REACT_APP_ENABLE_SENTRY === 'true'
) {
  var sentryConfig = getSentryConfig();
  Sentry.init({
    dsn: sentryConfig.dsn,
    release: process.env.REACT_APP_SENTRY_RELEASE || 'development',
    environment: sentryConfig.environment,
    sendDefaultPii: true,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      /ResizeObserver loop/,
    ],
    beforeSend: function(event, hint) {
      var error = hint.originalException;
      if (error && error.message && error.message.includes('ResizeObserver loop')) {
        return null;
      }
      return event;
    },
    beforeBreadcrumb: function(breadcrumb) {
      addBreadcrumb(breadcrumb);
      return breadcrumb;
    },
  });
}

const rootElement = document.getElementById('root');

// We're using React 16.13.1 where ReactDOM.render is the standard API.
// The createRoot API is not available in React 16, so this warning can be safely ignored.
/* eslint-disable react/no-deprecated */
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement,
);

Object.assign(window, { cmapStore: store });

serviceWorker.unregister();

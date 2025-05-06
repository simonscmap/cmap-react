import { ENV } from '../../constants';
import { localStorageApi } from '../persist/local';

export const getEnv = () => {
  // first check if local storage contains a value for envOverride
  const override = localStorageApi.get('envOverride');
  if (override && ENV[override]) {
    return ENV[override];
  }

  // otherwise, use location.hostname
  const hostname = window.location.hostname;
  switch (hostname) {
    case 'simonscmap.com':
      return ENV.production;
    case 'simonscmap.dev':
      return ENV.staging;
    case 'localhost':
      return ENV.development;
    default:
      // if we can't detect env, fall back to production
      console.log('env not detected');
      return ENV.production;
  }
};

export const isProduction = getEnv() === ENV.production;
export const isStaging = getEnv() === ENV.staging;
export const isDevelopment = getEnv() === ENV.development;
export const env = getEnv();

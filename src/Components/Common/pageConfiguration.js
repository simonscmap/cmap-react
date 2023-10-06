// TODO provide means of determining
// 1. is help enabled on the page at all
// 2. is video available
// 3. is tour available
// 4. are hints available

import { homepageConfig } from '../Home';
import { catalogConfig } from '../Catalog/Catalog';
import { visualizationConfig } from '../Visualization/Visualization';
import { aboutConfig } from '../About';
import { galleryConfig } from '../Gallery';
import { submissionGuideConfig } from '../DataSubmission/NewGuide';
import { documentationConfig } from '../../Documentation/sidebar';
import { testPageConfig } from '../Explorer';

export const disabled = 'disabled';
export const enabled = 'enabled';

const pages = {
  '/': homepageConfig,
  '/catalog': catalogConfig,
  '/visulization': visualizationConfig,
  '/visualization/charts': visualizationConfig,
  '/visualization/cruises': {},
  '/datasubmission': {},
  '/datasubmission/guide': {},
  '/datasubmission/new-guide': submissionGuideConfig,
  '/datasubmission/validationtool': {},
  '/datasubmission/userdashboard': {},
  '/datasubmission/admindashboard': {},
  '/documentation': documentationConfig,
  '/about': aboutConfig,
  '/gallery': galleryConfig,
  '/contact': {},
  '/apikeymanagement': {},
  '/profile': {},
  '/register': {},
  '/forgotpass': {},
  '/choosepassword': {},
  '/test': testPageConfig
};

export const getPageConfiguration = (pathname) => {
  if (pages[pathname]) {
    return pages[pathname];
  }
  // Todo: this is a bad way to encode a failure case
  return {};
};

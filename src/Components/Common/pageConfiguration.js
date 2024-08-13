// TODO provide means of determining
// 1. is help enabled on the page at all
// 2. is video available
// 3. is tour available
// 4. are hints available

import { homepageConfig } from '../Home';
import { catalogConfig } from '../Catalog/Catalog';
import { visualizationConfig } from '../Visualization/Visualization';
import { cruiseConfig } from '../Catalog/CruiseFullPage';
import { aboutConfig } from '../About';
import { galleryConfig } from '../Gallery';
import { submissionGuideConfig } from '../DataSubmission/Guide/SubmissionGuide2';
import { documentationConfig } from '../../Documentation/sidebar';
import { testPageConfig } from '../Explorer';
import { programsIndexConfig } from '../Catalog/Programs/Index';

export const disabled = 'disabled';
export const enabled = 'enabled';

const pages = {
  '/': homepageConfig,
  '/catalog': catalogConfig,
  '/catalog/programs': programsIndexConfig,
  '/visulization': visualizationConfig,
  '/visualization/charts': visualizationConfig,
  '/visualization/cruises': cruiseConfig,
  '/datasubmission': {},
  '/datasubmission/guide': {},
  '/datasubmission/submission-portal': {},
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
  if (typeof pathname !== 'string') {
    return {};
  }
  // TODO: pattern matching
  if (pages[pathname]) {
    return pages[pathname];
  } else {
    const lastSlash = pathname.lastIndexOf ('/');
    if (lastSlash > 0) {
      const parentPath = pathname.slice(0, lastSlash);
      return getPageConfiguration (parentPath);
    }
  }
  // Todo: this is a bad way to encode a failure case
  return {};
};

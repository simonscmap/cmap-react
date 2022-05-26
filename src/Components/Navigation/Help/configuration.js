// TODO provide means of determining
// 1. is help enabled on the page at all
// 2. is video available
// 3. is tour available
// 4. are hints available

import { homepageConfig } from '../../Home';

export const disabled = 'disabled';
export const enabled = 'enabled';

const pages = {
  '/': homepageConfig,
  catalog: {

  },
  visulization: {},
  'visualization/charts': {},
  'visualization/cruises': {},
  datasubmission: {},
  'datasubmission/guide': {},
  'datasubmission/validationtool': {},
  'datasubmission/userdashboard': {},
  'datasubmission/admindashboard': {},
  documentation: {},
  about: {},
  contact: {},
  apikeymanagement: {},
  profile: {},
  register: {},
  forgotpass: {},
  choosepassword: {},
};

export const getPageConfiguration = (pathname) => {
  if (pages[pathname]) {
    return pages[pathname];
  }
  return null;
};

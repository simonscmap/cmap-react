import {
  CATALOG_PAGE,
  VISUALIZATION_PAGE,
  CHARTS_PAGE,
  CRUISE_PAGE,
  HOMEPAGE,
} from '../constants.js';

const pathToPage = {
  '/': HOMEPAGE,
  '/catalog': CATALOG_PAGE,
  '/visualization': VISUALIZATION_PAGE,
  // NOTE at the moment it is more useful to consider all these
  // routes the visualization page, but that may change
  '/visualization/charts': CHARTS_PAGE,
  '/visualization/cruises': CRUISE_PAGE,
};

export const pathNameToPageName = (pathName) => {
  if (!pathName || typeof pathName !== 'string') {
    console.log('invalid argument to function "pathNameToPageName"');
    return null;
  }

  let page = pathToPage[pathName];

  if (page) {
    return page;
  }

  return null;
};

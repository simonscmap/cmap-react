import { CATALOG_PAGE, VISUALIZATION_PAGE } from '../constants.js';

const pathToPage = {
  '/catalog': CATALOG_PAGE,
  '/visualization': VISUALIZATION_PAGE,
  // NOTE at the moment it is more useful to consider all these
  // routes the visualization page, but that may change
  '/visualization/charts': VISUALIZATION_PAGE,
  '/visualization/cruises': VISUALIZATION_PAGE,
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

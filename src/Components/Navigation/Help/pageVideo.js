import {
  CATALOG_OVERVIEW_VIDEO,
  VISUALIZATION_OVERVIEW_VIDEO,
  HOMEPAGE_VIDEO,
} from '../../../constants';

export const mapPageNameToIntroVideo = (pageName) => {
  switch (pageName) {
    case 'catalog':
      return CATALOG_OVERVIEW_VIDEO;
    case 'visualization':
      return VISUALIZATION_OVERVIEW_VIDEO;
    case 'homepage':
      return HOMEPAGE_VIDEO;
    default:
      return '';
  }
};

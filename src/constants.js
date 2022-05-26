// Page Id
export const CATALOG_PAGE = 'catalog';
export const VISUALIZATION_PAGE = 'visualization';
export const CHARTS_PAGE = 'charts';
export const CRUISE_PAGE = 'cruise';

export const ROUTES = {
  home: '',

  catalog: 'catalog',
  datasets: 'catalog/datasets',
  cruises: 'catalog/cruises',

  visualization: 'visualization',
  charts: 'visualization/charts',
  cruiseExplorer: 'visualization/cruises',

  community: 'community',

  dataSubmission: 'datasubmission',
  validation: 'datasubmission/validationtool',
  userDashboard: 'datasubmission/userdashboard',
  adminDashboard: 'datasubmission/admindashboard',

  documentation: 'documentation',

  about: 'about',
  contact: 'contact',

  apiKeyManagement: 'apikeymanagement',
  profile: 'profile',
  register: 'register',
  forgotPass: 'forgotPass',
  choosePass: 'choosepassword',
};

// Local storage keys
export const LOCAL_STORAGE_KEY_INTRO_STATE = 'introState';
export const LOCAL_STORAGE_KEY_HINTS_STATE = 'hintState';

// Hint constants
export const DEFAULT_HINT_POSITION = 'left';

// Help
export const CATALOG_OVERVIEW_VIDEO = 'https://player.vimeo.com/video/701009719';
  // 'https://player.vimeo.com/video/620160138';
export const VISUALIZATION_OVERVIEW_VIDEO =
  'https://player.vimeo.com/video/668819801'; // old: 657984891

export const NAVIGATION_WIDTH_BREAKPOINT = 900; // use mobile nav at 900 and below
export const NAVIGATION_COMPRESS_BREAKPOINT = 1280;

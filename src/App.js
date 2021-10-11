import React, { Suspense, lazy, Component } from 'react';
import { connect } from 'react-redux';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { initializeGoogleAuth, ingestCookies } from './Redux/actions/user';
import { toggleShowHelp, windowResize } from './Redux/actions/ui';
import { ServicesInit } from './Services/Init.js';
import './Stylesheets/App.scss';

import colors from './enums/colors';
import z from './enums/zIndex';

import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { debounce } from 'throttle-debounce';

import GlobalUIComponentWrapper from './Components/UI/GlobalUIComponentWrapper';
import TopNavBar from './Components/UI/TopNavBar';
import ErrorBoundary from './Components/UI/ErrorBoundary';

const ApiKeyManagement = lazy(() =>
  import('./Components/User/ApiKeyManagement'),
);
const SearchResults = lazy(() => import('./Components/Catalog/SearchResults'));
const Register = lazy(() => import('./Components/User/Register'));
const Visualization = lazy(() =>
  import('./Components/Visualization/Visualization'),
);
const LandingPage = lazy(() => import('./Components/LandingPage'));
const Login = lazy(() => import('./Components/User/Login'));
const Profile = lazy(() => import('./Components/User/Profile'));
const DataSubmission = lazy(() =>
  import('./Components/DataSubmission/DataSubmission'),
);
const ContactUs = lazy(() => import('./Components/ContactUs'));
const CommunityTemp = lazy(() =>
  import('./Components/Community/CommunityTemp'),
);
const Catalog = lazy(() => import('./Components/Catalog/Catalog'));
const DatasetFullPage = lazy(() =>
  import('./Components/Catalog/DatasetFullPage'),
);
const ForgotPass = lazy(() => import('./Components/User/ForgotPass'));
const ChoosePassword = lazy(() => import('./Components/User/ChoosePassword'));
const CruiseFullPage = lazy(() =>
  import('./Components/Catalog/CruiseFullPage'),
);
const Probe = lazy(() => import('./Components/probe/Probe'));

// Changes to default styles of MUI components
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    fontFamily: ['"Lato"', 'sans-serif'].join(','),
  },

  palette: {
    primary: {
      contrastText: '#000000',
      main: colors.primary,
    },

    error: {
      main: colors.errorYellow,
    },

    secondary: {
      main: colors.secondary,
      // contrastText: '#fff700',
    },

    background: {
      default: colors.backgroundGray,
      paper: colors.backgroundGray,
    },

    text: {
      primary: '#ffffff',
      secondary: colors.primary,
    },
  },

  overrides: {
    MuiIconButton: {
      root: {
        color: colors.primary,
        borderRadius: '10%',
      },
    },

    MuiPaper: {
      root: {
        backgroundColor: 'rgba(0,0,0,.3)',
      },
    },

    MuiListItemIcon: {
      root: {
        minWidth: '40px',
      },
    },

    MuiFormHelperText: {
      filled: {
        paddingLeft: '1px',
        paddingRight: '1px',
        fontSize: '13px',
      },
    },

    MuiListItem: {
      gutters: {
        paddingLeft: '6px',
        paddingRight: '10px',
      },

      root: {
        paddingTop: '4px',
        paddingBottom: '4px',
      },
    },

    MuiToolbar: {
      root: {
        backgroundColor: 'transparent',
        color: colors.primary,
      },
    },

    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: colors.greenHover,
        },
      },
    },

    MuiTooltip: {
      // root: {
      //   zIndex: z.TOOLTIP
      // }
      popper: {
        zIndex: z.TOOLTIP,
      },
    },

    MuiPickersBasePicker: {
      container: {
        backgroundColor: colors.backgroundGray,
      },
    },

    MuiOutlinedInput: {
      input: {
        padding: '12px 14px',
      },

      root: {
        '&$focused': {
          borderColor: colors.primary,
        },
      },
    },

    MuiSnackbarContent: {
      message: {
        margin: 'auto',
      },
    },

    MuiButtonGroup: {
      groupedOutlined: {
        '&:not(:first-child)': {
          marginLeft: 0,
        },
      },
    },

    MuiTableCell: {
      root: {
        borderBottomColor: 'rgba(0, 0, 0, 0.9)',
      },
    },

    MuiFormControl: {
      marginNormal: {
        marginTop: '8px',
      },
    },

    MuiDialogContentText: {
      root: {
        color: 'white',
      },
    },

    MuiAccordion: {
      root: {
        '&$expanded': {
          margin: 0,
        },
      },
    },

    MuiDialogTitle: {
      root: {
        color: colors.primary,
      },
    },

    MuiFilledInput: {
      input: {
        paddingLeft: '6px',
      },

      adornedEnd: {
        paddingRight: '6px',
      },

      root: {
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&:disabled': {
          backgroundColor: 'transparent',
        },
      },
    },

    MuiPopover: {
      paper: {
        backgroundColor: '#1B4156',
      },
    },
  },
});

const mapDispatchToProps = {
  initializeGoogleAuth,
  toggleShowHelp,
  windowResize,
  ingestCookies,
};

class App extends Component {
  componentDidMount = () => {
    this.props.initializeGoogleAuth();
    window.onresize = this.handleResize;
    this.props.ingestCookies();
  };

  debouncedResize = debounce(200, this.props.windowResize);

  handleResize = () => {
    this.debouncedResize(window.innerHeight, window.innerWidth);
  };

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="App">
          <MuiThemeProvider theme={theme}>
            <ErrorBoundary>
              <BrowserRouter>
                <ServicesInit />
                <GlobalUIComponentWrapper />
                <TopNavBar />
                <Suspense fallback={''}>
                  <Switch>
                    <Route
                      exact
                      path="/apikeymanagement"
                      component={ApiKeyManagement}
                    />
                    <Route exact path="/">
                      <LandingPage />
                    </Route>
                    <Route exact path="/catalog">
                      <Catalog />
                    </Route>
                    <Route exact path="/login">
                      <Login />
                    </Route>
                    <Route exact path="/register">
                      <Register />
                    </Route>
                    <Route path="/visualization">
                      <Visualization />
                    </Route>
                    <Route exact path="/profile">
                      <Profile />
                    </Route>
                    <Route exact path="/forgotpass">
                      <ForgotPass />
                    </Route>
                    <Route path="/datasubmission">
                      <DataSubmission />
                    </Route>
                    <Route path="/choosepassword">
                      <ChoosePassword />
                    </Route>
                    <Route exact path="/contact">
                      <ContactUs />
                    </Route>
                    <Route path="/community">
                      <CommunityTemp />
                    </Route>
                    <Route path="/catalog/searchresults">
                      <SearchResults />
                    </Route>
                    <Route path="/catalog/datasets/:dataset" component={DatasetFullPage}>
                    </Route>
                    <Route path="/catalog/cruises/:cruiseName" component={CruiseFullPage}>
                    </Route>
                    <Route exact path="/sample">
                      <Probe />
                    </Route>
                  </Switch>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default connect(null, mapDispatchToProps)(App);

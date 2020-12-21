import React, { Component } from 'react';
import { connect } from 'react-redux';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import './Stylesheets/App.scss';

import colors from './Enums/colors';

import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './Components/Home';
import Catalog from './Components/Catalog/Catalog';
import SearchResults from './Components/Catalog/SearchResults';
import Register from './Components/User/Register';
import Visualization from './Components/Visualization/Visualization';
import GlobalUIComponentWrapper from './Components/UI/GlobalUIComponentWrapper';
import LandingPage from './Components/LandingPage';
import TopNavBar from './Components/UI/TopNavBar';
import Login from './Components/User/Login';
import Profile from './Components/User/Profile';
import DataSubmission from './Components/DataSubmission/DataSubmission';
import ContactUs from './Components/ContactUs';
import CommunityTemp from './Components/Community/CommunityTemp';
import CatalogNew from './Components/Catalog/CatalogNew';
import DatasetFullPage from './Components/Catalog/DatasetFullPage';
import ForgotPass from './Components/User/ForgotPass';
import ChoosePassword from './Components/User/ChoosePassword';
import CruiseFullPage from './Components/Catalog/CruiseFullPage';

import { initializeGoogleAuth } from './Redux/actions/user';
import { toggleShowHelp } from './Redux/actions/ui';

const theme = createMuiTheme({

  typography: {
    useNextVariants: true,
    fontFamily: [
      '"Lato"',
      'sans-serif'
    ].join(',')
  },

  palette: {
    primary: {
      contrastText: '#000000',
      main: colors.primary
    },

    error: {
      main: colors.errorYellow
    },

    secondary: {
      main: colors.secondary,
      // contrastText: '#fff700',
    },

    background: {
      default: colors.backgroundGray,
      paper: colors.backgroundGray
    },

    text: {
      primary: '#ffffff',
      secondary: colors.primary
    }
  },

  overrides: {
    MuiIconButton: {
      root: {
        color: colors.primary,
        borderRadius: '10%'
      }
    },
    
    MuiPaper: {
      root: {
        backgroundColor: 'rgba(0,0,0,.3)',
      }
    },

    MuiListItemIcon: {
      root: {
        minWidth: '40px'
      }
    },

    MuiFormHelperText: {
      filled: {
        paddingLeft: '1px',
        paddingRight: '1px',
        fontSize: '13px'
      }
    },

    MuiListItem: {
      gutters: {
        paddingLeft: '6px',
        paddingRight: '10px'
      },

      root: {
        paddingTop: '4px',
        paddingBottom: '4px'
      }
    },

    MuiToolbar: {
      root: {
        backgroundColor: 'transparent',
        color: colors.primary
      }
    },

    MuiMenuItem: {
      root: {
        '&:hover': {
          backgroundColor: colors.greenHover,
        },
      }
    },

    MuiPickersBasePicker: {
      container: {
        backgroundColor: colors.backgroundGray
      }
    },
    
    MuiOutlinedInput: {
      input: {
        padding: '12px 14px'
      },

      root: {
        "&$focused": {
          "borderColor": colors.primary
        }
      }
    },

    MuiSnackbarContent: {
      message: {
        margin: 'auto'
      }
    },

    MuiButtonGroup: {
      groupedOutlined: {
        '&:not(:first-child)': {
          marginLeft: 0
        }
      }
    },

    MuiTableCell: {
      root: {
        borderBottomColor: "rgba(0, 0, 0, 0.9)"
      }
    },

    MuiFormControl: {
      marginNormal: {
        marginTop: '8px'
      }
    },

    MuiDialogContentText: {
      root: {
        color: 'white'
      }
    },

    MuiExpansionPanel: {
      root: {
        "&$expanded": {
          margin: 0
        }
      }
    },
    
    MuiDialogTitle: {
      root: {
        color: colors.primary
      }
    },

    MuiFilledInput: {
      input: {
        paddingLeft: '6px',
      },

      adornedEnd: {
        paddingRight: '6px'
      },

      root: {
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&:disabled': {
          backgroundColor: 'transparent',
        }
      }
    },

    MuiPopover: {
      paper: {
        backgroundColor: '#1B4156'
      }
    }
  }
});

const mapStateToProps = (state, ownProps) => ({
  loadingMessage: state.loadingMessage
});

const mapDispatchToProps = {
  initializeGoogleAuth,
  toggleShowHelp
};

class App extends Component {
  componentDidMount = () => {
    this.props.initializeGoogleAuth();
  }
  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="App">
          <MuiThemeProvider theme={theme}>
          <BrowserRouter>
            <GlobalUIComponentWrapper/>
            <TopNavBar/>
            <Switch>          
              <Route exact path='/apikeymanagement' component={ Home } />
              <Route exact path='/' component={ LandingPage } />
              <Route exact path='/catalog' component={ CatalogNew } />
              <Route exact path='/login' component={ Login } />
              <Route exact path='/register' component={ Register } />
              <Route path='/visualization' component={Visualization} />
              <Route exact path='/profile' component={Profile} />
              <Route exact path='/forgotpass' component={ForgotPass} />
              <Route path='/datasubmission' component={DataSubmission} />
              <Route path='/choosepassword' component={ChoosePassword} />
              <Route exact path='/contact' component={ContactUs}/>
              <Route path='/community' component={CommunityTemp} />
              <Route path='/catalog/searchresults' component={SearchResults}/>
              <Route path='/catalog/datasets/:dataset' component={DatasetFullPage}/>
              <Route path='/catalog/cruises/:cruiseName' component={CruiseFullPage}/>
            </Switch>
          </BrowserRouter>
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
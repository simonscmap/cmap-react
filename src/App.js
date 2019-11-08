import React, { Component } from 'react';
import { connect } from 'react-redux';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

import './App.scss';

import colors from './Enums/colors';

import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './Components/Home';
import Catalog from './Components/Catalog';
import Register from './Components/Register';
import Visualization from './Components/Visualization';
import GlobalUIComponentWrapper from './Components/GlobalUIComponentWrapper';
import LandingPage from './Components/LandingPage';
import TopNavBar from './Components/TopNavBar';


const theme = createMuiTheme({
  // aqua: #22A3B9
  // orange: #FF8000

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
      main: colors.orange
    },

    error: {
      main: colors.errorYellow
    },

    secondary: {
      main: colors.aqua,
      // contrastText: '#fff700',
    },

    background: {
      default: colors.backgroundGray,
      paper: colors.backgroundGray
    },

    text: {
      primary: '#ffffff',
      secondary: colors.orange
    }
  },

  overrides: {
    MuiIconButton: {
      root: {
        color: colors.orange,
        borderRadius: '10%'
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
        color: colors.orange
      }
    },

    MuiOutlinedInput: {
      input: {
        padding: '12px 14px'
      },

      root: {
        "&$focused": {
          "borderColor": colors.orange
        }
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

    MuiDialogTitle: {
      root: {
        color: colors.orange
      }
    },

    MuiFilledInput: {
      input: {
        paddingLeft: '6px',
      },

      inputSelect: {
        paddingBottom: '6px'
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
    }
  }
});

const mapStateToProps = (state, ownProps) => ({
  loadingMessage: state.loadingMessage
})

class App extends Component {

  constructor(props){
    super(props);
    this.vizRef = React.createRef();
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
            <Route exact path='/catalog' component={ Catalog } />
            <Route exact path='/register' component={ Register } />
            <Route exact path='/visualization' component={Visualization} />
          </Switch>
        </BrowserRouter>
        </MuiThemeProvider>
      </div>
    </MuiPickersUtilsProvider>
  );
}
}

export default connect(mapStateToProps, null)(App);
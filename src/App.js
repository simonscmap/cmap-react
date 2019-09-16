import React, { Component } from 'react';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { shadows } from '@material-ui/system';
import grey from '@material-ui/core/colors/grey';

import './App.scss';
import Routes from './routes';

import colors from './Enums/colors';

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

    secondary: {
      main: colors.aqua,
      // contrastText: '#fff700',
    },

    background: {
      default: grey[800],
      paper: grey[800]
    },

    text: {
      primary: '#ffffff',
      secondary: colors.orange
    }
  },

  overrides: {
    MuiIconButton: {
      root: {
        color: colors.orange
      }
    },

    MuiToolbar: {
      root: {
        backgroundColor: grey[800],
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
    }
  }
});

class App extends Component {

  componentDidCatch = (error, info) => {
    console.log('Error:');
    console.log(error);
    console.log('Info');
    console.log(info);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="App">
          <MuiThemeProvider theme={theme}>
            <Routes />
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default App;
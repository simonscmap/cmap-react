import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { buttonStates } from './buttonStates';
import ValidationStatusBar from './StatusBar';

const useStyles = makeStyles({
  root: {
    width: '100%',
    backgroundColor: '#13374e',
    paddingBottom: '.5em'
  },
});

const WarningTheme = createTheme({
  palette: {
    primary: {
      main: "#d16265;",
    },
  },
});

const WarningBar = () => {
  return (
    <ThemeProvider theme={WarningTheme}>
      <LinearProgress variant="determinate" value={100} color="primary" />
    </ThemeProvider >
  );
}

const IndicatorBar = (props) => {
  const classes = useStyles();
  const {
    buttonState,
    // downloadState
  } = props;

  console.log('button state [indicator bar]', buttonState)


  if (buttonState.status === buttonStates.notTried) {
    return '';
  }

  if (buttonState.status === buttonStates.checkInProgress) {
    return (
      <div className={classes.root}>
        <LinearProgress color="primary" />
        <ValidationStatusBar message={buttonState.message} />
      </div>
    );
  }

  if (buttonState.status === buttonStates.checkSucceededAndDownloadProhibited) {
    return (
      <div className={classes.root}>
        <WarningBar />
        <ValidationStatusBar message={buttonState.message} />
      </div>
    );
  }

  if (buttonState.status === buttonStates.checkSucceededAndDownloadAllowed) {
    return (
      <div className={classes.root}>
        <LinearProgress variant="determinate" value={100} color="primary" />
        <ValidationStatusBar message={buttonState.message} />
      </div>
    );
  }

  return '';
}

export default IndicatorBar;

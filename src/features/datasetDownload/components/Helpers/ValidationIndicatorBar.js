import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { buttonStates } from '../../utils/buttonStates';
import ValidationStatusBar from '../../../../Components/Catalog/DownloadDialog/StatusBar';

const useStyles = makeStyles({
  root: {
    width: '100%',
    backgroundColor: '#13374e',
    paddingBottom: '.5em',
  },
});

const WarningTheme = createTheme({
  palette: {
    primary: {
      main: '#d16265;',
    },
    secondary: {
      main: '#ffd54f',
    },
  },
});

const WarningBar = ({ color }) => {
  return (
    <ThemeProvider theme={WarningTheme}>
      <LinearProgress
        variant="determinate"
        value={100}
        color={color || 'primary'}
      />
    </ThemeProvider>
  );
};

const IndicatorBar = (props) => {
  const classes = useStyles();
  const {
    buttonState,
    // downloadState
  } = props;

  if (buttonState.status === buttonStates.checkFailed) {
    return (
      <div className={classes.root}>
        <WarningBar color="secondary" />
        <ValidationStatusBar state={buttonState} />
      </div>
    );
  }

  if (buttonState.status === buttonStates.checkInProgress) {
    return (
      <div className={classes.root}>
        <LinearProgress color="primary" />
        <ValidationStatusBar state={buttonState} />
      </div>
    );
  }

  if (buttonState.status === buttonStates.checkSucceededAndDownloadProhibited) {
    return (
      <div className={classes.root}>
        <WarningBar />
        <ValidationStatusBar state={buttonState} />
      </div>
    );
  }

  if (buttonState.status === buttonStates.checkSucceededAndDownloadAllowed) {
    return (
      <div className={classes.root}>
        <LinearProgress variant="determinate" value={100} color="primary" />
        <ValidationStatusBar state={buttonState} />
      </div>
    );
  }

  // not tried | default case
  return '';
};

export default IndicatorBar;

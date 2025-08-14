import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  makeStyles,
} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Anchor from '@material-ui/core/Link';
import { Link } from 'react-router-dom';

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import { buttonStates } from '../../utils/buttonStates';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '.75em',
    marginLeft: '40px', // match Dialog Title Root
    marginRight: '40px',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
    gap: '1em',
    alignItems: 'center',
  },
  infoHandle: {
    cursor: 'pointer',
  },
  infoBox: {
    margin: '1em 0',
  },
  linkRestyle: {
    '& a': {
      color: theme.palette.primary.main,
    },
  },
  alignRight: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'end',
  },
}));

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

/* Warning Icon */
const StyledWarningIcon = () => {
  return (
    <ThemeProvider theme={WarningTheme}>
      <WarningIcon color={'secondary'} />
    </ThemeProvider>
  );
};

/* Prohibited Icon */
const ProhibitedIcon = () => {
  return (
    <ThemeProvider theme={WarningTheme}>
      <NotInterestedIcon color={'primary'} />
    </ThemeProvider>
  );
};

const IconWrapper = ({ status }) => {
  switch (status) {
    case buttonStates.checkFailed:
      return <StyledWarningIcon />;
    case buttonStates.checkSucceededAndDownloadAllowed:
      return <CheckCircleIcon color="primary" />;
    case buttonStates.checkSucceededAndDownloadProhibited:
      return <ProhibitedIcon />;
    default:
      return '';
  }
};

const StatusBar = (props) => {
  const classes = useStyles();
  const { state } = props;
  let { message, status } = state;

  let [infoState, setInfoState] = useState(false);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.messageContainer}>
          <IconWrapper status={status} />
          <Typography variant="body1" component="p">
            {message}
          </Typography>
        </div>

        {!infoState && (
          <div
            className={classes.infoHandle}
            onClick={() => setInfoState(true)}
          >
            <InfoOutlinedIcon />
          </div>
        )}
      </div>
      {infoState && (
        <div className={classes.infoBox}>
          <Card>
            <CardContent>
              <div className={classes.linkRestyle}>
                <Typography variant="body2" component="p">
                  Some datasets are very large and will exceed your
                  browser&apos;s memory limits. Download requests are checked to
                  ensure the estimated size is less than ~2 million rows. If the
                  download is disabled due to size, try configuring a subset
                  with parameters that decrease the overall size of the
                  download. Alternately, used one of CMAP&apos;s libraries to
                  download data directly:{' '}
                  <Link to="/documentation">SDK Documentation.</Link>
                </Typography>
              </div>
              <div className={classes.alignRight}>
                <Anchor
                  onClick={() => setInfoState(false)}
                  style={{ cursor: 'pointer' }}
                >
                  <Typography variant="body2">[ Close ]</Typography>
                </Anchor>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StatusBar;

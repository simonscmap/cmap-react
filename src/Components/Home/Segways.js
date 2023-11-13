import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { pxToRem } from './theme';
import Button from '@material-ui/core/Button';
import PublishIcon from '@material-ui/icons/Publish';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles({
  segway: {
    width: '100%',
    padding: '0 0 5em 0',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: '1em',
  },
 container: {
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'left',
    textAlign: 'left',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  innerButton: {
    width: '75%',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonText: {
    fontSize: '1.1em',
  },
  iconContainer: {
    height: '2.5em',
    width: '2.5em',
    marginRight: '.5em',
    '& svg': {
      height: '1.2em',
      width: '1.2em',
    }
  },
  logoContainer: {
    height: '35px',
    width: '250px',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-evenly',
    margin: '1em auto',
    '& img': {
      height: '35px'
    }
  },
  center: {
    margin: '0 auto'
  }
});

const LargeButton = withStyles((theme) => ({
  root: {
    width: '100%',
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#000000',
      '& svg': {
        color: '#000000'
      }
    },
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '36px',
    boxSizing: 'border-box',
    padding: '23px',
    height: '2.5em',
    fontSize: pxToRem[18],
    fontWeight: 500,
    fontFamily: ['Montserrat', 'sans-serif'].join(','),
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
    '@media (max-width: 900px)': {
      fontSize: pxToRem[16],
    },
    '@media (max-width: 600px)': {
      fontSize: pxToRem[14],
    },
    '& span': {
      whiteSpace: 'nowrap',
    },

  },
}))(Button);

const Segways = () => {
  const history = useHistory();
  const classes = useStyles();

  return (
    <div className={classes.segway}>
      <div className={classes.container}>
        <div className={classes.buttonContainer}>
          <LargeButton onClick={() => history.push('/datasubmission/guide')}>
            <div className={classes.innerButton}>
              <div className={classes.iconContainer}>
                <PublishIcon color="primary" fontSize="large" />
              </div>
              <span className={classes.buttonText}>Submit Data</span>
            </div>
          </LargeButton>
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.buttonContainer}>
          <LargeButton
            color="primary"
            onClick={() => history.push('/apikeymanagement')}
          >
            <div className={classes.innerButton}>
              <div className={classes.iconContainer}>
                <VpnKeyIcon color="primary" fontSize="large" />
              </div>
              <span className={classes.buttonText}>API Access</span>
            </div>
          </LargeButton>
        </div>
        <div className={classes.logoContainer}>
          <a href="https://github.com/simonscmap/pycmap" target="_blank" rel="noreferrer"><img src="/images/home/python-logo-0.png" /></a>
          <a href="https://github.com/simonscmap/cmap4r" target="_blank" rel="noreferrer"><img src="/images/home/Rlogo.png" /></a>
        </div>
      </div>
    </div>
  );
};

export default Segways;

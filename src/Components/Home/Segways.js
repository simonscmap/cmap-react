import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { pxToRem } from './theme';
import Button from '@material-ui/core/Button';
import PublishIcon from '@material-ui/icons/Publish';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

const useStyles = makeStyles({
  buttonContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    fontSize: '1.3em',
  },
  iconContainer: {
    height: '3em',
    width: '3em',
    marginRight: '.5em',
    '& svg': {
      height: '1.5em',
      width: '1.5em',
      // width: 'auto', // let the icon expand to font size
      // height: 'auto',

    }
  },
  logoContainer: {
    height: '35px',
    width: '365px',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-evenly',
    margin: '1em auto',
    '& img': {
      height: '35px'
    }
  },
  container: {
    width: '365px',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'left',
    textAlign: 'left',
    margin: '1em auto',
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
    height: '3em',
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
    <Grid container item>
      <Grid item md={12} lg={6} className={classes.center}>
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
      </Grid>
      <Grid item md={12} lg={6} className={classes.center}>
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
      </Grid>
    </Grid>
  );
};

export default Segways;

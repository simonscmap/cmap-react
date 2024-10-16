import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';

import { homeTheme } from '../../Home/theme';
import Confirmation from '../../Common/Confirmation';
import { persistenceService } from '../../../Services/persist';
import { SET_SUBSCRIBE_INTRO_STATE } from '../../../Redux/actionTypes/ui';
import { setSubscribeIntroState } from '../../../Redux/actions/ui';

import {
  changeNewsSubscription,
} from '../../../Redux/actions/user';

persistenceService.add({
  actionType: SET_SUBSCRIBE_INTRO_STATE,
  key: 'subscribeIntroActive',
  payloadToValue: (currentLocalStorageValueForKey, payload) => {
    return payload;
  }
});

const useIntroStyles = makeStyles (() => ({
  intro: {
    position: 'absolute',
    top: -14,
    left: -11,
    right: -9,
    bottom: -13,
    background: 'rgba(105, 255, 242, 0.01)',
    color: 'black',
    zIndex: 0, // placing this behind allows the subscribe button to be interactive
    border: '1px solid rgb(105, 255, 242)',
    borderRadius: '5px',
    boxShadow: '0 0 20px rgba(105, 255, 242, 0.6), inset 0 0 10px rgba(105, 255, 242, 0.4), 0 2px 0 #000',
    //boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.4)',


  },
  off: {
    display: 'none',
  },
  message: {
    position: 'absolute',
    top: 6,
    right: 143,
    padding: '20px 15px 10px 15px',
    fontSize: '15px',
    fontFamily: 'Lato',
    width: '350px',
    background: '#031832',
    border: '1px solid rgb(105, 255, 242)',
    borderRadius: '5px',
    color: 'white',
    textAlign: 'left',
    boxShadow: '9px 4px 26px rgba(0, 0, 0, 0.4)',
    '& p': {
      margin: '0 0 5px 0',
      padding: 0,
      lineHeight: '22px'
    }
  },
  button: {
    float: 'right',
    background: 'none',
    border: '1px solid white',
    borderRadius: '20px',
    padding: '3px 15px',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      border: '1px solid rgb(105, 255, 242)',
      color: 'rgb(105, 255, 242)',
    }
  },
  arrow: {
    position: 'absolute',
    right: -9,
    top: 20,
    width: 0,
    height: 0,
    borderTop: '5px solid transparent',
    borderBottom: '5px solid transparent',
    borderLeft: '8px solid rgb(105, 255, 242)',
  }
}));

const IntroBox = (props) => {
  const subscribeIntroActive = useSelector ((state) => state.subscribeIntroActive);
  console.log ('subscribeIntroActive', subscribeIntroActive)
  const dispatch = useDispatch();
  const cl = useIntroStyles();
  const showHide = subscribeIntroActive ? cl.intro : cl.off;
  console.log ('showHide', showHide);
  const turnOff = () => dispatch (setSubscribeIntroState (false));
  return (
    <div className={showHide}>
      <div className={cl.message}>
        <div className={cl.arrow}></div>
        <p>You can now subscribe to get email notifications whenever there is Simons CMAP news.</p>
        <button className={cl.button} onClick={turnOff}>Got It</button>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'inline-block',
    position: 'relative',
  },
  button: {
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '2em',
    padding: '3px 2px 3px 1em',
    margin: '0 5px',
    '& > *': {
      height: '1em',
    }
  },
  subButton: {
    fontSize: '20px',
    color: 'grey',
    border: `2px solid #ccc`,
    '&:hover': {
      color: '#69FFF2',
      background: 'transparent',
      border:`2px solid ${theme.palette.secondary.main}`
    },

  },
  subButtonActive: {
    fontSize: '20px',
    color: 'rgb(179, 247, 102)',
    '&:hover': {
      color: '#69FFF2',
      background: 'transparent',
    }
  },
  mailSubscribed: {
    color: theme.palette.primary.main,
    marginRight: '10px',
  },
  mailUn: {
    color: '#ccc',
    marginRight: '10px',
  },
  switchSubscribed: {
    // color: theme.palette.primary.main
  },
  switchUn: {
    color: '#ddd'
  },

}));


const SubscribeNewsButton = (props) => {
  const { intro } = props
  const isNewsSubscribed = useSelector ((state) => state.user && state.user.isNewsSubscribed);
  const dispatch = useDispatch();
  const cl = useStyles();

  const [open, setOpen] = useState (false);

  const name = isNewsSubscribed
        ? 'Confirm Unsubscribe'
        : 'Confirm News Subscription';

  const actionButtonText = isNewsSubscribed
        ? 'Unsubscribe'
        : 'Subscribe';

  const text = isNewsSubscribed
        ? `Click "Unsubscribe" to unsubscribe from email notifications for Simons CMAP News.`
        : `Click "Subscribe" to subscribe to email notifications for Simons CMAP News.`;


  const confirmationProps = {
    open,
    openClose: setOpen,
    loading: false,
    error: false,
    name,
    text,
    actionButtonText,
    onConfirm: () => {
      // changeNewsSubscription takes true/false for subscribe/unsubscribe
      dispatch (changeNewsSubscription(!isNewsSubscribed));
      setOpen (false);
    },
  };

  const tooltipMessage = isNewsSubscribed
        ? 'Unsubscribe from email updates'
        : `Get email notification on updates`;

  const subscribeClass = isNewsSubscribed
        ? cl.subButtonActive
        : cl.subButton;

  const mailIconClass = isNewsSubscribed
        ? cl.mailSubscribed
        : cl.mailUn

  const switchClass = isNewsSubscribed
        ? cl.switchSubscribed
        : cl.switchUn;

  return (
    <div className={cl.wrapper}>
      <ThemeProvider theme={homeTheme}>
        {intro && <IntroBox />}
        <Confirmation {...confirmationProps} />
        <Tooltip title={tooltipMessage}>
          <Button
            className={`${cl.button} ${subscribeClass}`}
            onClick={() => setOpen (true)}
          >
            <MdOutlineMarkEmailUnread className={mailIconClass} />
            <Switch
              checked={isNewsSubscribed || false}
              size="small"
              className={switchClass} />
          </Button>
        </Tooltip>
      </ThemeProvider>
    </div>
  );
}

export default SubscribeNewsButton;

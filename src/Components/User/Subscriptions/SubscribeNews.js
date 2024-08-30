import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';

import { homeTheme } from '../../Home/theme';
import Confirmation from '../../Common/Confirmation';

import {
  changeNewsSubscription,
} from '../../../Redux/actions/user';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'inline-block',
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

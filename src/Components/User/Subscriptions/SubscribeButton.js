import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import CustomSwitch from './CustomSwitch';
import { subscribeDatasetDialogOpen } from '../../../Redux/actions/ui';

import { homeTheme } from '../../Home/theme';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'inline-block',
    overflow: 'hidden',
    marginTop: '2px'
  },
  buttonWrapper: {
    display: 'inline-block',
  },
  button: {
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '2em',
    padding: '2px 2px 2px 1em',
    margin: '0 5px 1px 0',
    '& > *': {
      height: '1em',
    },
    overflow: 'hidden',
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
  switchWrapper: {
    display: 'inline-block',
  },
  switchSubscribed: {
  },
  switchUn: {
    color: '#ddd'
  },
}));

const subscriptionsSelector = createSelector (
  [(state) => state.userSubscriptions],
  (subs) => {
    if (Array.isArray (subs)) {
      return subs;
    }
    return [];
  }
);

const SubscribeDatasetButton = (props) => {
  const { shortName } = props;
  const dispatch = useDispatch ();
  const cl = useStyles();

  const subscriptions = useSelector (subscriptionsSelector);

  const isSubscribed = Boolean(subscriptions.find ((sub) => {
    return sub.Dataset_Name === shortName
  }));

  const handleClick = () => {
    dispatch (subscribeDatasetDialogOpen (shortName));
  }

  const subscribeClass = isSubscribed
        ? cl.subButtonActive
        : cl.subButton;

  const mailIconClass = isSubscribed
        ? cl.mailSubscribed
        : cl.mailUn

  const tooltipMessage = isSubscribed
        ? `Unsubscribe from dataset updates`
        : `Subscribe to dataset updates`;

  return (
    <div className={cl.wrapper}>
      <ThemeProvider theme={homeTheme}>
        <Tooltip title={tooltipMessage}>
          <span className={cl.buttonWrapper}>
            <Button
              className={`${cl.button} ${subscribeClass}`}
              onClick={handleClick}
            >
              <MdOutlineMarkEmailUnread className={mailIconClass} />
              <CustomSwitch state={isSubscribed} />
            </Button>
          </span>

        </Tooltip>
      </ThemeProvider>
    </div>
  );
};

export default SubscribeDatasetButton;

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { PiRssBold } from "react-icons/pi";
// import { PiRssSimpleFill } from "react-icons/pi";
import ConfirmSubscription from './ConfirmSubscription';
import { createSubscription, deleteSubscription } from '../../../Redux/actions/user';
import { homeTheme } from '../../Home/theme';

const useStyles = makeStyles(() => ({
  wrapper: {
    display: 'inline-block',
  },
  subButton: {
    fontSize: '20px',
    color: 'grey',
    padding: 0,
    '&:hover': {
      color: '#69FFF2',
      background: 'transparent',
    },

  },
  subButtonActive: {
    fontSize: '20px',
    color: 'rgb(179, 247, 102)',
    padding: 0,
    '&:hover': {
      color: '#69FFF2',
      background: 'transparent',
    }
  },
}));

const SubscribeButton = (props) => {
  const { open, handleOpenClose, shortName, subscriptions, onSub } = props;

  const cl = useStyles();

  const isSubscribed = Boolean (subscriptions.find (({ Dataset_Name}) =>
    Dataset_Name === shortName))

  const subscribeClass = isSubscribed
        ? cl.subButtonActive
        : cl.subButton;

  const tooltipMessage = isSubscribed
        ? `You have subscribed to ${shortName} - click to unsubscribe`
        : 'Click to subscribe to dataset updates';

  return (
    <div className={cl.wrapper}>
      <ThemeProvider theme={homeTheme}>
        <ConfirmSubscription
          open={open}
          setOpen={handleOpenClose}
          name={shortName}
          subs={subscriptions}
          onSub={onSub}
        />
        <Tooltip title={tooltipMessage}>
          <Button
            className={subscribeClass}
            onClick={() => handleOpenClose (true)}
            disabled={!shortName}
          >
            <PiRssBold />
          </Button>
        </Tooltip>
      </ThemeProvider>
    </div>
  );
};


const SubscribeButtonStateWrapper = (props) => {
  const { shortName, onSubscribe } = props;

  const dispatch = useDispatch ();

  const [open, setOpen] = useState(false);

  const handleOpenClose = (targetState) => {
    setOpen (targetState);
  };

  const subscriptions = useSelector ((state) => state.userSubscriptions);

  // allow caller to define the onSubscribe action,
  // but have a default; for exapmle, calle could provide a noop
  let onSub;
  if (onSubscribe && typeof onSubscribe === 'function') {
    onSub = onSubscribe;
  } else {
    onSub = (name, subOrUnsub) => {
      const action = subOrUnsub
            ? createSubscription (name)
            : deleteSubscription ([name]);
      dispatch (action);
    }
  }

  return (<SubscribeButton
            open={open}
            handleOpenClose={handleOpenClose}
            shortName={shortName}
            subscriptions={subscriptions || []}
            onSub={onSub}
          />);

};


export default SubscribeButtonStateWrapper;

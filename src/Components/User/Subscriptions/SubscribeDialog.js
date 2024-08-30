/* This dialog implements the UI for subscribing/unsubscribing to
   email notifications for specific datasets.

   It is rendered once, and listens for message on redux to open.

   It is responsible for dispathing the api call and presenting results.

   A separate component is responsible for rendering the affordance (button)
   which occasions this dialog opening.

   Redux:
   state.subscribeDatasetDialog = {
     open: Bool
     shortName: String
   }
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from 'reselect';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Confirmation from '../../Common/Confirmation';
import initLogger from '../../../Services/log-service';
import states from '../../../enums/asyncRequestStates';
import { OverlaySpinner } from '../../UI/Spinner';

import {
  createSubscription,
  deleteSubscription
} from '../../../Redux/actions/user';

import {
  subscribeDatasetDialogClear,
} from '../../../Redux/actions/ui';

const log = initLogger('Components/User/Subscriptions/SubscribeButton')

const subscriptionsSelector = createSelector (
  [(state) => state.userSubscriptions],
  (subs) => {
    if (Array.isArray (subs)) {
      return subs;
    }
    return [];
  }
);

const actionInProgressSelector = createSelector (
  [
    (state) => state.userDeleteSubscriptionRequestStatus,
    (state) => state.userCreateSubscriptionRequestStatus
  ],
  (deleteStatus, createStatus) => {
    return [deleteStatus, createStatus].some (s => s === states.inProgress);
  }
);


const useStyles = makeStyles((theme) => ({}));

const SubscribeDatasetDialog = (props) => {
  const dispatch = useDispatch ();
  const cl = useStyles();

  const subscriptions = useSelector (subscriptionsSelector);
  const dialog = useSelector ((state) => state.subscribeDatasetDialog || {});
  const actionInProgress = useSelector (actionInProgressSelector);

  const isSubscribed = subscriptions.find ((sub) => {
    return sub.Dataset_Name === dialog.shortName
  });

  const handleClose = () => {
    dispatch (subscribeDatasetDialogClear ());
  }

  const onConfirm = () => {
    if (isSubscribed) {
      dispatch (deleteSubscription ([shortName]));
      dispatch (subscribeDatasetDialogClear ());
    } else {
      dispatch (createSubscription (shortName));
      dispatch (subscribeDatasetDialogClear ());
    }
  }

  const { shortName } = dialog;

  const name = isSubscribed
        ? 'Confirm Unsubscribe'
        : 'Confirm Subscribe';

  const text = isSubscribed
        ? `You are currently subscribed to receive email notifications for news related to the ${shortName} dataset. Click "Unsubscribe" to stop receiving email notifications for this dataset.`
        : `Click "Subscribe" to receive email notifications related to the ${shortName} dataset.`;

  const actionButtonText = isSubscribed
        ? 'Unsubscribe'
        : 'Subscribe';


  const confirmationProps = {
    open: Boolean (dialog.open),
    openClose: handleClose,
    loading: false,
    error: false,
    name,
    text,
    onConfirm,
    actionButtonText,
  };

  return (
    <div>
      {(!dialog.open && actionInProgress) && <OverlaySpinner message={'in progress'} />}
      <Confirmation {...confirmationProps} />
    </div>
  );
};

export default SubscribeDatasetDialog;

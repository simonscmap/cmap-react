// Chooser: User chooses between continuing to update an existing
// data submission in progress, or begin a new one

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { retrieveDataSubmissionsByUser } from '../../Redux/actions/dataSubmission';
import states from '../../enums/asyncRequestStates';
import {
  FileUploadArea,
  ChooseSubmissionType,
} from './ChooserComponents/index';

const useStyles = makeStyles((theme) => ({
  displayNone: {
    display: 'none',
  },
  optionCards: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
    alignItems: 'top',
    margin: '1em 0 2em 0',
  },
  optionCard: {
    minWidth: '300px',
    minHeight: '300px',
    padding: '1em',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  },
  chooser: {},
}));

const Chooser = (props) => {
  const { step, status, reset } = props;
  const classes = useStyles();

  const user = useSelector((state) => state.user);

  const userDataSubsRequestState = useSelector(
    (state) => state.retrieveUserDataSubmsissionsRequestStatus,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    // if request to get data subsmissions for user has not already been dispatched, do so
    if (user && userDataSubsRequestState === states.notTried) {
      dispatch(retrieveDataSubmissionsByUser());
    }
  }, [user]);

  // Return if not step 0

  if (step !== 0) {
    return '';
  }

  return (
    <div className={classes.chooser}>
      <ChooseSubmissionType />
      <FileUploadArea loadingStatus={status} reset={reset} />
    </div>
  );
};

export default Chooser;

// Choose Submission Type
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import states from '../../../enums/asyncRequestStates';

// fns
import { safePath } from '../../../Utility/objectUtils';

// action creators
import { retrieveDataSubmissionsByUser } from '../../../Redux/actions/dataSubmission';
import { setLoadingMessage } from '../../../Redux/actions/ui';
import { checkSubmissionOptionsAndStoreFile } from '../../../Redux/actions/dataSubmission';

const subIsNotComplete = (sub) => sub && sub.phaseId !== 6;

const useStyles = makeStyles ((theme) => ({
  formContent: {
    display: 'flex',
    flexDirection: 'row'
  },
}));

// UX --
// A binary radio group, which shows only when the user has active submissions,
// switching between Updating Existing or Creating New
// When "Update" is activ, a Select menu with existing submissions is available

// State --
// Provides the following to the parent Chooser
// • subType [ "new" "update" null ]
// • submissionId [ null, Int ]

// Reacts To --
// • whether user has active submissions

const TypeChooser = (props) => {
  const { subId, subType, setSubId, setSubType } = props;
  const cl = useStyles ();
  // pull in global state
  const user = useSelector ((state) => state.user);
  const submsInProgress = useSelector((state) =>
    (state.dataSubmissions || [])
      .filter (subIsNotComplete));
  const userDataSubsRequestState = useSelector((state) =>
    (state.retrieveUserDataSubmsissionsRequestStatus));

  // make request for user subs, if not already in flight
  const dispatch = useDispatch();
  useEffect(() => {
    // if request to get data subsmissions for user has not already been dispatched, do so
    if (user && userDataSubsRequestState === states.notTried) {
      dispatch (retrieveDataSubmissionsByUser());
    }
  }, [user]);

  useEffect(() => {
    if (subId === null && submsInProgress.length > 0) {
      // set default
      setSubId (submsInProgress[0].Submission_ID);
    }
  }, [submsInProgress, subId]);

  const handleSetId = (e) => {
    const id = e.target.value;
    console.log (`setting submission id`, e.target.value);
    setSubId (id);
  }

  const handleSetType = (e) => {
    const t = e.target.value;
    setSubType (t);
  }

  // don't render if no updates to choose from
  if (userDataSubsRequestState === states.succeeded && submsInProgress.length === 0) {
    return '';
  }

  return (
    <div className={cl.typeChooserWrapper}>
      <Typography variant={"h5"}>Choose a submission type</Typography>
      <div className={cl.formContent}>
        <div className={cl.radioWrapper}>
          <FormControl component="fieldset">
            <RadioGroup name="submission-type" value={subType} onChange={handleSetType}>
              <FormControlLabel
                value={"new"}
                control={<Radio />}
                label={"Create New Submission"}
              />
              <FormControlLabel
                value={"update"}
                control={<Radio />}
                label={"Update a Submission In Progress"}
              />
             </RadioGroup>
           </FormControl>
        </div>
        {(subType === "update") &&
          <div className={cl.selectWrapper}>
            <FormControl>
              <Typography variant={"body1"}>Active Submission to Update:</Typography>
             {/* default to empty string to match the placeholder option value */}
              <Select value={subId || ''} onChange={handleSetId}>
                {submsInProgress.map ((sub, i) => {
                  return (
                    <option
                      value={sub.Submission_ID}
                      key={`select-option-${i}`}
                    >
                      {sub.Dataset}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
            </div>
        }
      </div>
    </div>
  );
};

export default TypeChooser;

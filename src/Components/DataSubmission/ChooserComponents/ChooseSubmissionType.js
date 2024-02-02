// Choose Submission Type
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  Typography,
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import states from '../../../enums/asyncRequestStates';

// fns
import { safePath } from '../../../Utility/objectUtils';

// action creators
import {
  retrieveDataSubmissionsByUser,
  setSubmissionId,
  setSubmissionType
} from '../../../Redux/actions/dataSubmission';
import { snackbarOpen } from '../../../Redux/actions/ui';

const subIsNotComplete = (sub) => sub && sub.phaseId !== 6;

const useStyles = makeStyles ((theme) => ({
  typeChooserWrapper: {
    color: 'white',
    '& > h5': {
      marginBottom: '1em'
    }
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
    '& > div': {
    }
  },
  selectWrapper: {
    // border: `1px solid ${theme.palette.primary.light}`,
    marginLeft: '35px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    padding: '.25em 1em',
    gap: '1em',
    width: '300px',
    '& > p': {
      margin: 0,
    },
    '& .MuiFilledInput-input': {
      padding: '10px 5px 10px 15px',
    },
    '& .MuiSelect-icon': {
      color: theme.palette.secondary.light,
    },
    '& .MuiFilledInput-root': {
      background: 'rgba(0,0,0,0.1)',
      borderRadius: '5px'
    },
  },
  selectFormControl: {
    '& .MuiFilledInput-underline::before': {
      borderBottom: 0,
    }
  },
  overrides: createStyles({
  })
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
  const cl = useStyles ();

  // pull in global state
  const subId = useSelector ((state) => state.submissionToUpdate);
  const subType = useSelector ((state) => state.submissionType);

  const user = useSelector ((state) => state.user);

  const submsInProgress = useSelector((state) =>
    (state.dataSubmissions || [])
      .filter (subIsNotComplete));

  const userDataSubsRequestState = useSelector((state) =>
    (state.retrieveUserDataSubmsissionsRequestStatus));

  // handlers

  const setSubType = (t) => dispatch (setSubmissionType (t));
  const setSubId = (id) => dispatch (setSubmissionId (id));

  // make request for user subs, if not already in flight
  const dispatch = useDispatch();
  useEffect(() => {
    // if request to get data subsmissions for user has not already been dispatched, do so
    if (user && userDataSubsRequestState === states.notTried) {
      dispatch (retrieveDataSubmissionsByUser());
    }
  }, [user]);

  // set default submission to first in array
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
    dispatch (snackbarOpen (`Selected submission ${id}`));
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
      <Typography variant={"h5"}>Upload Workbook</Typography>
      <div className={cl.formContent}>
        <div className={cl.radioWrapper}>
          <FormControl component="fieldset">
            <RadioGroup name="submission-type" value={subType} onChange={handleSetType}>
              <FormControlLabel
                value={"new"}
                control={<Radio />}
                label={"Create a new submission"}
              />
              <FormControlLabel
                value={"update"}
                control={<Radio />}
                label={"Update a submission already in progress"}
              />
            </RadioGroup>
          </FormControl>
          {(subType === "update") &&
           <div className={cl.selectWrapper}>
             <Typography variant={"body1"}>Pick Submission to Update:</Typography>
             <FormControl variant="filled" className={cl.selectFormControl}>
               {/* default to empty string to match the placeholder option value */}
               <Select
                 value={subId || ''}
                 onChange={handleSetId}
                 className={cl.selectMenu}
                 MenuProps={{
                   classes: {

                   }
                 }}
               > <option value={-1} disabled>Select Submission</option>
                 {submsInProgress.map ((sub, i) => {
                   return (
                     <option
                       value={sub.Submission_ID}
                       key={`select-option-${i}`}
                     >
                       {`${sub.Dataset} (id: ${sub.Submission_ID})`}
                     </option>
                   );
                 })}
               </Select>
             </FormControl>
           </div>
          }
        </div>

      </div>
    </div>
  );
};

export default TypeChooser;

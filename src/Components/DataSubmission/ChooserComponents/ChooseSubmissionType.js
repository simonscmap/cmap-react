// Choose Submission Type
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

// action creators
import { setSubmissionType } from '../../../Redux/actions/dataSubmission';
import SubmissionSelect from './SubmissionSelect';

const useStyles = makeStyles((theme) => ({
  typeChooserWrapper: {
    color: 'white',
    '& > h5': {
      marginBottom: '1em',
    },
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
    '& > div': {},
  },
  selectWrapper: {
    // border: `1px solid ${theme.palette.primary.light}`,
    marginLeft: '35px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    padding: '.25em 1em',
    gap: '1em',
    // width: '300px',
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
      borderRadius: '5px',
    },
  },
  selectFormControl: {
    '& .MuiFilledInput-underline::before': {
      borderBottom: 0,
    },
  },
  overrides: createStyles({}),
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
  const cl = useStyles();

  // pull in global state
  const subType = useSelector((state) => state.submissionType);

  // handlers
  const dispatch = useDispatch();
  const setSubType = (t) => dispatch(setSubmissionType(t));

  const handleSetType = (e) => {
    const t = e.target.value;
    setSubType(t);
  };

  return (
    <div className={cl.typeChooserWrapper}>
      <Typography variant={'h5'}>Upload Workbook</Typography>
      <div className={cl.formContent}>
        <div className={cl.radioWrapper}>
          <FormControl component="fieldset">
            <RadioGroup
              name="submission-type"
              value={subType}
              onChange={handleSetType}
            >
              <FormControlLabel
                value={'new'}
                control={<Radio />}
                label={'Create a new submission'}
              />
              <FormControlLabel
                value={'update'}
                control={<Radio />}
                label={'Update a submission already in progress'}
              />
            </RadioGroup>
          </FormControl>
          {subType === 'update' && (
            <div className={cl.selectWrapper}>
              <Typography variant={'body1'}>
                Pick Submission to Update:
              </Typography>
              <SubmissionSelect />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypeChooser;

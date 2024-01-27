// Chooser: User chooses between continuing to update an existing
// data submission in progress, or begin a new one

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Typography,
  Paper,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  List, ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
// import messages from './Messages';
import { makeStyles } from '@material-ui/core/styles';
import { retrieveDataSubmissionsByUser } from '../../Redux/actions/dataSubmission';


const useStyles = makeStyles ((theme) => ({
  displayNone: {
    display: 'none',
  },
}));

const Chooser = (props) => {
  const { step, handleFileSelect } = props;
  const classes = useStyles();

  const submsInProgress = useSelector((state) =>
    (state.dataSubmissions || []).filter ((s) => Boolean(s)));

  const user = useSelector ((state) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (user && Array.isArray(submsInProgress)) {
      // HERE
    }
  }, [user]);

  let [subType, setSubType] = useState('new');
  let [submissionId, setSubId] = useState(null);

  const handleChange = (e) => {
    console.log ('handleChange e', e);
    setSubType ('resubmit');
    setSubId (e.target.value);
  };

  const handleDrop = (e) => {
    console.log ('file dropped; processing');
    e.preventDefault();
    const file = e.dataTransfer.items[0].getAsFile();
    handleFileSelect (file);
  };

  console.log ('step + subs', step, submsInProgress);

  if (step !== 0) {
    return '';
  }

  return (
    <Paper elevation={2}>

    {(submsInProgress && submsInProgress.length) &&
     <React.Fragment>
      <Typography variant={"h3"}>Choose Submission Type</Typography>
      <FormControl component="fieldset">
      <FormLabel component="legend">
        Continue with a submission in progress
      </FormLabel>
      <RadioGroup
        name="submissionId"
        value={submissionId}
        onChange={handleChange}>
        {submsInProgress.map ((s) => {
          console.log('submission', s)
          return (
            <FormControlLabel
            value={s.Submission_ID}
            control={<Radio />}
            label={s.Dataset_Name}
            />
          );
         })}
        </RadioGroup>
       </FormControl>
      </React.Fragment>
    }

    <input
      onChange={handleFileSelect}
      className={classes.displayNone}
      accept=".xlsx"
      id="select-file-input"
      type="file"
      />
    </Paper>
  );
};

export default Chooser;

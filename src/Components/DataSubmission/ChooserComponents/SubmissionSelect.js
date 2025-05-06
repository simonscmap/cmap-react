import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Radio from '@material-ui/core/Radio';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { useSelector, useDispatch } from 'react-redux';

import states from '../../../enums/asyncRequestStates';

// action creators
import {
  retrieveDataSubmissionsByUser,
  setSubmissionId,
} from '../../../Redux/actions/dataSubmission';

// util
const subIsNotComplete = (sub) => sub && sub.phaseId !== 6;

// style
const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

const useTableStyles = makeStyles({
  root: {
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgb(5, 27, 54)',
    },
  },
  container: {
    maxHeight: 440,
  },
});

// components

function Row(props) {
  const { submission, selectedValue, handleSelect } = props;
  const classes = useRowStyles();

  const lastUpdatedDate =
    submission.QC1_Completion_Date_Time ||
    submission.QC2_Completion_Date_Time ||
    submission.DOI_Accepted_Date_Time ||
    'NA';

  // Note: the Submission_ID is stored in the database, and in redux, as an Integer
  // Radio values are cast to string, so a conversion is made from string to integer
  // upon selection
  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell padding="checkbox">
          <Radio
            checked={
              selectedValue && selectedValue === submission.Submission_ID
            }
            onChange={handleSelect}
            value={submission.Submission_ID}
            name="radio-button"
            inputProps={{ 'aria-label': submission.Dataset }}
          />
        </TableCell>
        <TableCell>{submission.Dataset}</TableCell>
        <TableCell>{submission.Dataset_Long_Name}</TableCell>
        <TableCell>{submission.Phase}</TableCell>
        <TableCell>{submission.Start_Date_Time}</TableCell>
        <TableCell>{lastUpdatedDate}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const SubmissionSelect = () => {
  const subId = useSelector((state) => state.submissionToUpdate);
  const user = useSelector((state) => state.user);

  const submsInProgress = useSelector((state) =>
    (state.dataSubmissions || []).filter(subIsNotComplete),
  );

  const cl = useTableStyles();

  const userDataSubsRequestState = useSelector(
    (state) => state.retrieveUserDataSubmsissionsRequestStatus,
  );

  // make request for user subs, if not already in flight
  const dispatch = useDispatch();

  const setSubId = (id) => dispatch(setSubmissionId(id));

  useEffect(() => {
    // if request to get data subsmissions for user has not already been dispatched, do so
    if (user && userDataSubsRequestState === states.notTried) {
      dispatch(retrieveDataSubmissionsByUser());
    }
  }, [user]);

  // set default submission to first in array
  useEffect(() => {
    if (subId === null && submsInProgress.length > 0) {
      // set default
      setSubId(submsInProgress[0].Submission_ID);
    }
  }, [submsInProgress, subId]);

  const handleSelect = (event) => {
    try {
      // radio values are always dispatched as strings,
      // and must be converted back to integer here to keep the correct type
      const val = parseInt(event.target.value, 10);
      setSubId(val);
    } catch (e) {
      console.log('unable to set submission id', e);
    }
  };

  if (userDataSubsRequestState === states.failed) {
    return (
      <Typography variant="body1">
        Failed to retrieve list of active submissions. Please refresh the page.
      </Typography>
    );
  }

  if (userDataSubsRequestState === states.inProgress) {
    return (
      <Typography variant="body1">
        Fetching list of active submissions...
      </Typography>
    );
  }

  if (
    userDataSubsRequestState === states.succeeded &&
    Array.isArray(submsInProgress) &&
    submsInProgress.length === 0
  ) {
    return <Typography variant="body1">No active submissions.</Typography>;
  }

  return (
    <TableContainer component={Paper} className={cl.container}>
      <Table aria-label="collapsible table" stickyHeader className={cl.root}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>File Name</TableCell>
            <TableCell>Long Name</TableCell>
            <TableCell>Phase</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Modified Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submsInProgress.map((s) => (
            <Row
              key={s.Dataset}
              submission={s}
              handleSelect={handleSelect}
              selectedValue={subId}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SubmissionSelect;

import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles ((theme) => ({
  container: {
    color: 'white',
    '& p': {
      margin: 0,
    }
  },
  errorOverview: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '1em',
    alignItems: 'center',
    '& span': {
      display: 'inline-block',
      width: '200px',
    },
    '& p': {
      margin: 0,
    }
  },
  pre: {
    fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    color: theme.palette.primary.main,
  }
}));

const Label = (props) => {
  const cl = useStyles();
  const subType = useSelector ((state) => state.submissionType);
  const subToUpdate = useSelector ((state) => {
    if (state.submissionType === 'update' && state.submissionToUpdate) {
      const s = state.dataSubmissions
                     .find ((sub) => sub.Submission_ID === state.submissionToUpdate);
      if (s) {
        return s;
      } else {
        return null;
      }
    }
  });

  if (subType === 'new') {
    return (
      <div className={cl.container}>
        <Typography variant="h6">Creating New Submission</Typography>
      </div>
    );
  }

  if (subType === 'update' && subToUpdate) {
    return (
      <div className={cl.container}>
        <Typography variant="h6">Updating Submission</Typography>
        <Typography variant="body1" className={cl.pre}>{subToUpdate.Dataset_Long_Name}</Typography>
      </div>
    );
  }

  return '';
};

export default Label;

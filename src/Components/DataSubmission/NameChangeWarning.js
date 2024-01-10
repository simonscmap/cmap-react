import React from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ErrorOutline } from '@material-ui/icons';

const useStyles = makeStyles ((theme) => ({
  changeSummaryHeader: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationColor: theme.palette.secondary.main,
  },
  title: {
    color: 'white',
  },
  nameChangeWarning: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  warningIcon: {
    color: 'rgb(255, 255, 0)',
    margin: '0 2px -5px 0',
    fontSize: '1.4em',
  },
  bright: {
    color: '#69FFF2',
  },
}));

const ShortNameWarning = (props) => {
  const cl = useStyles();
  const { data } = props;
  return (
    <Typography variant="body1" className={cl.title}>
      <ErrorOutline className={cl.warningIcon} />{' '}
      Short Name will change from <span className={cl.bright}>{data.originalShortName}</span> to <span className={cl.bright}>{data.shortName}</span>.
    </Typography>
  )
};

const LongNameWarning = (props) => {
  const cl = useStyles();
  const { data } = props;
  return (
    <Typography variant="body1" className={cl.title}>
      <ErrorOutline className={cl.warningIcon} />{' '}
      Long Name will change from {' '}
      <span className={cl.bright}>{data.originalLongName}</span> to {' '}
      <span className={cl.bright}>{data.longName}</span>.
    </Typography>
  )
};

export const useNameChangeWarning = () => {
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

  const isUpdate = Boolean(subToUpdate);

  const nameCheckResult = useSelector ((state) => state.checkSubmissionNameResult);
  const nameCheckStatus = useSelector ((state) => state.checkSubmissionNameRequestStatus);
  const nameCheckRespText = useSelector ((state) => state.checkSubmissionNameResponseText);


  const isShortNameChange = isUpdate && nameCheckResult
                         && !nameCheckResult.shortNameIsAlreadyInUse
                         && !nameCheckResult.shortNameUpdateConflict
                         && nameCheckResult.shortName !== nameCheckResult.originalShortName;

  const isLongNameChange = isUpdate && nameCheckResult
                        && !nameCheckResult.longNameIsAlreadyInUse
                        && !nameCheckResult.longNameUpdateConflict
                        && nameCheckResult.longName !== nameCheckResult.originalLongName;

  return {
    isShortNameChange,
    isLongNameChange,
    nameCheckResult,
    nameCheckStatus,
    nameCheckRespText,
  };
}

const NameChangeWarnings = () => {
  const classes = useStyles();
  const {
    isShortNameChange,
    isLongNameChange,
    nameCheckResult,
  } = useNameChangeWarning ();

  return (
    <div className={classes.nameChangeWarning}>
      {(isShortNameChange || isLongNameChange) && (
        <Typography className={classes.changeSummaryHeader}>
        Name Changes
        </Typography>
      )}
      {isShortNameChange && <ShortNameWarning data={nameCheckResult} />}
      {isLongNameChange && <LongNameWarning data={nameCheckResult} />}
    </div>
  );
};

export default NameChangeWarnings;

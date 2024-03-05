import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ErrorOutline,
} from '@material-ui/icons';
import { Typography, Link } from '@material-ui/core';
import styles from './ValidationToolStyles';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (styles);

const useHeaderStyles = makeStyles ((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2em',
    alignItems: 'baseline',
  },
  pre: {
    fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    color: theme.palette.primary.main,
    fontSize: '32px',
    fontWeight: 100
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
  title: {
    color: 'white',
  }
}));

const ShortNameWarning = (props) => {
  const cl = useHeaderStyles();
  const { data } = props;
  return (
    <Typography variant="body1" className={cl.title}>
      <ErrorOutline className={cl.warningIcon} />{' '}
      Short Name will change from <span className={cl.bright}>{data.originalShortName}</span> to <span className={cl.bright}>{data.shortName}</span>.
    </Typography>
  )
};

const LongNameWarning = (props) => {
  const cl = useHeaderStyles();
  const { data } = props;
  return (
    <Typography variant="body1" className={cl.title}>
      <ErrorOutline className={cl.warningIcon} />{' '}
    Short Name will change from {' '}
    <span className={cl.bright}>{data.originalLongName}</span> to {' '}
    <span className={cl.bright}>{data.longName}</span>.
    </Typography>
  )
};

const Header = () => {
  const classes = useStyles();
  const cl = useHeaderStyles();

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

  const isUpdate = Boolean(subToUpdate);

  const nameCheckResult = useSelector ((state) => state.checkSubmissionNameResult);

  const isShortNameChange = isUpdate && nameCheckResult
                         && !nameCheckResult.shortNameIsAlreadyInUse
                         && !nameCheckResult.shortNameUpdateConflict
                         && nameCheckResult.shortName !== nameCheckResult.originalShortName;

  const isLongNameChange = isUpdate && nameCheckResult
                        && !nameCheckResult.longNameIsAlreadyInUse
                        && !nameCheckResult.longNameUpdateConflict
                        && nameCheckResult.longName !== nameCheckResult.originalLongName;

  const headerText = subType === 'new' ? 'Begin New Data Submission' : 'Update Submission:'

  return (
    <React.Fragment>
      <div className={cl.container}>
        <Typography variant="h1" className={classes.title}>
         {headerText}
        </Typography>
        {(subType === 'update' && subToUpdate) && (
          <Typography variant="h1" className={cl.pre}>
            {subToUpdate.Dataset_Long_Name}
          </Typography>
        )}
      </div>

      <div className={cl.nameChangeWarning}>
        {isShortNameChange && <ShortNameWarning data={nameCheckResult} />}
        {isLongNameChange && <LongNameWarning data={nameCheckResult} />}
      </div>


      <Typography className={classes.needHelp}>
        Need help?
        <Link
          href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
          download="datasetTemplate.xlsx"
          className={classes.needHelpLink}
        >
          &nbsp;Download
        </Link>
        &nbsp;a blank template, or view the{' '}
        <Link
          className={classes.needHelpLink}
            component={RouterLink}
            to="/datasubmission/guide"
         >
           Data Submission Guide
         </Link>
         .
       </Typography>
     </React.Fragment>
  );
};

export default Header;

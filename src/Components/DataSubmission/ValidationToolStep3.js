import React from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

import { makeStyles } from '@material-ui/core/styles';
import { ErrorOutline } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { validationSteps } from './ValidationToolConstants';

import NameChangeWarnings from './NameChangeWarning';
import { StepButton } from './ChooserComponents/Buttons';
import states from '../../enums/asyncRequestStates';
import Spinner from '../UI/Spinner';
import SubscribeNews from '../User/Subscriptions/SubscribeNews';
import ChangeTable from './ChangeTable';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    color: 'white',
    '& h5': {
      marginBottom: '1em',
    },
  },
  fileSelectPaper: {
    padding: '12px',
    whiteSpace: 'pre-wrap',
    '& button': {
      color: 'black',
    },
  },
  submittedTypography: {
    marginBottom: '12px',
  },
  needHelpLink: {
    letterSpacing: 'normal',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  submitButton: {
    color: 'white',
    margin: '2em 0',
    textTransform: 'uppercase',
    '&:disabled': {
      color: '#ffffff7d',
      border: `2px solid ${theme.palette.secondary.dark}`,
    },
  },
  title: {
    color: 'white',
  },
  pre: {
    fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    color: theme.palette.primary.main,
    fontSize: '32px',
    fontWeight: 100,
  },

  warningIcon: {
    color: 'rgb(255, 255, 0)',
    margin: '0 2px -5px 0',
    fontSize: '1.4em',
  },
  bright: {
    color: '#69FFF2',
  },
  spinnerContainer: {
    height: '400px',
    textAlign: 'center',
  },
}));

const Step3 = (props) => {
  const {
    dataChanges,
    getChangeLog,
    handleDownloadWorkbook,
    handleUploadSubmission,
    resetState,
    validationStep,
  } = props;
  const classes = useStyles();

  const userIsOnLastStep = Boolean(
    validationStep === validationSteps.length - 1,
  );

  const submissionUploadState = useSelector(
    (state) => state.submissionUploadState,
  );

  const auditReport = useSelector((state) => state.auditReport);

  const lastSuccessfulSub = useSelector(
    (state) => state.lastSuccessfulSubmission,
  );

  const noErrors = auditReport && auditReport.errorCount.sum === 0;

  const isNewsSubscribed = useSelector(
    (state) => state.user && state.user.isNewsSubscribed,
  );

  if (!userIsOnLastStep) {
    return '';
  }

  if (states.inProgress === submissionUploadState) {
    return (
      <div className={classes.wrapper}>
        <Typography variant={'h5'}>Upload Submission</Typography>
        <div className={classes.spinnerContainer}>
          <Spinner message={'Uploading'} />
        </div>
      </div>
    );
  }

  if (states.succeeded === submissionUploadState) {
    return (
      <div className={classes.wrapper}>
        <Typography className={classes.submittedTypography}>
          Your dataset has been successfully submitted, and will be reviewed by
          our data curation team.
        </Typography>

        <Typography className={classes.submittedTypography}>
          You can view the status of your submission{' '}
          <Link
            style={{ display: 'inline-block' }}
            className={classes.needHelpLink}
            component={RouterLink}
            to={`/datasubmission/userdashboard?datasetName=${encodeURI(
              lastSuccessfulSub,
            )}`}
          >
            here.
          </Link>
        </Typography>

        <Typography className={classes.submittedTypography}>
          A detailed description of remaining steps in the submission process
          can be found in the{' '}
          <Link
            style={{ display: 'inline-block' }}
            className={classes.needHelpLink}
            component={RouterLink}
            to="/datasubmission/guide"
          >
            Data Submission Guide
          </Link>
          .
        </Typography>

        <Typography className={classes.submittedTypography}>
          To start over and submit another dataset{' '}
          <Link
            style={{ display: 'inline-block' }}
            className={classes.needHelpLink}
            onClick={() => resetState(true, 'submit: start over')}
            component="span"
          >
            {'return to the start'}
          </Link>
          .
        </Typography>

        {!isNewsSubscribed && (
          <React.Fragment>
            <Typography className={classes.submittedTypography}>
              Please consider subscribing to receive email notifications
              whenever Simons CMAP news is published:
            </Typography>
            <SubscribeNews />
          </React.Fragment>
        )}
      </div>
    );
  }

  if (states.failed === submissionUploadState) {
    return (
      <div className={classes.wrapper}>
        <Typography variant={'h5'}>Upload Submission</Typography>
        <List>
          <ListItem>
            <ListItemIcon style={{ color: 'rgba(255, 0, 0, .7)' }}>
              <ErrorOutline />
            </ListItemIcon>
            <ListItemText primary="There was an error when attempting to submit your dataset. A message has already been sent to the CMAP team. You can contact us at cmap-data-submission@uw.edu." />
            <Typography className={classes.submittedTypography}>
              To start over and submit another dataset click{' '}
              <Link
                style={{ display: 'inline-block' }}
                className={classes.needHelpLink}
                onClick={() => resetState(true, 'submit failed: start over')}
                component="span"
              >
                here
              </Link>
              .
            </Typography>
          </ListItem>
        </List>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Typography variant={'h5'}>Upload Submission</Typography>

      {noErrors ? (
        <>
          <Typography>Validation is complete!</Typography>
          <Typography>
            Click the button below to upload your workbook.
          </Typography>
        </>
      ) : (
        <Typography>
          There are still validation errors in previous steps. Please address
          these errors before submitting the dataset.
        </Typography>
      )}

      <NameChangeWarnings />

      <ChangeTable
        getChangeLog={getChangeLog}
        handleDownloadWorkbook={handleDownloadWorkbook}
        dataChanges={dataChanges}
      />

      <StepButton
        size="small"
        variant="contained"
        color="primary"
        className={classes.submitButton}
        onClick={handleUploadSubmission}
        disabled={!noErrors}
      >
        {'Submit Dataset'}
      </StepButton>
    </div>
  );
};

export default Step3;

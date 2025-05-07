import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import {
  TextField,
  Button,
  Typography,
  Link,
  Step,
  StepLabel,
  Stepper,
} from '@material-ui/core';

import {
  retrieveSubmissionCommentHistory,
  addSubmissionComment,
  downloadMostRecentFile,
} from '../../Redux/actions/dataSubmission';

import Comment from './Comment';

import states from '../../enums/asyncRequestStates';

const useStyles = makeStyles((theme) => ({
  newCommentDiv: {
    margin: '24px auto 0px auto',
  },
  newCommentTextField: {
    flexBasis: 'calc(70vw - 200px)',
    marginRight: '16px',
  },
  postButton: {
    color: 'white',
    marginTop: '16px',
    textTransform: 'none',
  },
  setPhaseButton: {
    color: 'white',
    marginLeft: '12px',
  },
  newUpload: {
    marginLeft: '2vw',
    cursor: 'pointer',
  },
  labelTimeStamp: {
    opacity: 0.9,
    fontSize: '11px',
    display: 'block',
  },
  guideStepper: {
    '& .MuiStep-root .MuiSvgIcon-root': {
      color: '#9dd162',
    },
  },
}));

const mapStateToProps = (state, ownProps) => ({
  submissionCommentHistoryRetrievalState:
    state.submissionCommentHistoryRetrievalState,
  submissionComments: state.submissionComments,
});

const mapDispatchToProps = {
  retrieveSubmissionCommentHistory,
  addSubmissionComment,
  downloadMostRecentFile,
};

const steps = [
  {
    label: 'Submission',
    timeStampKey: 'Start_Date_Time',
  },

  {
    label: 'Admin Review and Feedback',
    timeStampKey: 'QC1_Completion_Date_Time',
  },

  {
    label: 'Secondary Admin Review',
    timeStampKey: 'QC2_Completion_Date_Time',
  },

  {
    label: 'DOI',
    timeStampKey: 'DOI_Accepted_Date_Time',
  },

  {
    label: 'Ingestion',
    timeStampKey: 'Ingestion_Date_Time',
  },
];

const getActiveStepFromPhase = (phase) => {
  switch (phase) {
    case 'Awaiting admin action':
      return 1;
    case 'Awaiting user update':
      return 1;
    case 'Awaiting QC2':
      return 2;
    case 'Awaiting DOI':
      return 3;
    case 'Awaiting ingestion':
      return 4;
    case 'Complete':
      return 6;
    default:
      return 1;
  }
};

// Stepper used in Guide (TODO put these in sync)
export const UserDashboardStepper = (props) => {
  const { activeStep, submission } = props;
  return (
    <Stepper
      style={{ borderRadius: '5px' }}
      alternativeLabel
      activeStep={activeStep}
    >
      {steps.map((item, i) => {
        return (
          <Step key={i}>
            <StepLabel>
              {item.label}
              <span
                style={{ opacity: 0.9, fontSize: '11px', display: 'block' }}
              >
                {submission[item.timeStampKey] && activeStep > i
                  ? submission[item.timeStampKey].slice(0, 10)
                  : ''}
              </span>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

// Stepper used in User Dashboard
export const GuideStepper = (props) => {
  const steps = [
    'Pre-submission Validation',
    'Submission',
    'Admin Review & Feedback',
    'DOI',
    'Ingestion',
  ];

  const { activeStep, submission } = props;
  const cl = useStyles();
  return (
    <Stepper
      className={cl.guideStepper}
      style={{ borderRadius: '5px' }}
      alternativeLabel
      nonLinear
      activeStep={activeStep}
    >
      {steps.map((item, i) => {
        return (
          <Step key={i}>
            <StepLabel>{item}</StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};

export const UserDashboardPanelDetails = (props) => {
  const { submission, submissionComments } = props;
  const classes = useStyles();

  const [comment, setComment] = React.useState();

  let comments = submissionComments[submission.Submission_ID];
  let renderComments = Boolean(comments && comments.length);

  const activeStep = getActiveStepFromPhase(submission.Phase);

  useEffect(() => {
    props.retrieveSubmissionCommentHistory(submission.Submission_ID);
  }, []);

  // control this input from redux so we can reset properly
  // also create connected "NewComment" component
  const handlePostComment = () => {
    props.addSubmissionComment(submission.Submission_ID, comment, 'user');
    setComment('');
  };

  return (
    <div>
      <UserDashboardStepper activeStep={activeStep} submission={submission} />

      {/* Disallow updates from completed submissions. */}
      {activeStep !== 6 && (
        <Typography className={classes.newUpload}>
          <Link
            component={RouterLink}
            to={`/datasubmission/submission-portal?submissionID=${encodeURIComponent(
              submission.Submission_ID,
            )}`}
          >
            Update
          </Link>{' '}
          {'this submission.'}
        </Typography>
      )}

      <Typography className={classes.newUpload}>
        <Link
          component="span"
          onClick={() => props.downloadMostRecentFile(submission.Submission_ID)}
        >
          Download
        </Link>{' '}
        the most recent version of this submission.
      </Typography>

      {props.submissionCommentHistoryRetrievalState === states.inProgress ? (
        'Loading Comments.....'
      ) : (
        <React.Fragment>
          {renderComments &&
            comments.map((e, i) => <Comment comment={e} key={i} />)}
        </React.Fragment>
      )}
      <div className={classes.newCommentDiv}>
        <TextField
          multiline
          minRows={4}
          variant="outlined"
          onChange={(e) => setComment(e.target.value)}
          value={comment}
          fullWidth
        />

        <Button
          variant="contained"
          color="primary"
          className={classes.postButton}
          onClick={handlePostComment}
        >
          Post Message
        </Button>
      </div>
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserDashboardPanelDetails);

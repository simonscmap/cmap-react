// Individual data submission.

import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import {
  FormHelperText,
  AccordionDetails,
  TextField,
  Button,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  Link,
} from '@material-ui/core';

import {
  retrieveSubmissionCommentHistory,
  addSubmissionComment,
  setSubmissionPhase,
  downloadMostRecentFile,
} from '../../Redux/actions/dataSubmission';

import Comment from './Comment';

import states from '../../enums/asyncRequestStates';

const styles = (theme) => ({
  panelDetails: {
    display: 'block',
  },

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
    textTransform: 'none',
    '&.MuiButtonBase-root.Mui-disabled': {
      pointerEvents: 'auto',
    },
  },

  deleteButton: {
    display: 'block',
    textTransform: 'none',
    color: 'white',
    marginTop: '28px',
  },

  phaseControlWrapper: {
    textAlign: 'left',
    margin: '12px 0 32px 0',
  },

  phaseSelect: {
    width: '190px',
  },

  newUpload: {
    marginBottom: '2vw',
    cursor: 'pointer',
    textAlign: 'left',
  },

  helperText: {
    color: 'rgba(255, 255, 255, .6)',
    marginTop: '-1px !important',
  },
});

const mapStateToProps = (state, ownProps) => ({
  submissionCommentHistoryRetrievalState:
    state.submissionCommentHistoryRetrievalState,
  submissionComments: state.submissionComments,
});

const mapDispatchToProps = {
  retrieveSubmissionCommentHistory,
  addSubmissionComment,
  setSubmissionPhase,
  downloadMostRecentFile,
};

const toEnum = (phaseId) => {
  switch (phaseId) {
    case 2:
      return 'Awaiting admin action';
    case 3:
      return 'Awaiting user update';
    case 4:
      return 'Awaiting DOI';
    case 5:
      return 'Awaiting ingestion';
    case 6:
      return 'Complete';
    case 7:
      return 'Awaiting QC2';
    default:
      return `Unknown phase "${phaseId}"`;
  }
};

const AdminDashboardPanelDetails = (props) => {
  const { classes, submission, setSubmissionPhase: dispatchSetPhase } = props;
  const { Phase_ID: phaseId } = submission;

  const [comment, setComment] = React.useState();
  const [selectedPhase, selectPhase] = React.useState(submission.Phase_ID);

  let comments = props.submissionComments[submission.Submission_ID];
  let renderComments = Boolean(comments && comments.length);

  useEffect(() => {
    props.retrieveSubmissionCommentHistory(submission.Submission_ID);
  }, []);

  const handlePostComment = () => {
    props.addSubmissionComment(submission.Submission_ID, comment, 'admin');
    setComment('');
  };

  const updatePhaseSelection = (e) => {
    selectPhase(e.target.value);
  };

  const handleChangePhase = () => {
    dispatchSetPhase(submission.Submission_ID, selectedPhase);
  };

  const tooltipContent =
    phaseId === 6
      ? 'Cannot update a completed submission.'
      : phaseId === selectedPhase
        ? `Submission phase is already ${phaseId}: "${toEnum(phaseId)}"`
        : `Set Phase to ${selectedPhase}: "${toEnum(selectedPhase)}"`;

  return (
    <AccordionDetails className={classes.panelDetails}>
      <Typography className={classes.newUpload}>
        <Link
          component="span"
          onClick={() => props.downloadMostRecentFile(submission.Submission_ID)}
        >
          Download
        </Link>{' '}
        the most recent version.
      </Typography>

      <div className={classes.phaseControlWrapper}>
        <Select
          value={selectedPhase}
          onChange={updatePhaseSelection}
          className={classes.phaseSelect}
        >
          <MenuItem value={2}>Awaiting admin action</MenuItem>
          <MenuItem value={3}>Awaiting user update</MenuItem>
          <MenuItem value={7}>Awaiting QC2</MenuItem>
          <MenuItem value={4}>Awaiting DOI</MenuItem>
          <MenuItem value={5}>Awaiting ingestion</MenuItem>
          <MenuItem value={6}>Complete</MenuItem>
        </Select>

        <Tooltip title={tooltipContent}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePhase}
            className={classes.setPhaseButton}
            disabled={selectedPhase === phaseId || phaseId === 6}
          >
            Set Phase
          </Button>
        </Tooltip>

        <FormHelperText className={classes.helperText}>
          Update Submission Phase
        </FormHelperText>
      </div>

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
          rows={4}
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
    </AccordionDetails>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(AdminDashboardPanelDetails));

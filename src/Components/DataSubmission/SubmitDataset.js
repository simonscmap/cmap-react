import React from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Paper,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { makeStyles } from '@material-ui/core/styles';
import { ErrorOutline } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { getChangeSummary } from './Helpers/changeLog';
import {
  validationSteps,
} from './ValidationToolConstants';

import NameChangeWarnings from './NameChangeWarning';
import { StepButton} from './ChooserComponents/Buttons';
import states from '../../enums/asyncRequestStates';
import Spinner from '../UI/Spinner';

const useStyles = makeStyles ((theme) => ({
  wrapper: {
    color: 'white',
    '& h5': {
      marginBottom: '1em'
    }
  },
  fileSelectPaper: {
    padding: '12px',
    whiteSpace: 'pre-wrap',
    '& button': {
      color: 'black',
    }
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
      border: `2px solid ${theme.palette.secondary.dark}`
    }
  },
  changeSummaryHeader: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationColor: theme.palette.secondary.main,
  },
  tableRoot: {
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgb(5, 27, 54)',
    }
  },
  changeTableContainer: {
    maxHeight: 440,
  },
  title: {
    color: 'white',
  },
  pre: {
    fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    color: theme.palette.primary.main,
    fontSize: '32px',
    fontWeight: 100
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

const ChangeRow = (props) => {
  const { data } = props;
  const { sheet, row, col, original, current } = data;
  return (
    <TableRow>
      <TableCell>{sheet}</TableCell>
      <TableCell>{row}</TableCell>
      <TableCell>{col}</TableCell>
      <TableCell>{original}</TableCell>
      <TableCell>{current}</TableCell>
    </TableRow>
  );
};

const ChangeTable = (props) => {
  const cl = useStyles ();
  const { getChangeLog, handleDownloadWorkbook } = props;

  const changeLog = getChangeLog ();

  if (!changeLog || !Array.isArray(changeLog)) {
    return '';
  }

  const summary = getChangeSummary (changeLog);

  if (summary.length === 0) {
    return (
      <div>
        <Typography className={cl.changeSummaryHeader}>Change Summary</Typography>
        <Typography className={cl.submittedTypography}>
          No changes to the uploaded submission file were made in the validation process.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography className={cl.changeSummaryHeader}>
        Change Summary
      </Typography>
      <Typography className={cl.submittedTypography}>
        The changes you made to the uploaded file during the this validation process are listed below. You can download the edited workbook by clicking {' '}
        <Link
          style={{ display: 'inline-block' }}
          className={cl.needHelpLink}
          onClick={handleDownloadWorkbook}
          component="span"
        >
          here
        </Link>.
      </Typography>
      <TableContainer component={Paper} className={cl.changeTableContainer} >
        <Table aria-label="collapsible table" stickyHeader className={cl.tableRoot}>
          <TableHead>
            <TableRow>
              <TableCell>Sheet</TableCell>
              <TableCell>Row</TableCell>
              <TableCell>Column</TableCell>
              <TableCell>Original Value</TableCell>
              <TableCell>Changed Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {summary.map ((change, i) =>
            (<ChangeRow data={change} key={`change_row_${i}`} />))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const Step3 = (props) => {
  const {
    validationStep,
    shortName,
    handleUploadSubmission,
    handleDownloadWorkbook,
    getChangeLog,
    resetState,
  } = props;

  const classes = useStyles ();

  const userIsOnLastStep =
    Boolean(validationStep === validationSteps.length - 1);

  const submissionUploadState = useSelector ((state) =>
    state.submissionUploadState);

  const auditReport = useSelector ((state) =>
    state.auditReport);

  const lastSuccessfulSub = useSelector ((state) =>
    state.lastSuccessfulSubmission);

  const noErrors = auditReport && auditReport.errorCount.sum === 0;

  if (!userIsOnLastStep) {
    return '';
  }

  if (states.inProgress === submissionUploadState) {
    return (
      <div className={classes.wrapper}>
         <Typography variant={"h5"}>Upload Submission</Typography>
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
            Your dataset has been successfully submitted, and will be reviewed by our data curation team.
          </Typography>

          <Typography className={classes.submittedTypography}>
            You can view the status of your submission{' '}
            <Link
              style={{ display: 'inline-block' }}
              className={classes.needHelpLink}
              component={RouterLink}
              to={`/datasubmission/userdashboard?datasetName=${encodeURI(lastSuccessfulSub)}`}
            >
              here.
            </Link>
          </Typography>

          <Typography className={classes.submittedTypography}>
            A detailed description of remaining steps in the submission process can be found in the{' '}
            <Link
              style={{ display: 'inline-block' }}
              className={classes.needHelpLink}
              component={RouterLink}
              to="/datasubmission/guide"
            >
              Data Submission Guide
            </Link>.
          </Typography>

          <Typography className={classes.submittedTypography}>
            To start over and submit another dataset {' '}
            <Link
              style={{ display: 'inline-block' }}
              className={classes.needHelpLink}
              onClick={() => resetState(true, 'submit: start over')}
              component="span"
            >
              {'return to the start'}
            </Link>.
          </Typography>
      </div>
    );
  }

  if (states.failed === submissionUploadState) {
    return (
      <div className={classes.wrapper}>
        <Typography variant={"h5"}>Upload Submission</Typography>
            <List>
              <ListItem>
                <ListItemIcon style={{ color: 'rgba(255, 0, 0, .7)' }}>
                <ErrorOutline />
              </ListItemIcon>
              <ListItemText
                primary="There was an error when attempting to submit your dataset. A message has already been sent to the CMAP team. You can contact us at cmap-data-submission@uw.edu." />
              <Typography className={classes.submittedTypography}>
                To start over and submit another dataset click{' '}
                <Link
                  style={{ display: 'inline-block' }}
                  className={classes.needHelpLink}
                  onClick={() => resetState (true, 'submit failed: start over')}
                  component="span"
                >
                  here
                </Link>.
              </Typography>
            </ListItem>
          </List>
      </div>
    );
  }


  if (noErrors) {
    return (
      <div className={classes.wrapper}>
        <Typography variant={"h5"}>Upload Submission</Typography>
          <Typography>
            Validation is complete!
          </Typography>
          <Typography>
            Click the button below to upload your workbook.
          </Typography>

          <NameChangeWarnings />

          <ChangeTable getChangeLog={getChangeLog} handleDownloadWorkbook={handleDownloadWorkbook} />

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
  }

  if (!noErrors) {
    return (
      <div className={classes.wrapper}>
        <Typography variant={"h5"}>Upload Submission</Typography>
          <Typography>
            There are still validation errors in previous steps. Please address these errors before submitting the dataset.
          </Typography>

          <NameChangeWarnings />

          <ChangeTable getChangeLog={getChangeLog} handleDownloadWorkbook={handleDownloadWorkbook} />

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
  }
};

export default Step3;

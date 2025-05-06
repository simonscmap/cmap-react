import React, { useEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
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

import { connect, useSelector, useDispatch } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import {
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import UserDashboardPanelDetails from './UserDashboardPanelDetails';
import LoginRequiredPrompt from '../User/LoginRequiredPrompt';
import Section, { FullWidthContainer } from '../Common/Section';
import { SpinnerWrapper } from '../UI/Spinner';
import Footer from '../Home/Footer';
import SubscribeDatasetButton from '../User/Subscriptions/SubscribeButton';
import { retrieveDataSubmissionsByUser } from '../../Redux/actions/dataSubmission';

const renderDate = (dateString) => {
  const d = new Date(dateString);
  return `${d.toDateString()} at ${d.toLocaleTimeString()}`;
};

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useRowStyles();
  const startDate = renderDate(row.Start_Date_Time);

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{row.Dataset}</TableCell>
        <TableCell>{row.Phase}</TableCell>
        <TableCell>{startDate}</TableCell>
        <TableCell>
          <SubscribeDatasetButton shortName={row.Dataset} />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <UserDashboardPanelDetails submission={row} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    '& > div': {
      height: '100%',
    },
    '& h3': {
      color: 'white',
    },
  },
  accordion: {
    background: 'rgba(0,0,0,0.3)',
  },
  summary: {
    '& .MuiAccordionSummary-content': {
      margin: 0,
      alignItems: 'center',
    },
  },
  panelSummaryText: {
    flexBasis: '40%',
    textAlign: 'left',
    paddingRight: '20px',
    fontSize: '.8rem',
  },
  needHelp: {
    float: 'left',
    color: 'white',
    margin: '12px 0 0 12px',
    letterSpacing: 'normal',
  },
  panelDetails: {
    display: 'block',
    textAlign: 'left',
  },
}));

const UserSubmissionDashboard = (props) => {
  const dataSubmissions = useSelector((state) => state.dataSubmissions);
  const submissionFetchStatus = useSelector(
    (state) => state.retrieveUserDataSubmsissionsRequestStatus,
  );
  const classes = useStyles();
  const dispatch = useDispatch();

  const shouldFetch =
    !submissionFetchStatus || submissionFetchStatus === 'notTried';
  const fetchInProgress = submissionFetchStatus === 'inProgress';
  const noData =
    !fetchInProgress &&
    !shouldFetch &&
    (!Array.isArray(dataSubmissions) || dataSubmissions.length === 0);

  useEffect(() => {
    if (!submissionFetchStatus || submissionFetchStatus === 'notTried') {
      dispatch(retrieveDataSubmissionsByUser());
    }
  }, []);

  if (shouldFetch) {
    return (
      <div className={classes.wrapper}>
        <FullWidthContainer paddingTop={120}>
          <Section title="Data Submissions Dashboard"></Section>
        </FullWidthContainer>
        <Footer />
      </div>
    );
  }

  if (noData) {
    return (
      <div className={classes.wrapper}>
        <FullWidthContainer paddingTop={120}>
          <Section title="Data Submissions Dashboard">
            <Typography>
              {`We haven't received any submissions from you yet. Need help?`}
            </Typography>
            <Typography>
              <Link
                href="https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx"
                download="datasetTemplate.xlsx"
                className={classes.needHelpLink}
              >
                Download Submission Template
              </Link>
            </Typography>
            <Typography>
              <Link
                className={classes.needHelpLink}
                component={RouterLink}
                to="/datasubmission/guide"
              >
                Data Submission Guide
              </Link>
            </Typography>
          </Section>
        </FullWidthContainer>
        <Footer />
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <FullWidthContainer paddingTop={120}>
        <Section title="Data Submissions Dashboard">
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell component="th">Dataset Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Subscribe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataSubmissions.map((row) => (
                  <Row key={row.name} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      </FullWidthContainer>
      <Footer />
    </div>
  );
};

export default UserSubmissionDashboard;

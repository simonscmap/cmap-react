import React from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import {
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { retrieveDataSubmissionsByUser } from '../../Redux/actions/dataSubmission';

import UserDashboardPanelDetails from './UserDashboardPanelDetails';
import LoginRequiredPrompt from '../User/LoginRequiredPrompt';

// import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  dataSubmissions: state.dataSubmissions,
});

const mapDispatchToProps = {
  retrieveDataSubmissionsByUser,
};

const styles = (theme) => ({
  wrapperDiv: {
    margin: '120px auto 0 auto',
    maxWidth: '1380px',
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
});

class UserDashboard extends React.Component {
  state = {
    expandedPanel: false,
  };

  expandItem = () => {
    const subs = this.props.dataSubmissions;
    let params = new URLSearchParams(window.location.search);
    let submissionID = params.get('submissionID');
    let datasetName = params.get('datasetName');

    const shouldExpandItem = subs.findIndex ((s) => {
      return s.Submission_ID === submissionID || s.Dataset.trim() === datasetName
    });

    if (shouldExpandItem >= 0) {
      console.log (`found item`, { submissionID, datasetName }, subs);
      this.setState({
        ...this.state,
        expandedPanel: shouldExpandItem,
      });
    } else {
      console.log (`could not find item`, { submissionID, datasetName }, subs);
    }
  }

  componentDidMount = () => {
    this.props.retrieveDataSubmissionsByUser();
    // this.expandItem();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!prevProps.user && this.props.user) {
      this.props.retrieveDataSubmissionsByUser();
    }
    if (prevProps.dataSubmissions.length !== this.props.dataSubmissions.length) {
      console.log ('component did update AND dataSub length differ', { prevProps, curr: this.props })
      this.expandItem();
    }
  };

  handleExpansion = (i) => {
    this.props.history.push({
      pathname: '/datasubmission/userdashboard',
      query: {},
    });
    if (this.state.expandedPanel === i) {
      this.setState({ ...this.state, expandedPanel: false });
    } else {
      this.setState({ ...this.state, expandedPanel: i });
    }
  };

  render = () => {
    if (!this.props.user) return <LoginRequiredPrompt />;
    const { classes, dataSubmissions } = this.props;
    const { expandedPanel } = this.state;

    return (
      <div className={classes.wrapperDiv}>
        {dataSubmissions && dataSubmissions.length ? (
          <React.Fragment>
            {dataSubmissions.map((e, i) => (
              <Accordion
                expanded={expandedPanel === i}
                onChange={() => this.handleExpansion(i)}
                key={i}
                TransitionProps={{ unmountOnExit: true }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography noWrap className={classes.panelSummaryText}>
                    {e.Dataset}
                  </Typography>

                  <Typography noWrap className={classes.panelSummaryText}>
                    {e.Phase}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails className={classes.panelDetails}>
                  <UserDashboardPanelDetails submission={e} />
                </AccordionDetails>

              </Accordion>
            ))}
          </React.Fragment>
        ) : (
          <Typography className={classes.needHelp}>
            We haven't received any submissions from you yet. Need help?
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
        )}
      </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(UserDashboard)));

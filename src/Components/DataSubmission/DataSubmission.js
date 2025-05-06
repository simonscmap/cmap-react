// Subrouter for Data Submission components

import { withStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import metaTags from '../../enums/metaTags';
import { snackbarOpen } from '../../Redux/actions/ui';
import AdminDashboard from './AdminDashboard';
import NominateDataPage from './NominateDataPage';
import SubmissionGuide from './Guide/SubmissionGuide2';
import UserDashboard from './UserDashboard2';
import ValidationTool from './ValidationTool';

const styles = () => ({
  root: {
    paddingTop: '70px',
  },
});

const mapStateToProps = (state) => ({
  user: state.user,
});

const mapDispatchToProps = {
  snackbarOpen,
};

const DataSubmission = (props) => {
  const { match } = props;

  useEffect(() => {
    document.title = metaTags.dataSubmission.title;
    document.description = metaTags.dataSubmission.description;

    return () => {
      document.title = metaTags.default.title;
      document.title = metaTags.default.description;
    };
  });

  return (
    <Switch>
      <Route exact path={match.url + '/'} component={SubmissionGuide} />
      <Route exact path={match.url + '/guide'} component={SubmissionGuide} />
      <Route
        exact
        path={match.url + '/submission-portal'}
        component={ValidationTool}
      />
      <Route exact path={match.url + '/validationtool'}>
        <Redirect to={{ pathname: match.url + '/submission-portal' }} />
      </Route>
      <Route
        exact
        path={match.url + '/userdashboard'}
        component={UserDashboard}
      />
      <Route
        exact
        path={match.url + '/admindashboard'}
        component={AdminDashboard}
      />
      <Route
        exact
        path={match.url + '/nominate-data'}
        component={NominateDataPage}
      />
    </Switch>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(DataSubmission));

// Subrouter for Data Submission components

import React, { useEffect } from 'react';

import { Route, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { snackbarOpen } from '../../Redux/actions/ui';

import ValidationTool from './ValidationTool';
import SubmissionGuide from './SubmissionGuide';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

import metaTags from '../../Enums/metaTags';

const styles = (theme) => ({
    root: {
        paddingTop: '70px'
    }
});

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
});

const mapDispatchToProps = {
    snackbarOpen
}

const DataSubmission = (props) => {
    const { classes, match, user } = props;

    useEffect(() => {
        document.title = metaTags.dataSubmission.title;
        document.description = metaTags.dataSubmission.description;

        return () => {
            document.title = metaTags.default.title;
            document.title = metaTags.default.description;
        }
    })
    
    return (
        <div className={classes.root}>
        <Switch>
            <Route exact path={match.url + '/'} component={ SubmissionGuide } />
            <Route exact path={match.url + '/guide'} component={ SubmissionGuide } />
            <Route exact path={match.url + '/validationtool'} component={ ValidationTool } />
            <Route exact path={match.url + '/userdashboard'} component={ UserDashboard } />
            <Route exact path={match.url + '/admindashboard'} component={ AdminDashboard } /> 
        </Switch>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataSubmission));
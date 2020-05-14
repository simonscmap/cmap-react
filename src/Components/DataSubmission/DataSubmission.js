import React from 'react';

import { Route, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import ValidationTool from './ValidationTool';
import SubmissionGuide from './SubmissionGuide';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const styles = (theme) => ({
    root: {
        paddingTop: '70px'
    }
});

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
});

const DataSubmission = (props) => {
    const { classes, match, user } = props;

    return (
        <div className={classes.root}>
        <Switch>          
            <Route exact path={match.url + '/guide'} component={ SubmissionGuide } />
            <Route exact path={match.url + '/validationtool'} component={ ValidationTool } />
            <Route exact path={match.url + '/userdashboard'} component={ UserDashboard } />
            <Route exact path={match.url + '/admindashboard'} component={ AdminDashboard } /> 
        </Switch>
        </div>
    )
}

export default connect(mapStateToProps, null)(withStyles(styles)(DataSubmission));
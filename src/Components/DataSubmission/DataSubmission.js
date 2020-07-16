import React from 'react';

import { Route, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { snackbarOpen } from '../../Redux/actions/ui';

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

const mapDispatchToProps = {
    snackbarOpen
}

class DataSubmission extends React.Component {

    // componentDidCatch = () => {
    //     this.props.snackbarOpen('An error occurred');
    // }

    render = () => {
        const { classes, match, user } = this.props;
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
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataSubmission));
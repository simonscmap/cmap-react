import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
})

const mapDispatchToProps = {
}

const styles = theme => ({

})

const UserDashboard = (props) => {



    return (
        'User Dashboard'
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserDashboard));
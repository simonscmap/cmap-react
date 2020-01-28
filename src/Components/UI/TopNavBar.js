import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog, restoreInterfaceDefaults, snackbarOpen, toggleShowHelp } from '../../Redux/actions/ui';
import { logOut } from '../../Redux/actions/user';
import { Typography } from '@material-ui/core';

import UserNavbarDropdown from '../User/UserNavbarDropdown';

const styles = theme => ({
    appBar: {
        backgroundColor: 'transparent',
        boxShadow: 'none'
    },

    toolBar: {
        backgroundColor: 'transparent',
        boxShadow: 'none'
    },

    navWrapper: {
        position: 'fixed',
        width: '100vw',
        top: '0px',
        backgroundColor: 'transparent',
        zIndex: 50,
        paddingTop: '10px',
        paddingLeft: '20px',
        textAlign: 'left',
        boxSizing: 'border-box'
    },

    navLink: {
        textDecoration: 'none',
        marginRight: 20,
        color: 'white',
        '&:hover': {
            textDecoration: 'underline'
        },
        fontSize: '13px',
        fontWeight: 100,
        display: 'inline-block',
        cursor: 'pointer' 
    },

    rightNavLink: {
        float: 'right'
    }
})

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    showHelp: state.showHelp
})

const mapDispatchToProps = {
    showLoginDialog,
    logOut,
    restoreInterfaceDefaults,
    snackbarOpen,
    toggleShowHelp
}

class TopNavBar extends Component {

    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: ''
        }
        
    }
    
    // Controls login dialog text fields to allow reset from logout button
    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value})
    };

    handleLogOut = () => {
        this.clearState();
        this.props.logOut();
        this.props.restoreInterfaceDefaults();
    }

    clearState = () => {
        this.setState({
            username: '',
            password: ''
        })
    }

    handleNavigate = (route) => {
        this.props.restoreInterfaceDefaults()
        this.props.history.push(route);
    }

    handleOutsideNavigate = (url) => {
        window.open(url, '_blank')
    }

    render(){
        const { classes, history, user } = this.props;
        const { pathname } = history.location;

        return (
            <div className={classes.navWrapper}>
                <Typography variant='caption' href='/' component='a' className={classes.navLink}>Home</Typography>
                <Typography variant='caption' to='/catalog' component={Link} className={classes.navLink}>Catalog</Typography>
                {pathname !== '/visualization' && <Typography variant='caption' to='/visualization' component={Link} className={classes.navLink}>Visualization</Typography>}
                {user && <UserNavbarDropdown pathname={pathname} user={user}/>}
                {/* <Typography variant='caption' onClick={this.props.toggleShowHelp} className={classes.navLink}>{showHelp ? 'Hide Help' : 'Help(beta) '}</Typography> */}
                {(!user && pathname !== '/visualization') && <Typography variant='caption' onClick={() => this.props.showLoginDialog()} className={`${classes.navLink} ${classes.rightNavLink}`}>Log In</Typography>}
                {(!user && pathname !== '/visualization') && <Typography variant='caption' to='/register' component={Link} className={`${classes.navLink} ${classes.rightNavLink}`}>Register</Typography>}
            </div>        
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(TopNavBar)));
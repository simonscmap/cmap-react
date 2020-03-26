import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog, restoreInterfaceDefaults, snackbarOpen, toggleShowHelp } from '../../Redux/actions/ui';
import { logOut } from '../../Redux/actions/user';
import { Typography } from '@material-ui/core';

import UserNavbarDropdown from '../User/UserNavbarDropdown';
import DataSubmissionNavbarDropdown from '../DataSubmission/DataSubmissionNavbarDropdown';
import JSS from '../../Stylesheets/JSS';

const styles = theme => ({

    simonsLogo: {
        verticalAlign: 'middle',
        display: 'inline-block',
    },
    
    simonsLogoWrapper: {
        pointerEvents: 'all',
        display: 'inline-block',
        marginRight: '60px !important',     
        verticalAlign: 'middle',   
    },

    navWrapper: {
        position: 'fixed',
        width: '100vw',
        top: '0px',
        backgroundColor: 'transparent',
        zIndex: 50,
        paddingTop: '14px',
        paddingBottom: '14px',
        paddingLeft: '20px',
        paddingRight: '20px',
        textAlign: 'left',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none'
    },

    navWrapperGradient: {
        backgroundImage: 'linear-gradient(270deg, rgba(0, 0, 0, 0.48), rgba(0, 0, 0, 0.1))'
    },

    rightSectionWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around'

    },

    navLink: JSS.navLink(theme),

    rightNavLink: {
        marginRight: 30
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
        const { classes, history, user, showHelp } = this.props;
        const { pathname } = history.location;

        return (
            <div className={`${classes.navWrapper} ${pathname !== '/visualization' && classes.navWrapperGradient}`}>

                {/* Left side of navbar */}
                <div>
                    <Typography variant='caption' href='/' component='a' className={`${classes.navLink} ${classes.simonsLogoWrapper}`}>
                        <img src='/images/CMAP_white_logo_2.png' width='40' alt='CMAP logo' className={classes.simonsLogo}/>
                    </Typography>
                    <Typography variant='caption' to='/catalog' component={Link} className={classes.navLink}>Catalog</Typography>
                    <Typography variant='caption' to='/visualization' component={Link} className={classes.navLink}>Visualization</Typography>
                    {/* <DataSubmissionNavbarDropdown/> */}
                    {/* <Typography variant='caption' to='/contact' component={Link} className={classes.navLink}>Contact</Typography> */}
                </div>

                {/* Right side of navbar */}
                <div className={classes.rightSectionWrapper}>
                    <div>
                        {/* <Typography variant='caption' onClick={this.props.toggleShowHelp} className={classes.navLink}>{showHelp ? 'Hide Help' : 'Show Help'}</Typography> */}
                        {user && <UserNavbarDropdown pathname={pathname} user={user}/>}
                        {!user && <Typography variant='caption' onClick={() => this.props.showLoginDialog()} className={`${classes.navLink} ${classes.rightNavLink}`}>Log In</Typography>}
                        {!user && <Typography variant='caption' to='/register' component={Link} className={`${classes.navLink} ${classes.rightNavLink}`}>Register</Typography>}
                    </div>
                </div>
            </div>        
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(TopNavBar)));
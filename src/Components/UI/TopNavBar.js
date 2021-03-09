import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog, restoreInterfaceDefaults, snackbarOpen, toggleShowHelp, setShowCart } from '../../Redux/actions/ui';
import { logOut } from '../../Redux/actions/user';
import { Typography } from '@material-ui/core';

import UserNavbarDropdown from '../User/UserNavbarDropdown';
import DataSubmissionNavbarDropdown from '../DataSubmission/DataSubmissionNavbarDropdown';
import MobileNavbarMenu from './MobileNavbarMenu';

import JSS from '../../Stylesheets/JSS';
import VizNavbarDropdown from '../Visualization/VizNavbarDropdown';

import z from '../../Enums/zIndex';

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
        zIndex: z.NAVBAR,
        // zIndex: 50,
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

    navWrapperBlue: {
        backgroundColor: '#1D4962'
    },

    rightSectionWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around'
    },

    navLink: JSS.navLink(theme),

    rightNavLink: {
        marginRight: 30
    },    
})

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    showHelp: state.showHelp,
    cart: state.cart
})

const mapDispatchToProps = {
    showLoginDialog,
    logOut,
    restoreInterfaceDefaults,
    snackbarOpen,
    toggleShowHelp,
    setShowCart
}

const breakpoint = 1000;

class TopNavBar extends Component {

    constructor(props){
        super(props);
        this.state = {
            username: '',
            password: '',
            layout: window.innerWidth >= breakpoint ? 'desktop' : 'mobile'
        }
        
    }
    
    componentDidMount = () => {
        window.addEventListener("resize", this.handleResize);
    }

    handleResize = (e) => {
        let w = e.target.innerWidth;

        if(w < breakpoint && this.state.layout === 'desktop'){
            this.setState({...this.state, layout:'mobile'});
        }

        else if(w >= breakpoint && this.state.layout === 'mobile'){
            this.setState({...this.state, layout:'desktop'});
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

    render(){
        const { classes, history, user, showHelp, cart } = this.props;
        const { pathname } = history.location;

        let cartSize = cart && Object.keys(cart).length ? Object.keys(cart).length : 0;

        return (
            <div className={`${classes.navWrapper} ${!pathname.includes('/visualization') && classes.navWrapperBlue}`}>
                {
                    this.state.layout === 'desktop' ?

                    <React.Fragment>
                        {/* Left side of navbar */}
                        <div>
                            <Typography variant='caption' href='/' component='a' className={`${classes.navLink} ${classes.simonsLogoWrapper}`}>
                                <img src='/images/CMAP_white_logo_2.png' width='40' alt='CMAP logo' className={classes.simonsLogo}/>
                            </Typography>
                            <Typography variant='caption' to='/catalog' component={Link} className={classes.navLink}>Catalog</Typography>
                            <VizNavbarDropdown/>
                            {/* <Typography variant='caption' to='/visualization' component={Link} className={classes.navLink}>Visualization</Typography> */}
                            <Typography variant='caption' to='/community' component={Link} className={classes.navLink}>Community</Typography>
                            <DataSubmissionNavbarDropdown/>
                            <Typography variant='caption' href='/about' component='a' className={classes.navLink}>About</Typography>
                        </div>

                        {/* Right side of navbar */}
                        <div className={classes.rightSectionWrapper}>
                            <div>
                                {
                                    cartSize > 0 ?
                                    <Typography variant='caption' onClick={() => this.props.setShowCart(true)} className={`${classes.navLink} ${classes.rightNavLink}`}>Favorites ({cartSize})</Typography> :
                                    ''
                                }

                                {user && <UserNavbarDropdown pathname={pathname} user={user}/>}
                                {!user && <Typography variant='caption' onClick={() => this.props.showLoginDialog()} className={`${classes.navLink} ${classes.rightNavLink}`}>Log In</Typography>}
                                {!user && <Typography variant='caption' to='/register' component={Link} className={`${classes.navLink} ${classes.rightNavLink}`}>Register</Typography>}
                            </div>
                        </div>
                    </React.Fragment>

                    :

                    <React.Fragment>
                        <Typography variant='caption' href='/' component='a' className={`${classes.navLink} ${classes.simonsLogoWrapper}`}>
                            <img src='/images/CMAP_white_logo_2.png' width='40' alt='CMAP logo' className={classes.simonsLogo}/>
                        </Typography>
                        <MobileNavbarMenu 
                            handleLogOut={this.handleLogOut} 
                            showLoginDialog={this.props.showLoginDialog} 
                            user={user}
                            cartSize={cartSize}
                            handleShowCart={() => this.props.setShowCart(true)}
                        />
                    </React.Fragment>
                }

            </div>        
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(TopNavBar)));
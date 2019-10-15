import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from "react-router";

import Cookies from 'js-cookie';

import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { showLoginDialog, restoreInterfaceDefaults, snackbarOpen } from '../Redux/actions/ui';
import { logOut } from '../Redux/actions/user';
import { Typography } from '@material-ui/core';

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
        cursor: 'pointer',
        marginRight: 20,
        color: 'white',
        '&:hover': {
            textDecoration: 'underline'
        },
        fontSize: '13px',
        fontWeight: 100,
        display: 'inline-block'     
    },

    rightNavLink: {
        float: 'right'
    },

    rightLinkWrapper: {
        display:'inline-block',
        textAlign: 'right'
    }
})

const mapStateToProps = (state, ownProps) => ({
    user: state.user
})

const mapDispatchToProps = {
    showLoginDialog,
    logOut,
    restoreInterfaceDefaults,
    snackbarOpen
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

    // getCurrentPath = () => {
    //     switch(this.props.location.pathname){
    //         case '/apikeymanagement': return 1;
    //         case '/catalog': return 2;
    //         case '/visualization': return 3;
    //         default: return 0;
    //     }
    // };

    handleNavigate = (route) => {
        this.props.restoreInterfaceDefaults()
        this.props.history.push(route);
    }

    handleOutsideNavigate = (url) => {
        window.open(url, '_blank')
    }

    render(){
        const { classes, history } = this.props;
        const { pathname } = history.location;

        return (
            // <AppBar position="fixed" className={classes.appBar}>
            //     <Toolbar>
            //         {/* <Tabs value={this.getCurrentPath() || 0} onChange={this.handleChange}>
            //             <Tab key='0' component={Link} to={{pathname: '/'}} label='Home' onClick={this.props.restoreInterfaceDefaults}/>
            //             <Tab key='1' component={Link} to={{pathname: '/apikeymanagement'}} label='API Keys' onClick={this.props.restoreInterfaceDefaults}/>
            //             <Tab key='2' component={Link} to={{pathname: '/catalog'}} label='Catalog' onClick={this.props.restoreInterfaceDefaults}/>
            //             <Tab key='3' component={Link} to={{pathname: '/visualization'}} label='Visualization' onClick={this.props.restoreInterfaceDefaults}/>
            //             {this.props.user ? '' : <Tab key='4' component={Link} to={{pathname: '/register'}} label='Register' onClick={this.props.restoreInterfaceDefaults}/>}
            //             {this.props.user ? '' : <Tab key='5' label='Log In' onClick={this.props.showLoginDialog}/>}
            //             {this.props.user ? <Tab key='6' label={`Welcome ${this.props.user.firstName} ${this.props.user.lastName}!`}/> : ''}
            //             {this.props.user ? <Tab key='7' label='Log Out' onClick={this.handleLogOut}/> : ''}                        
            //         </Tabs>                     */}
            //         {/* <Link label='Home' to={{pathname: '/'}} onClick={this.props.restoreInterfaceDefaults}/>
            //         <Link label='API Keys' to={{pathname: '/apikeymanagement'}} onClick={this.props.restoreInterfaceDefaults}/>
            //         <Link label='Catalog' to={{pathname: '/catalog'}} onClick={this.props.restoreInterfaceDefaults}/>
            //         <Link label='Visualization' to={{pathname: '/visualization'}} onClick={this.props.restoreInterfaceDefaults}/> */}
            //         <Typography variant='body2' onClick={() => this.handleNavigate('/')} className={classes.navLink}>Home</Typography>
            //         <Typography variant='body2' onClick={() => this.handleNavigate('/catalog')} className={classes.navLink}>Catalog</Typography>
            //         <Typography variant='body2' onClick={() => this.handleNavigate('/apikeymanagement')} className={classes.navLink}>API Keys</Typography>
            //     </Toolbar>
            // </AppBar>    
            <div className={classes.navWrapper}>
                <Typography variant='caption' onClick={() => this.handleNavigate('/')} className={classes.navLink}>Home</Typography>
                <Typography variant='caption' onClick={() => this.handleNavigate('/catalog')} className={classes.navLink}>Catalog</Typography>
                {pathname !== '/visualization' && <Typography variant='caption' onClick={() => this.handleNavigate('/apikeymanagement')} className={classes.navLink}>API Keys</Typography>}
                {pathname !== '/visualization' && <Typography variant='caption' onClick={() => this.handleNavigate('/visualization')} className={classes.navLink}>Visualization</Typography>}
                {this.props.user && <Typography variant='caption' onClick={() => this.handleLogOut()} className={`${classes.navLink} ${pathname === '/visualization' ? '' : classes.rightNavLink}`}>Log Out</Typography>}
                {(!this.props.user && pathname !== '/visualization') && <Typography variant='caption' onClick={() => this.props.showLoginDialog()} className={`${classes.navLink} ${classes.rightNavLink}`}>Log In</Typography>}
                {(!this.props.user && pathname !== '/visualization') && <Typography variant='caption' onClick={() => this.handleNavigate('/register')} className={`${classes.navLink} ${classes.rightNavLink}`}>Register</Typography>}
            </div>        
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(TopNavBar)));
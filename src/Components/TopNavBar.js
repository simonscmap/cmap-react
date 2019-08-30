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

const styles = theme => ({
    inlineBlock: {
        display: 'inline-block'
    }
})

const mapStateToProps = (state, ownProps) => {
    return state;
}

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

    getCurrentPath = () => {
        switch(this.props.location.pathname){
            case '/apikeymanagement': return 0;
            case '/': return 1;
            case '/visualization': return 2;
            case '/register': return 3;
            default: return 0;
        }
    };

    // Debug button
    beepBoop = () => {
        console.log(this.props);
        Cookies.set('hi','there');
        Cookies.get();
    };

    render(){

        // const { classes } = this.props;

        return (
            <AppBar position="sticky">
                <Toolbar>
                    <Tabs value={this.getCurrentPath() || 0} onChange={this.handleChange}>
                        <Tab key='0' component={Link} to={{pathname: '/apikeymanagement'}} label='API Keys' onClick={this.props.restoreInterfaceDefaults}/>
                        <Tab key='1' component={Link} to={{pathname: '/'}} label='Catalog' onClick={this.props.restoreInterfaceDefaults}/>
                        <Tab key='2' component={Link} to={{pathname: '/visualization'}} label='Visualization' onClick={this.props.restoreInterfaceDefaults}/>
                        {this.props.user ? '' : <Tab key='3' component={Link} to={{pathname: '/register'}} label='Register' onClick={this.props.restoreInterfaceDefaults}/>}
                        {this.props.user ? '' : <Tab key='4' label='Log In' onClick={this.props.showLoginDialog}/>}
                        {this.props.user ? <Tab key='5' label={`Welcome ${this.props.user.firstName} ${this.props.user.lastName}!`}/> : ''}
                        {this.props.user ? <Tab key='4' label='Log Out' onClick={this.handleLogOut}/> : ''}                        
                        <Tab key='6' label='Debug' onClick={this.beepBoop}/>
                    </Tabs>                    
                </Toolbar>
                {/* <LoginDialog clearState={this.clearState} username={this.state.username} password={this.state.password} handleChange={this.handleChange}/> */}
            </AppBar>            
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(TopNavBar)));
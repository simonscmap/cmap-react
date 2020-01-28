import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog } from '../Redux/actions/ui';

import ApiKeyManagement from './User/ApiKeyManagement';
import LoginRequiredPrompt from './User/LoginRequiredPrompt';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
})

const mapDispatchToProps = {
    showLoginDialog
}

const styles = theme => ({

})

class Home extends Component {

    render(){
        if(!this.props.user) return <LoginRequiredPrompt/>;

        return (
            <React.Fragment>
                <ApiKeyManagement/>
            </React.Fragment>
            
        )
    }
}

Home.propTypes = {
    
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
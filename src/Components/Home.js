import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog } from '../Redux/actions/ui';

import ApiKeyManagement from './ApiKeyManagement';
import LoginRequiredPrompt from './LoginRequiredPrompt';

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
                {/* <TopNavBar/> */}
                <ApiKeyManagement/>
            </React.Fragment>
            
        )
    }
}

Home.propTypes = {
    
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
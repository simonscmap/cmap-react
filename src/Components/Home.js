import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { showLoginDialog } from '../Redux/actions/ui';

import ApiKeyManagement from './ApiKeyManagement';
import LoginRequiredPrompt from './LoginRequiredPrompt';
import TopNavBar from './TopNavBar';


const mapStateToProps = (state, ownProps) => ({
    user : state.user,
})

const mapDispatchToProps = {
    showLoginDialog
}

const styles = theme => ({

})

class Home extends Component {
    // constructor(props){
    //     super(props)
    // }
    componentDidMount(){
        if(!this.props.user) this.props.showLoginDialog();
    }

    render(){
        return (
            <React.Fragment>
                <TopNavBar/>
                {this.props.user ? <ApiKeyManagement/> : <LoginRequiredPrompt/>}
            </React.Fragment>
            
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Home));
import React, { Component } from 'react';
import { connect } from 'react-redux';

import AGGridWrapper from './AGGridWrapper';
import LoadingSpinner from './LoadingSpinner';
import TopNavBar from './TopNavBar';

import { retrievalRequestSend } from '../Redux/actions/catalog';
import states from '../asyncRequestStates';

import { withStyles } from '@material-ui/core/styles';

const mapStateToProps = (state, ownProps) => ({
    catalogRequestState: state.catalogRequestState,
    catalog : state.catalog
})

const mapDispatchToProps = {
    retrievalRequestSend
}

const styles = (theme) => ({

})

class Catalog extends Component {

    componentDidMount = () => {
        if(!this.props.catalog) this.props.retrievalRequestSend();
    }

    determineContent = () => {
        if(this.props.catalog) return <AGGridWrapper catalog={this.props.catalog}/>
        else if(this.props.catalogRequestState === states.inProgress) return <LoadingSpinner size={24}/>
        else if(this.props.catalogRequestState === states.failed) return <p>Failed to get catalog. Have you tried turning it off and then on again?</p>
        else return <p>I don't know how we got here. Please debug the catalog retrieval process.</p>
    }

    render(){
        let content = this.determineContent();
        return (
            <React.Fragment>
                <TopNavBar/>
                {content}
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Catalog));
import React, { Component } from 'react';
import { connect } from 'react-redux';

import AGGridWrapper from './AGGridWrapper';
import LoadingSpinner from './LoadingSpinner';

import { retrievalRequestSend, datasetRetrievalRequestSend } from '../Redux/actions/catalog';
import states from '../Enums/asyncRequestStates';

import { withStyles } from '@material-ui/core/styles';

const mapStateToProps = (state, ownProps) => ({
    catalogRequestState: state.catalogRequestState,
    catalog : state.catalog,
    datasets: state.datasets
})

const mapDispatchToProps = {
    retrievalRequestSend,
    datasetRetrievalRequestSend
}

const styles = (theme) => ({

})

class Catalog extends Component {

    componentDidMount = () => {
        if(!this.props.catalog) this.props.retrievalRequestSend();
        if(!this.props.datasets) this.props.datasetRetrievalRequestSend();
    }

    determineContent = () => {
        if(this.props.catalog && this.props.datasets) return <AGGridWrapper catalog={this.props.catalog} datasets={this.props.datasets}/>
        else if(this.props.catalogRequestState === states.inProgress) return <LoadingSpinner size={24}/>
    }

    render(){
        let content = this.determineContent();
        return (
            <React.Fragment>
                {content}
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Catalog));
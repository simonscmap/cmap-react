import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AdminDashboardPanelDetails from './AdminDashboardPanelDetails';

import { retrieveAllSubmissions } from '../../Redux/actions/dataSubmission';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
    dataSubmissions: state.dataSubmissions
})

const mapDispatchToProps = {
    retrieveAllSubmissions
}

const styles = theme => ({
    wrapperDiv: {
        width: '90vw',
        margin: '24px auto'
    },

    panelSummaryText: {
        flexBasis: '40%',
        textAlign: 'left',
        paddingRight: '20px'
    },

    filterFormGroup: {
        backgroundColor: 'rgba(0,0,0,.4)',
        color: 'white',
        padding: '2px 12px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
    },

    filterFormControl: {
        marginRight: '24px'
    }
})

const initialFilterState = {
    'Awaiting admin action': true,
    'Awaiting user update': true,
    'Awaiting DOI': true,
    'Awaiting ingestion': true,
    'Complete': false
}

class AdminDashboard extends Component {

    state = {
        expandedPanel: false,
        filters: initialFilterState
    }

    componentDidMount = () => {
        this.props.retrieveAllSubmissions();
    }

    handleExpansion = (i) => {
        if(this.state.expandedPanel === i){
            this.setState({...this.state, expandedPanel: false})
        }

        else {
            this.setState({...this.state, expandedPanel: i})
        }
    }

    handleFilterChange = (e) => {
        let newFilterState = {...this.state.filters};
        newFilterState[e.target.name] = !newFilterState[e.target.name];
        this.setState({...this.state, filters: {...newFilterState}});
    }

    render = () => {
        const { classes } = this.props;

        let submissions = this.props.dataSubmissions.filter(item => this.state.filters[item.Phase]);

        return (
            <div className={classes.wrapperDiv}>
                <FormGroup row className={classes.filterFormGroup}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.filters["Awaiting admin action"]}
                                    onChange={this.handleFilterChange}
                                    name="Awaiting admin action"
                                    color="primary"
                                />
                            }
                            label="Awaiting admin action"
                            className={classes.filterFormControl}
                        />

                        <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.filters["Awaiting user update"]}
                                        onChange={this.handleFilterChange}
                                        name="Awaiting user update"
                                        color="primary"
                                    />
                                }
                                label="Awaiting user update"
                                className={classes.filterFormControl}
                            />

                        <FormControlLabel
                            control={
                                <Checkbox
                                checked={this.state.filters["Awaiting DOI"]}
                                onChange={this.handleFilterChange}
                                name="Awaiting DOI"
                                color="primary"
                                />
                            }
                            label="Awaiting DOI"
                            className={classes.filterFormControl}
                            />

                        <FormControlLabel
                            control={
                                <Checkbox
                                checked={this.state.filters["Awaiting ingestion"]}
                                onChange={this.handleFilterChange}
                                name="Awaiting ingestion"
                                color="primary"
                                />
                            }
                            label="Awaiting ingestion"
                            className={classes.filterFormControl}
                            />

                        <FormControlLabel
                            control={
                                <Checkbox
                                checked={this.state.filters["Complete"]}
                                onChange={this.handleFilterChange}
                                name="Complete"
                                color="primary"
                                />
                            }
                            label="Complete"
                            className={classes.filterFormControl}
                            />
                    </FormGroup>

                {submissions && submissions.length ?
                
                <React.Fragment>                    
                    {
                        submissions.map((e, i) => (
                            <ExpansionPanel 
                                expanded={this.state.expandedPanel === i} 
                                onChange={() => this.handleExpansion(i)} 
                                key={i}
                                TransitionProps={{ unmountOnExit: true }}
                            >
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography noWrap className={classes.panelSummaryText}>
                                        {e.Dataset}
                                    </Typography>
    
                                    <Typography noWrap className={classes.panelSummaryText}>
                                        {e.Phase}
                                    </Typography>
                                </ExpansionPanelSummary>
                                <AdminDashboardPanelDetails submission={e}/>
                            </ExpansionPanel>
                        ))
                    }
                </React.Fragment>
                    
                    :

                    <Typography>
                        No submissions yet...
                    </Typography>
                }
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AdminDashboard));
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Search } from '@material-ui/icons';

import * as JsSearch from 'js-search';

import { ExpansionPanel, ExpansionPanelSummary, Typography, FormGroup, FormControlLabel, Checkbox, TextField, InputAdornment } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AdminDashboardPanelDetails from './AdminDashboardPanelDetails';

import { retrieveAllSubmissions } from '../../Redux/actions/dataSubmission';

import colors from '../../Enums/colors';

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
        paddingRight: '20px',
        fontSize: '.8rem'
    },

    filterFormGroup: {
        backgroundColor: 'rgba(0,0,0,.4)',
        color: 'white',
        padding: '8px 12px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        flexWrap: 'wrap'
    },

    filterFormControl: {
        marginRight: '24px'
    },

    searchFieldWrapper: {
        flexBasis: '100%',
        textAlign: 'left'
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

    constructor(props){
        super(props);

        let params = new URLSearchParams(window.location.search)
        let datasetName = params.get('datasetName') && params.get('datasetName').trim();

        var search = new JsSearch.Search('Submission_ID');
        search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
        search.searchIndex = new JsSearch.UnorderedSearchIndex();
        search.addIndex('Dataset');
        search.addIndex('Name');

        if(props.dataSubmissions) search.addDocuments(props.dataSubmissions);

        this.state = {
            searchString: datasetName || '',
            search,
            expandedPanel: false,
            filters: initialFilterState,
            modifiedDatasetID: null
        }
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.dataSubmissions && prevProps.dataSubmissions.length) && (this.props.dataSubmissions && this.props.dataSubmissions.length)){
            this.state.search.addDocuments(this.props.dataSubmissions);
            this.setState({search: this.state.search});
        }

        if(!prevProps.user && this.props.user) this.props.retrieveAllSubmissions();
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

    handleChangeFilter = (e) => {
        let newFilterState = {...this.state.filters};
        newFilterState[e.target.name] = !newFilterState[e.target.name];
        this.setState({...this.state, filters: {...newFilterState}});
    }

    handleChangeSearchString = (e) => {
        this.setState({...this.state, searchString: e.target.value});
    }

    handleResetExpandedPanel = () => {
        this.setState({...this.state, expandedPanel: false});
    }

    render = () => {
        const { classes, dataSubmissions } = this.props;
        const { search, searchString } = this.state;
        
        let submissions = searchString ? 
            search.search(searchString).filter(item => this.state.filters[item.Phase]) :
            dataSubmissions.filter(item => this.state.filters[item.Phase]);

        return (
            <div className={classes.wrapperDiv}>
                <FormGroup row className={classes.filterFormGroup}>
                    <div className={classes.searchFieldWrapper}>
                        <TextField
                            variant='outlined'
                            value={searchString}
                            onChange={this.handleChangeSearchString}
                            placeholder='Search'
                            InputProps={{
                                startAdornment: (
                                <InputAdornment position="start">
                                    <Search style={{color:colors.primary}}/>
                                </InputAdornment>
                            )
                        }}
                        />
                    </div>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.filters["Awaiting admin action"]}
                                    onChange={this.handleChangeFilter}
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
                                        onChange={this.handleChangeFilter}
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
                                onChange={this.handleChangeFilter}
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
                                onChange={this.handleChangeFilter}
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
                                onChange={this.handleChangeFilter}
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
                                // expanded={e.expandPanel} 
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
                                <AdminDashboardPanelDetails 
                                    submission={e} 
                                    handleResetExpandedPanel={this.handleResetExpandedPanel}
                                />
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
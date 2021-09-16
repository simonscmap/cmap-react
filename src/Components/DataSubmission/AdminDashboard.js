// Admininstrator dashboard for data submission.

import React, { Component } from 'react';
import { withRouter } from "react-router";

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Search } from '@material-ui/icons';

import * as JsSearch from 'js-search';
import queryString from 'query-string';

import { Button, Dialog, DialogContent, DialogActions,DialogTitle, Accordion, AccordionSummary, Typography, FormGroup, FormControlLabel, Checkbox, TextField, InputAdornment, Tooltip } from '@material-ui/core';
import { ExpandMore, Delete } from '@material-ui/icons';

import AdminDashboardPanelDetails from './AdminDashboardPanelDetails';

import { retrieveAllSubmissions, dataSubmissionDelete } from '../../Redux/actions/dataSubmission';

import colors from '../../enums/colors';
import z from '../../enums/zIndex';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
    dataSubmissions: state.dataSubmissions
})

const mapDispatchToProps = {
    retrieveAllSubmissions,
    dataSubmissionDelete
}

const styles = theme => ({
    wrapperDiv: {
        width: '96vw',
        margin: '24px auto'
    },

    panelSummaryText: {
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
    },

    preserveBackgroundWhenDisabled: {
        backgroundColor: 'rgba(0,0,0,.3) !important'
    },

    dialogRoot: {
        zIndex: `${z.HELP_DIALOG} !important`,
    },

    dialogPaper: {
        backgroundColor: colors.solidPaper
    },

    button: {
        textTransform: 'none',
        color: 'white'
    },


})

const initialFilterState = {
    'Awaiting admin action': true,
    'Awaiting QC2': true,
    'Awaiting user update': true,
    'Awaiting DOI': true,
    'Awaiting ingestion': true,
    'Complete': false
};

class AdminDashboard extends Component {

    constructor(props){
        super(props);

        let params = queryString.parse(this.props.location.search);
        let paramsIncludeFilterStates = Object.keys(params).some(e => initialFilterState[e] !== undefined);

        var search = new JsSearch.Search('Submission_ID');
        search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
        search.searchIndex = new JsSearch.UnorderedSearchIndex();
        search.addIndex('Dataset');
        search.addIndex('Name');
        search.addIndex('Dataset_Long_Name');

        if(props.dataSubmissions) search.addDocuments(props.dataSubmissions);

        let filters = Object.fromEntries(Object.keys(initialFilterState).map(e => [e, paramsIncludeFilterStates ? params[e] === 'true' : initialFilterState[e]]));

        this.state = {
            searchString: params.datasetName || '',
            search,
            expandedPanel: false,
            filters,
            modifiedDatasetID: null,
            deleteTarget: null
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
        this.props.history.push(`/datasubmission/admindashboard?${queryString.stringify(newFilterState)}`);
    }

    handleChangeSearchString = (e) => {
        this.setState({...this.state, searchString: e.target.value});
    }

    handleResetExpandedPanel = () => {
        this.setState({...this.state, expandedPanel: false});
    }

    handleSelectDeleteTarget = (submissionID) => {
        this.setState({...this.state, deleteTarget: submissionID})
    }

    handleCloseDeleteDialog = () => {
        this.setState({...this.state, deleteTarget: null});
    }

    handleConfirmDelete = () => {
        this.props.dataSubmissionDelete(this.state.deleteTarget);
        this.setState({...this.state, deleteTarget: null, expandedPanel: false});
    }

    render = () => {
        const { classes, dataSubmissions } = this.props;
        const { search, searchString, deleteTarget } = this.state;
        
        let submissions = searchString ? 
            search.search(searchString).filter(item => this.state.filters[item.Phase]) :
            dataSubmissions.filter(item => this.state.filters[item.Phase]);

        return (
            <div className={classes.wrapperDiv}>

                <Dialog 
                    onClose={this.handleCloseDeleteDialog} 
                    open={Boolean(deleteTarget)}
                    PaperProps={{
                        className: classes.dialogPaper
                    }}
                    classes={{
                        root: classes.dialogRoot
                    }}
                >
                    <DialogTitle>Deleting {deleteTarget ? deleteTarget.Dataset : ''}</DialogTitle>

                    <DialogContent>
                        This action will permanently delete all database records of this submission including references to all uploaded versions, and comments. Workbooks in dropbox
                        will not be affected.
                    </DialogContent>
                        
                    <DialogActions>
                        <Button
                            color='primary'
                            className={classes.button}
                            variant='outlined'
                            onClick={this.handleCloseDeleteDialog}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<Delete/>}
                            className={classes.button}
                            onClick={this.handleConfirmDelete}
                        >
                            Confirm Delete {deleteTarget ? deleteTarget.Dataset : ''} Forever
                        </Button>

                    </DialogActions>
                </Dialog>

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
                    {
                        Object.keys(initialFilterState).map(e => (
                            <FormControlLabel
                            key={e}
                            control={
                                <Checkbox
                                    checked={this.state.filters[e]}
                                    onChange={this.handleChangeFilter}
                                    name={e}
                                    color="primary"
                                />
                            }
                            label={e}
                            className={classes.filterFormControl}
                        />
                        ))
                    }
                      
                    </FormGroup>

                {submissions && submissions.length ?

                <React.Fragment>
                    <Accordion
                        disabled={true}
                        classes={{
                            disabled: classes.preserveBackgroundWhenDisabled
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'23%'}}>
                                Dataset Long Name
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                Dataset Short Name
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                Data Source
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                Submitter Name
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'12%'}}>
                                Submission Phase
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'10%'}}>
                                Date of Submission
                            </Typography>

                            <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'10%'}}>
                                Date of Ingestion
                            </Typography>
                        </AccordionSummary>
                    </Accordion>                  
                    {
                        submissions.map((e, i) => (
                            <Accordion 
                                expanded={this.state.expandedPanel === e.Submission_ID}
                                onChange={() => this.handleExpansion(e.Submission_ID)} 
                                key={i}
                                TransitionProps={{ unmountOnExit: true }}
                            >
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Tooltip title={e.Dataset_Long_Name} enterDelay={500}>
                                        <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'23%'}}>
                                            {e.Dataset_Long_Name}
                                        </Typography>
                                    </Tooltip>

                                    <Tooltip title={e.Dataset} enterDelay={500}>
                                        <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                            {e.Dataset}
                                        </Typography>
                                    </Tooltip>

                                    <Tooltip title={e.Data_Source} enterDelay={500}>
                                        <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                            {e.Data_Source}
                                        </Typography>
                                    </Tooltip>

                                    <Tooltip title={e.Name} enterDelay={500}>
                                        <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'15%'}}>
                                            {e.Name}
                                        </Typography>
                                    </Tooltip>
    
                                    <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'12%'}}>
                                        {e.Phase}
                                    </Typography>

                                    <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'10%'}}>
                                        {e.Start_Date_Time.slice(0,10)}
                                    </Typography>

                                    <Typography noWrap className={classes.panelSummaryText} style={{flexBasis:'10%'}}>
                                        {e.Ingestion_Date_Time ? e.Ingestion_Date_Time.slice(0,10) : 'NA'}
                                    </Typography>

                                </AccordionSummary>
                                
                                <AdminDashboardPanelDetails 
                                    submission={e} 
                                    handleResetExpandedPanel={this.handleResetExpandedPanel}
                                    handleSelectDeleteTarget={this.handleSelectDeleteTarget}
                                />
                            </Accordion>
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(AdminDashboard)));
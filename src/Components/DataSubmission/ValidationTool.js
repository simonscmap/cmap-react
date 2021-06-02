// Wrapper for data submission process

import React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from "react-router-dom";
import { withRouter } from "react-router";

import XLSX from 'xlsx';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button, Link, IconButton, Tooltip, List, ListItem, ListItemIcon, ListItemText, Divider, Tabs, Tab, Badge } from '@material-ui/core';
import { ErrorOutline, ArrowBack, ArrowForward, Done } from "@material-ui/icons";

import { uploadSubmission, retrieveMostRecentFile, storeSubmissionFile, checkSubmissionOptionsAndStoreFile, setUploadState } from '../../Redux/actions/dataSubmission';
import { snackbarOpen, setLoadingMessage } from '../../Redux/actions/ui';

import ValidationGrid from './ValidationGrid';
import LoginRequiredPrompt from '../User/LoginRequiredPrompt';
import DSCustomGridHeader from './DSCustomGridHeader';

import colors from '../../Enums/colors';

import formatDataSheet from '../../Utility/DataSubmission/formatDataSheet';
import formatDatasetMetadataSheet from '../../Utility/DataSubmission/formatDatasetMetadataSheet';
import formatVariableMetadataSheet from '../../Utility/DataSubmission/formatVariableMetadataSheet';
import generateAudits from '../../Utility/DataSubmission/generateAudits';
import workbookAudits from '../../Utility/DataSubmission/workbookAudits';
import auditReference from '../../Utility/DataSubmission/auditReference';

import states from '../../Enums/asyncRequestStates';

const mapStateToProps = (state, ownProps) => ({
    submissionFile: state.submissionFile,
    dataSubmissionSelectOptions: state.dataSubmissionSelectOptions,
    submissionUploadState: state.submissionUploadState,
    user: state.user
});

const mapDispatchToProps = {
    snackbarOpen,
    uploadSubmission,
    setLoadingMessage,
    retrieveMostRecentFile,
    storeSubmissionFile,
    checkSubmissionOptionsAndStoreFile
}

const styles = (theme) => ({

    input: {
        display: 'none'
    },

    button: {
        color: 'white',
        textTransform: 'none',
        display: 'block',
        maxWidth: '100px',
        margin: '12px auto 0px auto'
    },

    needHelp: {
        float: 'left',
        color: 'white',
        margin: '12px 0 0 12px',
        letterSpacing: 'normal'
    },

    needHelpLink: {
        letterSpacing: 'normal',
        color: theme.palette.primary.main,
        cursor: 'pointer'
    },

    fileSelectPaper: {
        margin: '70px auto 24px auto',
        maxWidth: '50vw',
        padding: '16px',        
        padding: '12px',
        whiteSpace: 'pre-wrap'
    },

    workbookAuditPaper: {
        margin: '70px auto 24px auto',
        maxWidth: '50vw',
        padding: '16px',        
        padding: '12px',
        minHeight: '110px',
        whiteSpace: 'pre-wrap',
        textAlign: 'left'
    },

    addBorder: {
        border: `1px dashed ${theme.palette.primary.main}`
    },

    chooseNewFileLabel: {
        display: 'inline',
        position: 'absolute',
        marginTop: '10px',
        marginLeft : '14px',
        fontSize: '11px',
        borderRadius: '2px',
        color: colors.primary,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,.2)'
        }
    },

    linkLabel: {
        color: colors.primary,
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,.2)'
        }
    },

    submitButton: {
        color: 'white',
        margin: '24px 0 12px 0',
        textTransform: 'none'
    },

    tabPaper: {
        maxWidth: '80vw',
        height: 'calc(100vh - 320px)',
        minHeight: '300px',
        margin: '0 auto 24px auto'
    },

    currentlyViewingTypography: {
        marginLeft: '4px'
    },

    ilb: {
        display: 'inline-block'
    },

    currentSectionSpan: {
        margin: '4px 8px 0 8px',
        width: '200px',
        display: 'inline-block'
    },

    divider: {
        margin: '8px 0'
    },

    workbookTab: {
        textTransform: 'none'
    },

    submittedTypography: {
        marginBottom: '12px'
    }

});

const _CleanupDummy = (props) => {
    React.useEffect(() => {
        return function cleanup() {
            props.setUploadState(null);
        };
    });

    return '';
}

const CleanupDummy = connect(null, {setUploadState})(_CleanupDummy);

const textAreaLookup = {
    var_keywords: 4,
    var_comment: 5,
    var_long_name: 3,
    dataset_references: 8,
    dataset_description: 14,
    dataset_acknowledgement: 8,
    cruise_names: 5,
    dataset_long_name: 3,
    dataset_history: 3,
    dataset_distributor: 3
};

const validationSteps = [
    {
        // before selecting file
    },

    {
        label: 'Workbook Validation',
        sheet: 'workbook'
    },

    {
        label: 'Data Sheet',
        sheet: 'data'
    },

    {
        label: 'Dataset Metadata Sheet',
        sheet: 'dataset_meta_data'
    },

    {
        label: 'Variable Metadata Sheet',
        sheet: 'vars_meta_data'
    },

    {
        label: 'Submission',
        sheet: 'submission'
    }
];

let orderedColumns = {
    data: ['time', 'lat', 'lon', 'depth'],
    dataset_meta_data: ['dataset_short_name', 'dataset_long_name', 'dataset_version', 'dataset_release_date', 'dataset_make', 'cruise_names', 'dataset_source', 'dataset_distributor', 'dataset_acknowledgement', //'contact_email'
    , 'dataset_doi', 'dataset_history', 'dataset_description', 'dataset_references', 'climatology'],
    vars_meta_data: ['var_short_name', 'var_long_name', 'var_unit', 'var_sensor', 'var_spatial_res', 'var_temporal_res', 'var_discipline', 'visualize',	'var_keywords', 'var_comment']
}

const generateSelectOptions = (reduxStoreOptions) => ({
    var_temporal_res: reduxStoreOptions.Temporal_Resolution,
    var_discipline: reduxStoreOptions.Study_Domain,
    var_sensor: reduxStoreOptions.Sensor,
    var_spatial_res: reduxStoreOptions.Spatial_Resolution,
    dataset_make: reduxStoreOptions.Make
});

const StyledBadgeRed = withStyles((theme) => ({
    badge: {
        right: -11,
        top: 1,
        backgroundColor: 'rgba(255, 0, 0, .6)'
    },
}))(Badge);

const StyledBadgeGreen = withStyles((theme) => ({
    badge: {
        right: -11,
        top: 1,
        backgroundColor: 'green'
    },
}))(Badge);

let fileSizeTooLargeDummyState = {
    auditReport: {
        workbook: {
            errors: ['This workbook exceeds the file size limit of this application. Please contact our data curation team at cmap-data-submission@uw.edu for assistance.'],
            warnings: []
        },
        data: [],
        dataset_meta_data: [],
        vars_meta_data: []
    },
    validationStep: 1,
};

// validationSteps:
// 1 - workbook,
// 2 - data,
// 3 - dataset metadata
// 4 - variable metadata
// 5 - submission

class ValidationTool extends React.Component {

    checkCellStyle = (params) => {
        let row = params.node.childIndex;
        let colId = params.column.colId; 
        let { sheet } = params.context;

        let styles = {};
        
        if(this.state.auditReport && this.state.auditReport[sheet] && this.state.auditReport[sheet][row] && this.state.auditReport[sheet][row][colId]){
            styles.boxShadow = 'inset 0 0 1px 1px rgba(255, 0, 0, .5)'
        }

        return styles;
    }

    state = {
        validationStep: 0,
        file: null,
        data: null,
        dataset_meta_data: null,
        vars_meta_data: null,
        auditReport: null,
        defaultColumnDef: {
            menuTabs: [],
            resizable: true,
            editable: true,
            cellStyle: this.checkCellStyle,
            cellEditor: 'DSCellEditor',
            width: 270,
            headerComponentFramework: DSCustomGridHeader
        }
    }

    handleGridSizeChanged = () => {
        if(this.state.validationStep === 2){
            this.gridApi.sizeColumnsToFit()
        }
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    auditCell = (value, col, row) => {
        let cellAudit = [];
        let auditFuncs = this.audits[col];
        
        if(auditFuncs){
            auditFuncs.forEach(func => {
                let result = func(value, row);
    
                if(result) {
                    cellAudit.push(result);
                }
            });
        }
   
        return cellAudit;
    }

    auditWorkbook = (params) => {
        return workbookAudits(params);
    }

    auditRows = (rows, sheet) => {
        let audit = [];
        rows.forEach((row, i) => {
            let rowAudit = {};

            let columns = auditReference[sheet];

            columns.forEach((col) => {
                let cellAudit = this.auditCell(row[col], col, i);

                if(cellAudit.length){
                    rowAudit[col] = cellAudit;
                }
            });

            if(Object.keys(rowAudit).length){
                audit[i] = rowAudit;
            }
        });

        return audit;
    }

    // Takes a workbook and returns an audit report
    performAudit = (workbook) => {
        let workbookAudit = this.auditWorkbook(workbook);
        if(workbookAudit.errors.length) return {
            workbook: workbookAudit,
            data: [],
            dataset_meta_data: [],
            vars_meta_data: []
        };

        let report = {
            workbook: workbookAudit,
            data: this.auditRows(workbook.data, 'data'),
            dataset_meta_data: this.auditRows(workbook.dataset_meta_data, 'dataset_meta_data'),
            vars_meta_data: this.auditRows(workbook.vars_meta_data, 'vars_meta_data'),
        };

        return report;
    }

    handleResetState = () => {
        this.props.storeSubmissionFile(null);
        this.props.history.push({ pathname: '/datasubmission/validationtool', query: {} });
        this.setState({
            ...this.state,
            data: null,
            dataset_meta_data: null,
            vars_meta_data: null,
            validationStep: 0
        });
    }

    handleChangeValidationStep = (validationStep) => {
        this.setState({...this.state, validationStep}, () => {
            if(this.gridApi && validationStep == 2) this.gridApi.sizeColumnsToFit()
        });
    }
    
    handleCellValueChanged = ({rowIndex, newValue, column, node, context, oldValue}) => {
        if(oldValue === newValue) return;

        let { sheet } = context;

        let newAudit = this.auditCell(newValue, column.colId, rowIndex);
        
        let auditReport = {...this.state.auditReport};

        if(!auditReport[sheet][rowIndex]) auditReport[sheet][rowIndex] = {};

        auditReport[sheet] = [...this.state.auditReport[sheet]];

        if(newAudit.length){
            auditReport[sheet][rowIndex][column.colId] = newAudit
        } else delete auditReport[sheet][rowIndex][column.colId];

        if(!Object.keys(auditReport[sheet][rowIndex]).length) {
            auditReport[sheet][rowIndex] = null;
        }

        let updated = [...this.state[sheet].slice(0, rowIndex), node.data, ...this.state[sheet].slice(rowIndex + 1)];
        this.setState({...this.state, [sheet]: updated, auditReport}, () => {
            this.gridApi.redrawRows();
        });
    }

    handleReadFile = (file) => {
        var reader = new FileReader();
        if(file.size > 150000000){
            this.setState({...this.state, ...fileSizeTooLargeDummyState}, () => this.props.setLoadingMessage(''));
            return;
        }
        
        reader.onload = (progressEvent) => {
            var readFile = new Uint8Array(progressEvent.target.result);
            var workbook = XLSX.read(readFile, {type: 'array'});
            let _data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval: null});
            let data = _data ? formatDataSheet(_data, workbook) : _data;

            let _dataset_meta_data = XLSX.utils.sheet_to_json(workbook.Sheets['dataset_meta_data'], {defval: null});
            let dataset_meta_data = _dataset_meta_data ? formatDatasetMetadataSheet(_dataset_meta_data, workbook) : _dataset_meta_data;
            
            let _vars_meta_data = XLSX.utils.sheet_to_json(workbook.Sheets['vars_meta_data'], {defval: null});
            let vars_meta_data = _vars_meta_data ? formatVariableMetadataSheet(_vars_meta_data) : _vars_meta_data;

            var auditReport = this.performAudit({workbook, data, dataset_meta_data, vars_meta_data});

            let validationStep = (auditReport.workbook.errors.length || auditReport.workbook.warnings.length) ? 1 : 2;
            this.setState({...this.state, data, dataset_meta_data, vars_meta_data, auditReport, validationStep}, () => this.props.setLoadingMessage(''));
        }

        reader.readAsArrayBuffer(file);        
    }

    handleDrop = (e) => {
        e.preventDefault();        
        var file = e.dataTransfer.items[0].getAsFile();
        this.props.setLoadingMessage('Reading Workbook');
        this.props.checkSubmissionOptionsAndStoreFile(file);
    }

    handleFileSelect = (e) => {
        var file = e.target.files[0];
        if(!file) return;
        this.props.setLoadingMessage('Reading Workbook');
        this.props.checkSubmissionOptionsAndStoreFile(file);
        e.target.value = null;
    }

    handleUploadSubmission = () => {
        let workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.data), 'data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.dataset_meta_data), 'dataset_meta_data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.vars_meta_data), 'vars_meta_data');
        let wbArray = XLSX.write(workbook, {bookType:'xlsx', type:'array'});
        let file = new Blob([wbArray]);
        file.name = `${this.state.dataset_meta_data[0].dataset_short_name}.xlsx`;
        this.props.uploadSubmission({
            file, 
            datasetName: this.state.dataset_meta_data[0].dataset_short_name,
            dataSource: this.state.dataset_meta_data[0].dataset_source,
            datasetLongName: this.state.dataset_meta_data[0].dataset_long_name
        });
    }

    handleDownload = () => {
        this.props.setLoadingMessage('Downloading');
        setTimeout(() => {
            window.requestAnimationFrame(() => this.props.setLoadingMessage(''));
        }, 50)
        let workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.data), 'data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.dataset_meta_data), 'dataset_meta_data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.vars_meta_data), 'vars_meta_data');
        XLSX.writeFile(workbook, this.state.dataset_meta_data[0].dataset_short_name + '.xlsx');
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        if(this.state.validationStep === 2) this.gridApi.sizeColumnsToFit();
    }

    onModelUpdated = (params) => {
        if(this.gridApi && validationSteps[this.state.validationStep].sheet === 'data'){
            this.gridApi.sizeColumnsToFit();
        }
    }

    scrollGridTo = (index) => {
        this.gridApi.ensureIndexVisible(index, 'middle')
    }

    //TODO clean this up when it's not late at night
    handleFindNext = () => {
        let lastFocused = this.gridApi.getFocusedCell();
        let { sheet } = validationSteps[this.state.validationStep];
        let { auditReport } = this.state;
        
        let cols = orderedColumns[sheet];
        var startRow = lastFocused ? lastFocused.rowIndex : -1;
        var startColIndex = lastFocused ? cols.findIndex(e => e === lastFocused.column.colId) : 0;

        // Search the remaining columns in focused row
        if(lastFocused){
            for(let i = startColIndex + 1; i < cols.length && i > -1; i++){
                if(auditReport[sheet][startRow] && auditReport[sheet][startRow][cols[i]]){
                    this.gridApi.ensureColumnVisible(cols[i]);
                    this.gridApi.startEditingCell({
                        rowIndex: startRow,
                        colKey: cols[i]
                    });
                    return;
                }
            }
        }

        // Start from startRow + 1, end at beginning of startRow
        for(let i = startRow + 1; i != startRow; i++){
            if(auditReport[sheet][i]){
                for(let j = 0; j < cols.length; j++){
                    if(auditReport[sheet][i][cols[j]]){
                        this.gridApi.ensureColumnVisible(cols[j]);
                        this.gridApi.startEditingCell({
                            rowIndex: i,
                            colKey: cols[j]
                        });
                        return;
                    }
                }
            }

            if(i === auditReport[sheet].length) i = -1;
        }

        // Search the rest of start row
        if(lastFocused){
            for(let i = 0; i <= startColIndex && i < cols.length; i++){
                if(auditReport[sheet][startRow] && auditReport[sheet][startRow][cols[i]]){
                    this.gridApi.ensureColumnVisible(cols[i]);
                    this.gridApi.startEditingCell({
                        rowIndex: startRow,
                        colKey: cols[i]
                    });
                    return;
                }
            }
        }
    }

    countErrors = () => {
        let counts = {
            workbook: this.state.auditReport.workbook.errors.length,
            data: 0,
            dataset_meta_data: 0,
            vars_meta_data: 0
        };        

        this.state.auditReport['data'].forEach(e => {
            if(e){
                counts.data += Object.keys(e).length;
            }
        })

        this.state.auditReport['dataset_meta_data'].forEach(e => {
            if(e){
                counts.dataset_meta_data += Object.keys(e).length;
            }
        })

        this.state.auditReport['vars_meta_data'].forEach(e => {
            if(e){
                counts.vars_meta_data += Object.keys(e).length;
            }
        })

        return counts;
    }

    handleClickTab = (event, newValue) => {
        this.setState({...this.state, validationStep: newValue});
    }

    componentDidMount = () => {
        let submissionID = new URLSearchParams(window.location.search).get('submissionID');
        if(submissionID){
            this.props.retrieveMostRecentFile(submissionID);
        }
    }

    componentWillUnmount = () => {
        this.props.storeSubmissionFile(null);
    }

    componentDidUpdate = (prevProps, prevState) => {
        if((!prevProps.dataSubmissionSelectOptions && this.props.dataSubmissionSelectOptions) || (!this.audits && this.props.dataSubmissionSelectOptions) || (prevProps.dataSubmissionSelectOptions !== this.props.dataSubmissionSelectOptions && this.props.dataSubmissionSelectOptions)){
            this.audits = generateAudits(this.props.dataSubmissionSelectOptions);
        }
        if(prevProps.submissionFile !== this.props.submissionFile && this.props.submissionFile){
            this.handleReadFile(this.props.submissionFile);
        }

    }

    render = () => {
        if(!this.props.user) return <LoginRequiredPrompt/>

        const { classes } = this.props;
        const { validationStep } = this.state;

        const datasetName = this.state.dataset_meta_data && this.state.dataset_meta_data.length ? this.state.dataset_meta_data[0].dataset_short_name : null;

        const sheet = validationSteps[validationStep].sheet;

        var errorCount;

        if(validationStep > 0 && validationStep < 5){
            errorCount = this.countErrors();
        }
        
        const preventSubmission = Boolean(
            validationStep >= 5 || 
            (validationStep === 1 && errorCount.workbook) ||
            (validationStep === 4 && (
                errorCount.data > 0 || 
                errorCount.dataset_meta_data > 0 ||
                errorCount.vars_meta_data > 0
            ))
        )

        const forwardArrowTooltip = validationStep === 0 || validationStep >= 5 ? '' :
            (errorCount.data > 0 || errorCount.dataset_meta_data > 0 || errorCount.vars_meta_data > 0) && validationStep === 4 ?
            'Please Correct Errors to Proceed' :
            'Next Section';

        const hideSelectDifferentFile = validationStep >= 5;

        return (
            <React.Fragment>

                <Typography className={classes.needHelp}>
                    Need help? 
                    <Link 
                        href='https://github.com/simonscmap/DBIngest/raw/master/template/datasetTemplate.xlsx' 
                        download='datasetTemplate.xlsx' 
                        className={classes.needHelpLink}
                    >
                        &nbsp;Download
                    </Link>
                    &nbsp;a blank template, or view the <Link className={classes.needHelpLink} component={RouterLink} to='/datasubmission/guide'>Data Submission Guide</Link>.
                </Typography>

                <Paper elevation={2} className={`${classes.fileSelectPaper} ${!this.props.submissionFile && classes.addBorder}`} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
                    {
                        this.props.submissionFile ?
                        <React.Fragment>

                            <Typography variant='h6' className={classes.currentlyViewingTypography}>

                                {datasetName ? `${datasetName}` : 'Dataset Short Name Not Found'}
                                { hideSelectDifferentFile ? '' :
                                    <>
                                        <label htmlFor="select-file-input" className={classes.chooseNewFileLabel}>
                                            Select a Different File
                                        </label> {'\n'}
                                    </>
                                }
                            </Typography>

                            <div>
                                <Tooltip title='Previous Section'>
                                    <div className={classes.ilb}>
                                        <IconButton 
                                            size='small'
                                            onClick={() => this.handleChangeValidationStep(this.state.validationStep - 1)}
                                            disabled={Boolean(this.state.validationStep <= 1)}
                                        >
                                            <ArrowBack/>
                                        </IconButton>
                                    </div>
                                </Tooltip>

                                <span className={classes.currentSectionSpan}>{validationSteps[validationStep].label}</span>

                                <Tooltip title= {forwardArrowTooltip}>
                                    <div className={classes.ilb}>
                                        <IconButton 
                                            size='small'
                                            onClick={() => this.handleChangeValidationStep(this.state.validationStep + 1)}
                                            disabled={preventSubmission}
                                        >
                                            <ArrowForward/>
                                        </IconButton>
                                    </div>
                                </Tooltip>
                            </div>
                        </React.Fragment>

                        :

                        <React.Fragment>
                            <Typography variant='h5'>
                                To begin drag or 

                                <label htmlFor="select-file-input">
                                    <Button variant='contained' color="primary" component="span" className={classes.button}>
                                        Select File
                                    </Button>
                                </label>                                
                            </Typography>

                            
                        </React.Fragment>
                    }

                    {
                        (validationStep > 1 && validationStep < 5) &&
                        <React.Fragment>
                            <Divider className={classes.divider}/>
                            {
                                Boolean(errorCount[sheet] > 0) ?

                                <Typography variant='body2'>
                                    <ErrorOutline style={{color: 'rgba(255, 0, 0, .7)', margin: '0 2px -5px 0', fontSize: '1.4em'}}/> 
                                    We found {errorCount[sheet]} cell{errorCount[sheet] > 1 ? 's' : ''} with errors on this sheet. 
                                    <span className={classes.linkLabel} onClick={this.handleFindNext}> Find Errors</span>
                                </Typography>

                                :

                                Boolean(sheet === 'vars_meta_data' && (errorCount['data'] || errorCount['dataset_meta_data'])) ?

                                <Typography variant='body2'>
                                    <ErrorOutline style={{color: 'rgba(255, 0, 0, .7)', margin: '0 2px -5px 0', fontSize: '1.4em'}}/> 
                                    Please correct errors from the previous sheets before moving forward. 
                                </Typography>
                                
                                :
                                
                                <Typography variant='body2'>
                                    <Done style={{color: colors.primary, margin: '0 2px -5px 0', fontSize: '1.4em'}}/>All set! Click the arrow above to move to the next step.
                                </Typography>
                            }
                        </React.Fragment>
                    }
                </Paper>

                {Boolean(validationStep === 1) &&
                    <Paper elevation={2} className={`${classes.workbookAuditPaper}`}>
                        <Typography style={{marginBottom: '24px'}}>
                            {
                                Boolean(this.state.auditReport.workbook.errors.length) &&

                                <React.Fragment>
                                    One or more parts of your submission did not match CMAP's requirements. 
                                    Please review the information below, update your workbook, 
                                    and <label className={classes.linkLabel} htmlFor='select-file-input'>try again</label>.
                                </React.Fragment>
                            }

                            {
                                Boolean(!this.state.auditReport.workbook.errors.length && this.state.auditReport.workbook.warnings.length) &&
                                'We found some potential issues with your submission.'
                            }

                            {
                                Boolean(this.state.auditReport.workbook.warnings.length) &&
                                    <React.Fragment>
                                        {'\n'}
                                        {'\n'}
                                        Messages marked with a yellow icon
                                        <ErrorOutline style={{color: 'rgba(255, 255, 0, .7)', fontSize: '18px', margin: '0 3px -4px 3px'}}/>
                                        are warnings. These should be reviewed and corrected if necessary, but will not prevent you 
                                        from moving to the next validation step.
                                    </React.Fragment>
                            }
                        </Typography>

                        {

                        <List dense={true}>
                            {
                                this.state.auditReport.workbook.errors.map((e,i) => (
                                    <ListItem key={i}>
                                        <ListItemIcon style={{color: 'rgba(255, 0, 0, .7)'}}>
                                            <ErrorOutline/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={e}
                                        />
                                    </ListItem>
                                ))
                            }

                            {
                                this.state.auditReport.workbook.warnings.map((e,i) => (
                                    <ListItem key={i}>
                                        <ListItemIcon style={{color: 'rgba(255, 255, 0, .7)'}}>
                                            <ErrorOutline/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={e}
                                        />
                                    </ListItem>
                                    ))
                            }
                            
                        </List>
                        }
                    </Paper>
                }

                {Boolean((this.state.data && this.state.data.length) && (validationStep >= 2 && validationStep < 5)) &&
                    <React.Fragment>

                        <Paper elevation={2} className={classes.tabPaper + " ag-theme-material"}>
                            <Tabs value={validationStep} onChange={this.handleClickTab}>
                                <Tab 
                                    value={2}
                                    label={ 
                                        errorCount['data'] > 0 ?
                                        <StyledBadgeRed badgeContent={errorCount['data']}>Data</StyledBadgeRed>
                                        :                              
                                        <StyledBadgeGreen badgeContent={'\u2713'}>Data</StyledBadgeGreen>
                                    } 
                                    className={classes.workbookTab}
                                />

                                <Tab 
                                    value={3}
                                    label={ 
                                        errorCount['dataset_meta_data'] > 0 ?
                                        <StyledBadgeRed badgeContent={errorCount['dataset_meta_data']}>Dataset Metadata</StyledBadgeRed>
                                        :                              
                                        <StyledBadgeGreen badgeContent={'\u2713'}>Dataset Metadata</StyledBadgeGreen>
                                    } 
                                    className={classes.workbookTab}
                                />

                                <Tab 
                                    value={4}
                                    label={ 
                                        errorCount['vars_meta_data'] > 0 ?
                                        <StyledBadgeRed badgeContent={errorCount['vars_meta_data']}>Variable Metadata</StyledBadgeRed>
                                        :                              
                                        <StyledBadgeGreen badgeContent={'\u2713'}>Variable Metadata</StyledBadgeGreen>
                                    } 
                                    className={classes.workbookTab}
                                />
                            </Tabs>

                            <div style={{height: 'calc(100% - 48px)'}}>
                                <ValidationGrid
                                    onGridReady={this.onGridReady}
                                    rowData={this.state[sheet]}
                                    defaultColumnDef={this.state.defaultColumnDef}
                                    handleCellValueChanged={this.handleCellValueChanged}
                                    handleGridSizeChanged={this.handleGridSizeChanged}
                                    gridContext={{
                                        sheet, 
                                        getAuditReport: () => this.state.auditReport, 
                                        textAreaLookup, 
                                        selectOptions: generateSelectOptions(this.props.dataSubmissionSelectOptions),
                                        auditCell: this.auditCell
                                    }}
                                    onModelUpdated={this.onModelUpdated}
                                />
                            </div>
                        </Paper>
                    </React.Fragment>
                }

                {Boolean(validationStep === 5) && 
                    <Paper elevation={2} className={`${classes.fileSelectPaper}`}>
                        <CleanupDummy/>                        
                        {
                            this.props.submissionUploadState === states.succeeded ?
                                <React.Fragment>
                                    <Typography className={classes.submittedTypography}>
                                        Your dataset has been successfully submitted, and will be reviewed by our data curation team.
                                    </Typography>

                                    <Typography className={classes.submittedTypography}>
                                        You can view the status of your submission <Link style={{display: 'inline-block'}} className={classes.needHelpLink} component={RouterLink} to={`/datasubmission/userdashboard?datasetName=${encodeURI(datasetName)}`}>here</Link>.
                                    </Typography>

                                    <Typography className={classes.submittedTypography}>                                    
                                        If you made any changes during this process you can download the edited workbook <Link style={{display: 'inline-block'}} className={classes.needHelpLink} onClick={this.handleDownload} component='span'>here</Link>.
                                    </Typography>

                                    <Typography className={classes.submittedTypography}>
                                        A detailed description of remaining steps in the submission process can be found in the <Link style={{display: 'inline-block'}} className={classes.needHelpLink} component={RouterLink} to='/datasubmission/guide'>Data Submission Guide</Link>.
                                    </Typography>

                                    <Typography className={classes.submittedTypography}>
                                        To start over and submit another dataset click <Link style={{display: 'inline-block'}} className={classes.needHelpLink} onClick={() =>this.handleResetState()} component='span'>here</Link>.
                                    </Typography>
                                </React.Fragment>

                            :

                            this.props.submissionUploadState === states.failed ?

                            <React.Fragment>
                                <List>
                                    <ListItem>
                                        <ListItemIcon style={{color: 'rgba(255, 0, 0, .7)'}}>
                                            <ErrorOutline/>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="A dataset with this name has already been submitted by another user. If you believe you're receiving this message in error please contact us at cmap-data-submission@uw.edu."
                                        />

                                    <Typography className={classes.submittedTypography}>
                                        To start over and submit another dataset click <Link style={{display: 'inline-block'}} className={classes.needHelpLink} onClick={() =>this.handleResetState()} component='span'>here</Link>.
                                    </Typography>
                                    </ListItem>
                                </List>
                                    
                                <Typography className={classes.submittedTypography}>                                    
                                    If you made any changes during this process you can download the edited workbook <Link style={{display: 'inline-block'}} className={classes.needHelpLink} onClick={this.handleDownload} component='span'>here</Link>.
                                </Typography>

                            </React.Fragment>

                            :

                            <React.Fragment>
                                <Typography>
                                    You've completed dataset validation! Click the button below to upload your workbook.
                                </Typography>

                                <Button variant='contained' color='primary' className={classes.submitButton} onClick={this.handleUploadSubmission}>
                                    Submit
                                </Button>
                            </React.Fragment>
                        }
                    </Paper>
                }
                <input
                    onChange={this.handleFileSelect}
                    className={classes.input}
                    accept='.xlsx'
                    id="select-file-input"
                    type="file"
                />
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(ValidationTool)));

//Undo / redo
// https://www.ag-grid.com/javascript-grid-undo-redo-edits/


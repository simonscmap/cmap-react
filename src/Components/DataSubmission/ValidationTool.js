import React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from "react-router-dom";
import { withRouter } from "react-router";

import XLSX from 'xlsx';

import { withStyles } from '@material-ui/core/styles';
import { Typography, Paper, Button, Link, IconButton, Tooltip } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from "@material-ui/icons";

import { Close } from '@material-ui/icons';

import { uploadSubmission, retrieveMostRecentFile, storeSubmissionFile } from '../../Redux/actions/dataSubmission';
import { snackbarOpen, setLoadingMessage } from '../../Redux/actions/ui';

import dataSubmissionAudit from '../../Utility/DataSubmission/dataSubmissionAudit';
import ErrorNavigator from './ErrorNavigator';

import ValidationGrid from './ValidationGrid';

import checkCell from '../../Utility/DataSubmission/checkCell';
import formatDataSheet from '../../Utility/DataSubmission/formatDataSheet';
import formatDatasetMetadataSheet from '../../Utility/DataSubmission/formatDatasetMetadataSheet';

const mapStateToProps = (state, ownProps) => ({
    submissionFile: state.submissionFile
});

const mapDispatchToProps = {
    snackbarOpen,
    uploadSubmission,
    setLoadingMessage,
    retrieveMostRecentFile,
    storeSubmissionFile
}

const styles = (theme) => ({
    paper: {
        width: '40vw',
        // height: '30vh',
        margin:'40px auto'
    },

    dragTarget: {
        border: '1px solid red',
        width: '100px',
        height: '100px',
        margin:'40px auto'
    },

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
        color: theme.palette.primary.main
    },

    fileSelectPaper: {
        margin: '80px auto 24px auto',
        maxWidth: '50vw',
        padding: '16px',        
        padding: '12px'
    },

    addBorder: {
        border: `1px dashed ${theme.palette.primary.main}`
    },

    fileName: {
        color: theme.palette.primary.main,
        letterSpacing: 'normal'
    },

    clearFileIcon: {
        float: 'right',
        marginTop: '-12px',
        marginRight: '-8px'
    },

    dataTable: {
        maxWidth: '80vw',
        margin: '0 auto 24px auto'
    },

    tableWrapper: {
        maxWidth: '80vw',
        margin: '24px auto'
    },

    submitButton: {
        color: 'white'
    },

    tabPaper: {
        maxWidth: '80vw',
        height: '80vh',
        margin: '0 auto 24px auto'
    },

    errorStepperPaper: {
        width: '80vw',
        margin: '0 auto 24px auto'
    },

    currentlyViewingTypography: {
        letterSpacing: 'normal'
    },

    ilb: {
        display: 'inline-block'
    },

    findNextButton: {
        textTransform: 'none',
        marginBottom: '12px'
    }

});

const textAreaLookup = {
    var_keywords: 4,
    var_comment: 5,
    var_long_name: 3,
    dataset_references: 8,
    dataset_description: 14,
    dataset_acknowledgement: 8,
    'official_cruise_name(s)': 5,
    dataset_long_name: 3,
    dataset_history: 3,
    dataset_distributor: 3
};

const selectOptions = {
    var_temporal_res: [
        'Three Minutes',
        'Six Hourly',
        'Daily',
        'Weekly',
        'Monthly',
        'Annual',
        'Irregular',
        'Monthly Climatology',
        'Three Days',
        'Eight Day Running',
        'Eight Days',
        'One Second'
    ],

    var_discipline: [
        'Physics', 
        'Chemistry', 
        'Biology', 
        'Biogeochemistry', 
        'Physics+Biogeochemistry', 
        'Chemistry+Biology+Biogeochemistry', 
        'Biosample', 
        'Biology+BioGeoChemistry+Biogeography', 
        'Physics+Chemistry', 
        'Genomics', 
        'Chemistry+Biogeochemistry'
    ],

    var_sensor: [
        'Satellite', 
        'In-Situ', 
        'Blend', 
        'Flow Cytometry', 
        'CTD', 
        'Underway CTD', 
        'Optical', 
        'Float', 
        'Drifter', 
        'AUV', 
        'Bottle', 
        'Sediment Trap', 
        'CPR', 
        'Towfish', 
        'fluorometer', 
        'Seaglider'
    ],

    var_spatial_res: [
        'Irregular',
        '1/2° X 1/2°',
        '1/4° X 1/4°',
        '1/25° X 1/25°',
        '4km X 4km',
        '1/12° X 1/12°',
        '70km X 70km',
        '1° X 1°',
        '9km X 9km',
        '25km X 25km'
    ],

    dataset_make: [
        'Observation', 
        'Model', 
        'Assimilation'
    ]
    
};

const validationSteps = [
    {
        // before selecting file?
    },

    {
        label: 'Data',
        sheet: 'data'
    },

    {
        label: 'Dataset Metadata',
        sheet: 'dataset_meta_data'
    },

    {
        label: 'Variable Metadata',
        sheet: 'vars_meta_data'
    },
]

class ValidationTool extends React.Component {

    checkCellStyle = (params) => {
        let row = params.node.childIndex;
        let colId = params.column.colId; 
        let { sheet } = params.context;

        let styles = {
            //TODO fix view of long strings as below but better
            // whiteSpace: 'pre-wrap !important',
            // paddingLeft: '10px',
            // paddingRight: '10px',
            // overflow: 'visible'
        };
        
        if(this.state.auditReport && this.state.auditReport[sheet] && this.state.auditReport[sheet][row] && this.state.auditReport[sheet][row][colId]){
            styles.boxShadow = 'inset 0 0 3px 2px rgba(255, 0, 0, .5)'
        }

        return styles;
    }

    state = {
        validationStep: 0,
        file: null,
        data: null,
        dataset_meta_data: null,
        vars_meta_data: null,
        errorIndex: 0,
        auditReport: null,
        defaultColumnDef: {
            menuTabs: [],
            resizable: true,
            editable: true,
            cellStyle: this.checkCellStyle,
            cellEditor: 'DSCellEditor',
            width: 270
        }
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleResetState = () => {
        this.props.storeSubmissionFile(null);
        this.props.history.push({ pathname: '/datasubmission/validationtool', query: {} });
        this.setState({
            ...this.state,
            data: null,
            dataset_meta_data: null,
            vars_meta_data: null,
            errorIndex: 0
        });
        //TODO track first and last row ?
    }

    handleChangeValidationStep = (validationStep) => {
        this.setState({...this.state, validationStep}, this.gridApi.sizeColumnsToFit());
    }
    
    handleCellValueChanged = ({rowIndex, newValue, column, node, context}) => {
        let { sheet } = context;

        let newAudit = checkCell(newValue, column.colId);
        
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

        reader.onload = (file) => {
            var readFile = new Uint8Array(file.target.result);
            var workbook = XLSX.read(readFile, {type: 'array'});
            
            if(!workbook.Sheets['data']){
                this.props.snackbarOpen('Unable to parse file. Missing sheet "data"');
                this.handleResetState();
            } 
            
            else if (!workbook.Sheets['dataset_meta_data']) {
                this.props.snackbarOpen('Unable to parse file. Missing sheet "dataset_meta_data"');
                this.handleResetState();
            } 
            
            else if(!workbook.Sheets['dataset_meta_data']){
                this.props.snackbarOpen('Unable to parse file. Missing sheet "dataset_meta_data"');
                this.handleResetState();
            }

            else {
                let _data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {defval: null});
                let data = formatDataSheet(_data, workbook);

                let _dataset_meta_data = XLSX.utils.sheet_to_json(workbook.Sheets['dataset_meta_data'], {defval: null});
                let dataset_meta_data = formatDatasetMetadataSheet(_dataset_meta_data, workbook);

                let vars_meta_data = XLSX.utils.sheet_to_json(workbook.Sheets['vars_meta_data'], {defval: null});

                var auditReport = dataSubmissionAudit({data, dataset_meta_data, vars_meta_data});

                this.setState({...this.state, data, dataset_meta_data, vars_meta_data, auditReport, validationStep: 1});
            }
        }

        setTimeout(() => {
            window.requestAnimationFrame(() => this.props.setLoadingMessage(''));
        }, 50)

        reader.readAsArrayBuffer(file);        
    }

    handleDrop = (e) => {
        e.preventDefault();        
        var file = e.dataTransfer.items[0].getAsFile();
        this.props.setLoadingMessage('Reading Workbook');
        this.props.storeSubmissionFile(file);
    }

    handleFileSelect = (e) => {
        var file = e.target.files[0];
        this.props.setLoadingMessage('Reading Workbook');
        this.props.storeSubmissionFile(file);
    }

    handleClearState = () => {
        this.setState({})
    }

    handleUploadSubmission = () => {
        let workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.data), 'data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.dataset_meta_data), 'dataset_meta_data');
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(this.state.vars_meta_data), 'vars_meta_data');

        let wbArray = XLSX.write(workbook, {bookType:'xlsx', type:'array'});
        let file = new File([wbArray], `${this.state.dataset_meta_data[0].dataset_short_name}.xlsx`);
        this.props.uploadSubmission(file);
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;
        this.gridApi.sizeColumnsToFit();
    }

    onModelUpdated = (params) => {
        if(this.gridApi && validationSteps[this.state.validationStep].sheet === 'data'){
            this.gridApi.sizeColumnsToFit();
        }
    }

    scrollGridTo = (index) => {
        this.gridApi.ensureIndexVisible(index, 'middle')
    }
  
    // onGridSizeChanged = (params) => {
    //   this.gridApi.sizeColumnsToFit();
    // }

    stepForward = () => {
        let errors = Object.values(this.state.auditReport.data.errors);
        this.setState({...this.state, errorIndex: this.state.errorIndex + 1});
        this.scrollGridTo(errors[this.state.errorIndex + 1].row);
    }

    stepBackward = () => {
        let errors = Object.values(this.state.auditReport.data.errors);
        this.setState({...this.state, errorIndex: this.state.errorIndex - 1});
        this.scrollGridTo(errors[this.state.errorIndex - 1].row);
    }

    handleFindNext = () => {
        let lastFocused = this.gridApi.getFocusedCell();
        let { sheet } = validationSteps[this.state.validationStep];
        let { auditReport } = this.state;
        
        let start = lastFocused ? lastFocused.rowIndex : 0;
        let end = start === 0 ? auditReport[sheet].length : start - 1;

        for(let i = start; i !== end; i++){
            if(auditReport[sheet][i]){
                let keys = Object.keys(auditReport[sheet][i]);
                this.gridApi.ensureColumnVisible(keys[0]);
                this.gridApi.startEditingCell({
                    rowIndex: i,
                    colKey: keys[0]
                })
                return;
            }

            if(i === auditReport[sheet].length) {
                i = -1;
            }
        }

        this.props.snackbarOpen(`Found no errors in ${sheet}`);
    }

    componentDidMount = () => {
        let submissionID = new URLSearchParams(window.location.search).get('submissionID');
        if(submissionID){
            this.props.retrieveMostRecentFile(submissionID);
        }
    }

    componentDidUpdate = (prevProps, prevState) => {
        if(prevProps.submissionFile !== this.props.submissionFile && this.props.submissionFile !== null){
            this.handleReadFile(this.props.submissionFile);
        }
    }

    render = () => {
        const { classes } = this.props;
        const { validationStep } = this.state;

        const sheet = validationSteps[validationStep].sheet;

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

                <Paper className={`${classes.fileSelectPaper} ${!this.state.file && classes.addBorder}`} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
                    {
                        this.props.submissionFile ?
                        <React.Fragment>
                            <IconButton className={classes.clearFileIcon} color="inherit" onClick={this.handleResetState} disableFocusRipple disableRipple>
                                <Close/>
                            </IconButton>

                            <Typography className={classes.currentlyViewingTypography}>
                                Currently viewing: <span className={classes.fileName}>{this.props.submissionFile.name}</span>
                            </Typography>

                            <Typography className={classes.currentlyViewingTypography}>
                                {validationSteps[validationStep].label}
                            </Typography>

                            <Tooltip title='Previous Sheet'>
                                <div className={classes.ilb}>
                                    <IconButton 
                                        size='small'
                                        onClick={() => this.handleChangeValidationStep(this.state.validationStep - 1)}
                                        disabled={Boolean(this.state.validationStep <= 1)}
                                    >
                                        <ChevronLeft />
                                    </IconButton>
                                </div>
                            </Tooltip>

                            <Tooltip title='Next Sheet'>
                                <div className={classes.ilb}>
                                    <IconButton 
                                        size='small'
                                        onClick={() => this.handleChangeValidationStep(this.state.validationStep + 1)}
                                        disabled={Boolean(this.state.validationStep >= 3)}
                                    >
                                        <ChevronRight/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                                
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

                            <input
                                onChange={this.handleFileSelect}
                                className={classes.input}
                                accept='.xlsx'
                                id="select-file-input"
                                type="file"
                            />
                        </React.Fragment>
                    }
                </Paper>

                {/* { Boolean(auditReport) && */}
                {
                    Boolean(this.state.data) &&
                    <React.Fragment>
                        
                        {/* <ErrorNavigator
                            errors={auditReport.data}
                            errorIndex={errorIndex}
                            stepForward={this.stepForward}
                            stepBackward={this.stepBackward}
                        /> */}
                        <Button 
                            variant='contained' 
                            onClick={this.handleFindNext} 
                            color='primary' 
                            className={classes.findNextButton}
                        >
                            Find Errors
                        </Button>

                        <Paper className={classes.tabPaper + " ag-theme-material"}>

                            {Boolean(this.state.data && this.state.data.length) &&
                                <ValidationGrid
                                    onGridReady={this.onGridReady}
                                    rowData={this.state[sheet]}
                                    defaultColumnDef={this.state.defaultColumnDef}
                                    // onGridSizeChanged={this.onGridSizeChanged}      
                                    handleCellValueChanged={this.handleCellValueChanged}
                                    gridContext={{sheet, auditReport: this.state.auditReport, textAreaLookup, selectOptions}}
                                    onModelUpdated={this.onModelUpdated}
                                />                            
                            }

                        </Paper>
                    </React.Fragment>

                }

                    <Button variant='contained' color='primary' className={classes.submitButton} onClick={this.handleUploadSubmission}>
                        Submit
                    </Button>

            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(ValidationTool)));

// startEditingCell(params): Starts editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. Parameters are as follows:
// rowIndex: The row index of the row to start editing.
// colKey: The column key of the column to start editing.
// rowPinned: Set to 'top' or 'bottom' to started editing a pinned row.
// keyPress, charPress: The keyPress and charPress that are passed to the cell editor.

//Undo / redo
// https://www.ag-grid.com/javascript-grid-undo-redo-edits/
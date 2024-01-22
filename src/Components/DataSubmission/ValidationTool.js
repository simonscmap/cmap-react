// Wrapper for data submission process

import React from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { withRouter } from 'react-router';

import XLSX from 'xlsx';

import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  Paper,
  Button,
  Link,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Badge,
} from '@material-ui/core';
import {
  ErrorOutline,
  ArrowBack,
  ArrowForward,
  Done,
} from '@material-ui/icons';

import {
  uploadSubmission,
  retrieveMostRecentFile,
  storeSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
  setUploadState,
} from '../../Redux/actions/dataSubmission';
import { snackbarOpen, setLoadingMessage } from '../../Redux/actions/ui';
import Section, { FullWidthContainer } from '../Common/Section';

import Header from './ValidationToolHeader';
import Navigation from './ValidationToolNavigation';
import ErrorStatus from './ValidationToolErrorStatus';
import Step1 from './ValidationToolStep1';
import messages from './Messages';

import ValidationGrid from './ValidationGrid';
import ValidationGridColumns from './ValidationGridColumns';
import LoginRequiredPrompt from '../User/LoginRequiredPrompt';
import DSCustomGridHeader from './DSCustomGridHeader';

import colors from '../../enums/colors';
import { colors as newColors } from '../Home/theme';
import styles from './ValidationToolStyles';

import formatDataSheet from '../../Utility/DataSubmission/formatDataSheet';
import formatDatasetMetadataSheet from '../../Utility/DataSubmission/formatDatasetMetadataSheet';
import formatVariableMetadataSheet from '../../Utility/DataSubmission/formatVariableMetadataSheet';
import generateAudits from '../../Utility/DataSubmission/generateAudits';
import workbookAudits from '../../Utility/DataSubmission/workbookAudits';
import auditReference from '../../Utility/DataSubmission/auditReference';

import {
  textAreaLookup,
  validationSteps,
  orderedColumns,
  fileSizeTooLargeDummyState,
} from './ValidationToolConstants';

import states from '../../enums/asyncRequestStates';

const mapStateToProps = (state, ownProps) => ({
  submissionFile: state.submissionFile,
  dataSubmissionSelectOptions: state.dataSubmissionSelectOptions,
  submissionUploadState: state.submissionUploadState,
  user: state.user,
});

const mapDispatchToProps = {
  snackbarOpen,
  uploadSubmission,
  setLoadingMessage,
  retrieveMostRecentFile,
  storeSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
};

const _CleanupDummy = (props) => {
  React.useEffect(() => {
    return function cleanup() {
      props.setUploadState(null);
    };
  });
  return '';
};

const CleanupDummy = connect(null, { setUploadState })(_CleanupDummy);

const generateSelectOptions = (reduxStoreOptions) => ({
  var_temporal_res: reduxStoreOptions.Temporal_Resolution,
  var_discipline: reduxStoreOptions.Study_Domain,
  var_sensor: reduxStoreOptions.Sensor,
  var_spatial_res: reduxStoreOptions.Spatial_Resolution,
  dataset_make: reduxStoreOptions.Make,
});

const StyledBadgeRed = withStyles((theme) => ({
  badge: {
    right: -11,
    top: 1,
    backgroundColor: 'rgba(255, 0, 0, .6)',
  },
}))(Badge);

const StyledBadgeGreen = withStyles((theme) => ({
  badge: {
    right: -11,
    top: 1,
    backgroundColor: 'green',
  },
}))(Badge);


const getColumns = (sheet, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (sheet === 'dataset_meta_data' || sheet === 'vars_meta_data') {
    return ValidationGridColumns[sheet];
  }

  const nonKeys = ['__rowNum__'];

  const presetColHeaders = {
    lon: 'Longitude',
    lat: 'Latitude',
    time: 'Time',
    depth: 'Depth'
  };

  const nameToHeader = (name) => presetColHeaders[name] || name;

  const columns = Object.keys(data[0])
                        .filter((key) => !nonKeys.includes(key))
                        .map((columnName) => ({
                          headerName: nameToHeader (columnName),
                          field: columnName
                        }));

  return columns;
}
const getSheet = (n) => {
      switch (n) {
        case 0:
          return 'data';
          break;
        case 1:
          return 'dataset_meta_data';
          break;
        case 2:
          return 'vars_meta_data';
          break;
        default:
          return null;
      }
    }
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

    if (
      this.state.auditReport &&
      this.state.auditReport[sheet] &&
      this.state.auditReport[sheet][row] &&
      this.state.auditReport[sheet][row][colId]
    ) {
      styles.boxShadow = 'inset 0 0 1px 1px rgba(255, 0, 0, .5)';
    }

    return styles;
  };

  state = {
    validationStep: 0,
    tab: 0,
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
      headerComponentFramework: DSCustomGridHeader,
    },
  };

  handleGridSizeChanged = () => {
    if (this.state.validationStep === 2) {
      // now that we include all data columns, we don't want to force them to fit
      // this.gridApi.sizeColumnsToFit();
    }
  };

  handleDragOver = (e) => {
    e.preventDefault();
  };

  auditCell = (value, col, row) => {
    let cellAudit = [];
    let auditFuncs = this.audits[col];

    if (auditFuncs) {
      auditFuncs.forEach((func) => {
        let result = func(value, row);

        if (result) {
          cellAudit.push(result);
        }
      });
    }

    return cellAudit;
  };

  auditWorkbook = (args) => {
    return workbookAudits(args);
  };

  auditRows = (rows, sheet) => {
    let audit = [];
    rows.forEach((row, i) => {
      let rowAudit = {};

      let columns = auditReference[sheet];

      columns.forEach((col) => {
        let cellAudit = this.auditCell(row[col], col, i);

        if (cellAudit.length) {
          rowAudit[col] = cellAudit;
        }
      });

      if (Object.keys(rowAudit).length) {
        audit[i] = rowAudit;
      }
    });

    return audit;
  };

  // Takes a workbook and returns an audit report
  performAudit = (argsObj) => {
    let workbookAudit = this.auditWorkbook(argsObj);
    if (workbookAudit.errors.length)
      return {
        workbook: workbookAudit,
        data: [],
        dataset_meta_data: [],
        vars_meta_data: [],
      };

    let report = {
      workbook: workbookAudit,
      data: this.auditRows(argsObj.data, 'data'),
      dataset_meta_data: this.auditRows(
        argsObj.dataset_meta_data,
        'dataset_meta_data',
      ),
      vars_meta_data: this.auditRows(argsObj.vars_meta_data, 'vars_meta_data'),
    };

    return report;
  };

  handleResetState = () => {
    this.props.storeSubmissionFile(null);
    this.props.history.push({
      pathname: '/datasubmission/validationtool',
      query: {},
    });
    this.setState({
      ...this.state,
      data: null,
      dataset_meta_data: null,
      vars_meta_data: null,
      validationStep: 0,
    });
  };

  handleChangeValidationStep = (validationStep) => {
    this.setState({ ...this.state, validationStep }, () => {
      // if (this.gridApi && validationStep == 2) this.gridApi.sizeColumnsToFit();
    });
  };

  handleCellValueChanged = ({
    rowIndex,
    newValue,
    column,
    node,
    context,
    oldValue,
  }) => {
    if (oldValue === newValue) return;

    let { sheet } = context;

    let newAudit = this.auditCell(newValue, column.colId, rowIndex);

    let auditReport = { ...this.state.auditReport };

    if (!auditReport[sheet][rowIndex]) auditReport[sheet][rowIndex] = {};

    auditReport[sheet] = [...this.state.auditReport[sheet]];

    if (newAudit.length) {
      auditReport[sheet][rowIndex][column.colId] = newAudit;
    } else delete auditReport[sheet][rowIndex][column.colId];

    if (!Object.keys(auditReport[sheet][rowIndex]).length) {
      auditReport[sheet][rowIndex] = null;
    }

    let updated = [
      ...this.state[sheet].slice(0, rowIndex),
      node.data,
      ...this.state[sheet].slice(rowIndex + 1),
    ];
    this.setState({ ...this.state, [sheet]: updated, auditReport }, () => {
      this.gridApi.redrawRows();
    });
  };

  handleReadFile = (file) => {
    var reader = new FileReader();
    if (file.size > 150000000) {
      this.setState({ ...this.state, ...fileSizeTooLargeDummyState }, () =>
        this.props.setLoadingMessage(''),
      );
      return;
    }

    reader.onload = (progressEvent) => {
      var readFile = new Uint8Array(progressEvent.target.result);
      var workbook = XLSX.read(readFile, { type: 'array' });
      let _data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {
        defval: null,
      });
      let {
        data,
        is1904,
        numericDateFormatConverted,
        deletedKeys,
      } = _data ? formatDataSheet(_data, workbook) : _data;

      let _dataset_meta_data = XLSX.utils.sheet_to_json(
        workbook.Sheets['dataset_meta_data'],
        { defval: null },
      );
      let dataset_meta_data = _dataset_meta_data
        ? formatDatasetMetadataSheet(_dataset_meta_data, workbook)
        : _dataset_meta_data;

      let _vars_meta_data = XLSX.utils.sheet_to_json(
        workbook.Sheets['vars_meta_data'],
        { defval: null },
      );
      let vars_meta_data = _vars_meta_data
        ? formatVariableMetadataSheet(_vars_meta_data)
        : _vars_meta_data;

      const auditReport = this.performAudit({
        workbook,
        data,
        dataset_meta_data,
        vars_meta_data,
        numericDateFormatConverted
      });

      // emend auditReport with results of formatDataSheet
      if (numericDateFormatConverted) {
        auditReport.workbook.warnings.push(messages.numericDateConversionWarning);
      }
      if (deletedKeys && deletedKeys.length) {
        auditReport.workbook.warnings.push(`${messages.deletedKeysWarning}. Deleted keys: ${deletedKeys.join(', ')}`)
      }

      const validationStep =
        auditReport.workbook.errors.length ||
        auditReport.workbook.warnings.length
          ? 1
        : 2;

      console.log ('Audit Report', auditReport);

      this.setState(
        {
          ...this.state,
          data,
          dataset_meta_data,
          vars_meta_data,
          auditReport,
          validationStep,
        },
        () => this.props.setLoadingMessage(''),
      );
    };

    reader.readAsArrayBuffer(file);
  };

  handleDrop = (e) => {
    e.preventDefault();
    var file = e.dataTransfer.items[0].getAsFile();
    this.props.setLoadingMessage('Reading Workbook');
    this.props.checkSubmissionOptionsAndStoreFile(file);
  };

  handleFileSelect = (e) => {
    var file = e.target.files[0];
    if (!file) return;
    this.props.setLoadingMessage('Reading Workbook');
    this.props.checkSubmissionOptionsAndStoreFile(file);
    e.target.value = null;
  };

  handleUploadSubmission = () => {
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.data),
      'data',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.dataset_meta_data),
      'dataset_meta_data',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.vars_meta_data),
      'vars_meta_data',
    );
    let wbArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    let file = new Blob([wbArray]);
    file.name = `${this.state.dataset_meta_data[0].dataset_short_name}.xlsx`;
    this.props.uploadSubmission({
      file,
      datasetName: this.state.dataset_meta_data[0].dataset_short_name,
      dataSource: this.state.dataset_meta_data[0].dataset_source,
      datasetLongName: this.state.dataset_meta_data[0].dataset_long_name,
    });
  };

  handleDownload = () => {
    this.props.setLoadingMessage('Downloading');
    setTimeout(() => {
      window.requestAnimationFrame(() => this.props.setLoadingMessage(''));
    }, 50);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.data),
      'data',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.dataset_meta_data),
      'dataset_meta_data',
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(this.state.vars_meta_data),
      'vars_meta_data',
    );
    XLSX.writeFile(
      workbook,
      this.state.dataset_meta_data[0].dataset_short_name + '.xlsx',
    );
  };

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    // if (this.state.validationStep === 2) this.gridApi.sizeColumnsToFit();
  };

  onModelUpdated = (params) => {
    if (
      this.gridApi &&
      validationSteps[this.state.validationStep].sheet === 'data'
    ) {
      // this.gridApi.sizeColumnsToFit();
    }
  };

  scrollGridTo = (index) => {
    this.gridApi.ensureIndexVisible(index, 'middle');
  };

  //TODO clean this up when it's not late at night
  handleFindNext = () => {
    let lastFocused = this.gridApi.getFocusedCell();
    let { sheet } = getSheet(this.state.tab);
    let { auditReport } = this.state;


    let cols = getColumns(sheet, this.state[sheet]);
    var startRow = lastFocused ? lastFocused.rowIndex : -1;
    var startColIndex = lastFocused
      ? cols.findIndex((e) => e === lastFocused.column.colId)
      : 0;

    // Search the remaining columns in focused row
    if (lastFocused) {
      for (let i = startColIndex + 1; i < cols.length && i > -1; i++) {
        if (
          auditReport[sheet][startRow] &&
          auditReport[sheet][startRow][cols[i]]
        ) {
          this.gridApi.ensureColumnVisible(cols[i]);
          this.gridApi.startEditingCell({
            rowIndex: startRow,
            colKey: cols[i],
          });
          return;
        }
      }
    }

    // Start from startRow + 1, end at beginning of startRow
    for (let i = startRow + 1; i != startRow; i++) {
      if (auditReport && auditReport[sheet] && auditReport[sheet][i]) {
        for (let j = 0; j < cols.length; j++) {
          if (auditReport[sheet][i][cols[j]]) {
            this.gridApi.ensureColumnVisible(cols[j]);
            this.gridApi.startEditingCell({
              rowIndex: i,
              colKey: cols[j],
            });
            return;
          }
        }
      } else {
        i = -1
      }

      if (auditReport[sheet] && i === auditReport[sheet].length) {
        i = -1;
      }
    }

    // Search the rest of start row
    if (lastFocused) {
      for (let i = 0; i <= startColIndex && i < cols.length; i++) {
        if (
          auditReport[sheet][startRow] &&
          auditReport[sheet][startRow][cols[i]]
        ) {
          this.gridApi.ensureColumnVisible(cols[i]);
          this.gridApi.startEditingCell({
            rowIndex: startRow,
            colKey: cols[i],
          });
          return;
        }
      }
    }
  };

  countErrors = () => {
    let counts = {
      workbook: this.state.auditReport.workbook.errors.length || 0,
      data: 0,
      dataset_meta_data: 0,
      vars_meta_data: 0,
    };

    console.log ('counting errors', this.state.auditReport);

    this.state.auditReport['data'].forEach((e) => {
      if (e) {
        console.log (e, Object.keys(e), Object.keys(e).length);
        counts.data += (Object.keys(e).length || 0)
      }
    });

    this.state.auditReport['dataset_meta_data'].forEach((e) => {
      if (e) {
        counts.dataset_meta_data += (Object.keys(e).length || 0);
      }
    });

    this.state.auditReport['vars_meta_data'].forEach((e) => {
      if (e) {
        counts.vars_meta_data += (Object.keys(e).length || 0);
      }
    });

    return counts;
  };

  handleClickTab = (event, newValue) => {
    this.setState({ ...this.state, tab: newValue });
  };

  componentDidMount = () => {
    let submissionID = new URLSearchParams(window.location.search).get(
      'submissionID',
    );
    if (submissionID) {
      this.props.retrieveMostRecentFile(submissionID);
    }
  };

  componentWillUnmount = () => {
    this.props.storeSubmissionFile(null);
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      (!prevProps.dataSubmissionSelectOptions &&
        this.props.dataSubmissionSelectOptions) ||
      (!this.audits && this.props.dataSubmissionSelectOptions) ||
      (prevProps.dataSubmissionSelectOptions !==
        this.props.dataSubmissionSelectOptions &&
        this.props.dataSubmissionSelectOptions)
    ) {
      this.audits = generateAudits(this.props.dataSubmissionSelectOptions);
    }
    if (
      prevProps.submissionFile !== this.props.submissionFile &&
      this.props.submissionFile
    ) {
      this.handleReadFile(this.props.submissionFile);
    }
  };

  render = () => {
    if (!this.props.user) return <LoginRequiredPrompt />;

    const { classes } = this.props;
    const { validationStep } = this.state;

    const datasetName =
      this.state.dataset_meta_data && this.state.dataset_meta_data.length
        ? this.state.dataset_meta_data[0].dataset_short_name
        : null;


    const sheet = getSheet(this.state.tab);

    var errorCount = {
      workbook: 0,
      data: 0,
      dataset_meta_data: 0,
      vars_meta_data: 0,
    }

    if (validationStep > 0 && validationStep < 5) {
      errorCount = this.countErrors();
    }
   const errorSum = Object.keys(errorCount).reduce((acc, curr) => {
      return acc + errorCount[curr];
    }, 0);

    const noErrors = 0 === errorSum;

console.log('no errors', noErrors, errorSum)

    return (
      <div
        style={{
          margin: '120px auto 0 auto',
          position: 'relative',
          maxWidth: '1380px',
        }}
      >
        <FullWidthContainer>
          <Section>

            <Header />

            <Paper
              elevation={2}
              className={`${classes.fileSelectPaper} ${
                !this.props.submissionFile && classes.addBorder
              }`}
              onDragOver={this.handleDragOver}
              onDrop={this.handleDrop}
            >

              <Navigation
                file={this.props.submissionFile}
                step={validationStep}
                datasetName={datasetName}
                errorCount={errorCount}
                changeStep={this.handleChangeValidationStep}
                auditReport={this.state.auditReport}
              />

              <ErrorStatus
                step={validationStep}
                errorCount={errorCount}
                findNext={this.handleFindNext}
                sheet={sheet}
              />

            </Paper>

            <Step1
              step={this.state.validationStep}
              auditReport={this.state.auditReport}
            />

            {Boolean(validationStep === 2) && (
              <React.Fragment>
                <Paper
                  elevation={2}
                  className={classes.tabPaper + ' ag-theme-material'}
                >
                  <Tabs value={this.state.tab} onChange={this.handleClickTab}>
                    <Tab
                      value={0}
                      label={
                        errorCount['data'] > 0 ? (
                          <StyledBadgeRed badgeContent={errorCount['data']}>
                            Data
                          </StyledBadgeRed>
                        ) : (
                          <StyledBadgeGreen badgeContent={'\u2713'}>
                            Data
                          </StyledBadgeGreen>
                        )
                      }
                      className={classes.workbookTab}
                    />

                    <Tab
                      value={1}
                      label={
                        errorCount['dataset_meta_data'] > 0 ? (
                          <StyledBadgeRed
                            badgeContent={errorCount['dataset_meta_data']}
                          >
                            Dataset Metadata
                          </StyledBadgeRed>
                        ) : (
                          <StyledBadgeGreen badgeContent={'\u2713'}>
                            Dataset Metadata
                          </StyledBadgeGreen>
                        )
                      }
                      className={classes.workbookTab}
                    />

                    <Tab
                      value={2}
                      label={
                        errorCount['vars_meta_data'] > 0 ? (
                          <StyledBadgeRed
                            badgeContent={errorCount['vars_meta_data']}
                          >
                            Variable Metadata
                          </StyledBadgeRed>
                        ) : (
                          <StyledBadgeGreen badgeContent={'\u2713'}>
                            Variable Metadata
                          </StyledBadgeGreen>
                        )
                      }
                      className={classes.workbookTab}
                    />
                  </Tabs>

                  <div style={{ height: 'calc(100% - 48px)' }}>
                    <ValidationGrid
                      onGridReady={this.onGridReady}
                      rowData={this.state[sheet]}
                      defaultColumnDef={this.state.defaultColumnDef}
                      handleCellValueChanged={this.handleCellValueChanged}
                      handleGridSizeChanged={this.handleGridSizeChanged}
                      columns={getColumns(sheet, this.state[sheet])}
                      gridContext={{
                        sheet,
                        getAuditReport: () => this.state.auditReport,
                        textAreaLookup,
                        selectOptions: generateSelectOptions(
                          this.props.dataSubmissionSelectOptions,
                        ),
                        auditCell: this.auditCell,
                      }}
                      onModelUpdated={this.onModelUpdated}
                    />
                  </div>
                </Paper>
              </React.Fragment>
            )}

            {Boolean(validationStep === validationSteps.length - 1) && (
              <Paper elevation={2} className={`${classes.fileSelectPaper}`}>
                <CleanupDummy />
                {this.props.submissionUploadState === states.succeeded ? (
                  <React.Fragment>
                    <Typography className={classes.submittedTypography}>
                      Your dataset has been successfully submitted, and will be
                      reviewed by our data curation team.
                    </Typography>

                    <Typography className={classes.submittedTypography}>
                      You can view the status of your submission{' '}
                      <Link
                        style={{ display: 'inline-block' }}
                        className={classes.needHelpLink}
                        component={RouterLink}
                        to={`/datasubmission/userdashboard?datasetName=${encodeURI(
                          datasetName,
                        )}`}
                      >
                        here
                      </Link>
                      .
                    </Typography>

                    <Typography className={classes.submittedTypography}>
                      If you made any changes during this process you can
                      download the edited workbook{' '}
                      <Link
                        style={{ display: 'inline-block' }}
                        className={classes.needHelpLink}
                        onClick={this.handleDownload}
                        component="span"
                      >
                        here
                      </Link>
                      .
                    </Typography>

                    <Typography className={classes.submittedTypography}>
                      A detailed description of remaining steps in the
                      submission process can be found in the{' '}
                      <Link
                        style={{ display: 'inline-block' }}
                        className={classes.needHelpLink}
                        component={RouterLink}
                        to="/datasubmission/guide"
                      >
                        Data Submission Guide
                      </Link>
                      .
                    </Typography>

                    <Typography className={classes.submittedTypography}>
                      To start over and submit another dataset click{' '}
                      <Link
                        style={{ display: 'inline-block' }}
                        className={classes.needHelpLink}
                        onClick={() => this.handleResetState()}
                        component="span"
                      >
                        here
                      </Link>
                      .
                    </Typography>
                  </React.Fragment>
                ) : this.props.submissionUploadState === states.failed ? (
                  <React.Fragment>
                    <List>
                      <ListItem>
                        <ListItemIcon style={{ color: 'rgba(255, 0, 0, .7)' }}>
                          <ErrorOutline />
                        </ListItemIcon>
                        <ListItemText primary="A dataset with this name has already been submitted by another user. If you believe you're receiving this message in error please contact us at cmap-data-submission@uw.edu." />

                        <Typography className={classes.submittedTypography}>
                          To start over and submit another dataset click{' '}
                          <Link
                            style={{ display: 'inline-block' }}
                            className={classes.needHelpLink}
                            onClick={() => this.handleResetState()}
                            component="span"
                          >
                            here
                          </Link>
                          .
                        </Typography>
                      </ListItem>
                    </List>

                    <Typography className={classes.submittedTypography}>
                      If you made any changes during this process you can
                      download the edited workbook{' '}
                      <Link
                        style={{ display: 'inline-block' }}
                        className={classes.needHelpLink}
                        onClick={this.handleDownload}
                        component="span"
                      >
                        here
                      </Link>
                      .
                    </Typography>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    { noErrors ? (<Typography>
                      You've completed dataset validation! Click the button
                      below to upload your workbook.
                    </Typography>
) : (<Typography>There are still validation errors in previous steps. Please address these errors before submitting the dataset.</Typography>
) }
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.submitButton}
                      onClick={this.handleUploadSubmission}
                      disabled={!Boolean(noErrors)}
                    >
                      Submit
                    </Button>
                  </React.Fragment>
                )}
              </Paper>
            )}
            <input
              onChange={this.handleFileSelect}
              className={classes.input}
              accept=".xlsx"
              id="select-file-input"
              type="file"
            />
          </Section>
        </FullWidthContainer>
      </div>
    );
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(withStyles(styles)(ValidationTool)));

//Undo / redo
// https://www.ag-grid.com/javascript-grid-undo-redo-edits/

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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';

import {
  uploadSubmission,
  retrieveMostRecentFile,
  storeSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
  setUploadState,
  checkSubmNamesRequestSend,
  setAudit,
  setSheetAudit,
} from '../../Redux/actions/dataSubmission';
import { setLoadingMessage, snackbarOpen } from '../../Redux/actions/ui';
import Section, { FullWidthContainer } from '../Common/Section';

import Header from './ValidationToolHeader';
import Navigation from './ValidationToolNavigation';
import Chooser from './Chooser';
import Step1 from './ValidationToolStep1';
import Step2 from './ValidationToolStep2';
import StepAssistant from './StepAssistant';
import messages from './Messages';

import LoginRequiredPrompt from '../User/LoginRequiredPrompt';

import formatDataSheet from './Helpers/formatDataSheet';
import formatDatasetMetadataSheet from './Helpers/formatDatasetMetadataSheet';
import formatVariableMetadataSheet from './Helpers/formatVariableMetadataSheet';
import generateAudits from './Helpers/generateAudits';
import workbookAudits from './Helpers/workbookAudits';
import auditReference from './Helpers/auditReference';
import countErrors from './Helpers/countErrors';
import { formatBytes } from './Helpers/display';

import { safePath } from '../../Utility/objectUtils';

import styles from './ValidationToolStyles';

import {
  validationSteps,
  fileSizeTooLargeDummyState,
} from './ValidationToolConstants';

import states from '../../enums/asyncRequestStates';

const mapStateToProps = (state, ownProps) => ({
  submissionFile: state.submissionFile,
  dataSubmissionSelectOptions: state.dataSubmissionSelectOptions,
  submissionUploadState: state.submissionUploadState,
  user: state.user,
  checkSubmissionNameResult: state.checkSubmissionNameResult,
  submissionType: state.submissionType,
  submissionToUpdate: state.submissionToUpdate,
  auditReport: state.auditReport,
});

const mapDispatchToProps = {
  uploadSubmission,
  setLoadingMessage,
  snackbarOpen,
  retrieveMostRecentFile,
  storeSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
  checkSubmNamesRequestSend,
  setAudit,
  setSheetAudit,
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


// validationSteps:
// 0 - chooser
// 1 - workbook,
// 2 - data,
// 3 - dataset metadata
// 4 - variable metadata
// 5 - submission

class ValidationTool extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      validationStep: 0,
      tab: 0,
      file: null,
      data: null,
      dataset_meta_data: null,
      vars_meta_data: null,
      auditReport: null,
    };
  }

  handleGridSizeChanged = () => {};

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
    return workbookAudits(
      args,
      this.props.checkSubmissionNameResult,
      this.props.submissionType
    );
  };

  auditRows = (rows, sheet) => {
    let audit = [];

    if (Array.isArray(rows)) {
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
    }

    return audit;
  };

  // Takes a workbook and returns an audit report
  performAudit = (shouldAdvanceStep) => {
    const {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
      dateTimeFormatConverted,
    } = this.state;

    const argsObj = {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
      dateTimeFormatConverted,
    };

    let workbookAudit = this.auditWorkbook(argsObj);

    let report = {
      workbook: workbookAudit,
      data: this.auditRows(
        data,
        'data'
      ),
      dataset_meta_data: this.auditRows(
        dataset_meta_data,
        'dataset_meta_data',
      ),
      vars_meta_data: this.auditRows(
        vars_meta_data,
        'vars_meta_data'
      ),
    };

    const errors = countErrors (report);
    report.errorCount = errors;

    this.props.setAudit(report);

    if (shouldAdvanceStep) {
      const validationStep = (report.workbook.errors.length || report.workbook.warnings.length)
                           ? 1
                           : 2;

      this.setState({
        ...this.state,
        validationStep,
      });
    }
    this.props.setLoadingMessage('');
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
    if (validationStep >= 0 && validationStep < validationSteps.length) {
      this.setState({ ...this.state, validationStep });
    }
  };

  handleCellValueChanged = ({
    rowIndex,
    newValue,
    column,
    node,
    context,
    oldValue,
  }) => {

    const shouldResendCheckNameRequest =
      (column && column.colId === 'dataset_short_name')
      || (column && column.colId === 'dataset_long_name')

    // dataset_short_name
    if (shouldResendCheckNameRequest) {
      let shortName = safePath (['dataset_meta_data', '0', 'dataset_short_name']) (this.state);
      let longName = safePath (['dataset_meta_data', '0', 'dataset_long_name']) (this.state);

      if (column.colId === 'dataset_short_name') {
        shortName = newValue;
      }
      if (column.colId === 'dataset_long_name') {
        longName = newValue;
      }
      this.props.checkSubmNamesRequestSend({ shortName, longName, submissionId: this.props.submissionToUpdate });
    }

    if (oldValue === newValue) {
      return;
    }

    let { sheet } = context;

    let newAudit = this.auditCell(newValue, column.colId, rowIndex);
    console.log ('new cell audit', newValue, rowIndex, column.colId, newAudit);

    let auditReport = {
      ...this.props.auditReport
    };

    if (newAudit.length) {
      if (!auditReport[sheet][rowIndex]) {
        auditReport[sheet][rowIndex] = {};
      }
      auditReport[sheet][rowIndex][column.colId] = newAudit;
    } else {
      // cell audit returned no issue, so delete anything on current audit for this cell
      let currentCellAudit = safePath ([sheet, rowIndex, column.colId]) (auditReport);
      if (currentCellAudit) {
        console.log ('deleting old audit for cell', currentCellAudit);
        delete auditReport[sheet][rowIndex][column.colId];
      }
    }

    const row = safePath ([sheet, rowIndex]) (auditReport);
    if (row && !row.length) {
      auditReport[sheet][rowIndex] = null;
    }

    // update the data
    let updated = [
      ...this.state[sheet].slice(0, rowIndex),
      node.data,
      ...this.state[sheet].slice(rowIndex + 1),
    ];

    // set state
    this.setState({
      ...this.state,
      [sheet]: updated,
    }, () => {
      const row = this.gridApi.getDisplayedRowAtIndex(rowIndex);
      this.gridApi.redrawRows({rowNodes: [row]});
    });

    this.props.setSheetAudit({
      sheetName: sheet,
      sheetAudit: auditReport[sheet]
    });
  };

  handleReadFile = (file) => {
    var totalBytes = 0;
    var reader = new FileReader();
    if (file.size > 150000000) {
      this.setState({ ...this.state, ...fileSizeTooLargeDummyState }, () =>
        this.props.setLoadingMessage(''),
      );
      return;
    }

    // reset checkName result (because we have a new file)
    this.setState({ ...this.state, checkNameResult: null, rawFile: file });

    reader.onprogress = (ev) => {
      try {
        totalBytes = safePath (['total']) (ev);
        console.log ('size read: ' + formatBytes(totalBytes));
      } catch (e) {
        console.log ('error: file reader progress event total was not a number')
      }
    }

    reader.onload = (progressEvent) => {
      const size = formatBytes(totalBytes);
      console.log ('onload: begin parsing file', size);
      this.props.setLoadingMessage(`Parsing file (${size})`);

      var readFile = new Uint8Array(progressEvent.target.result);
      var workbook = XLSX.read(readFile, { type: 'array' });
      let _data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {
        defval: null,
      });

      let formatResult;
      try {
        formatResult = formatDataSheet(_data, workbook);
      } catch (e) {
        console.log ('error loading file', e);
        this.props.snackbarOpen('Error parsing file.');
        this.props.setLoadingMessage('');
        return;
      }
      let {
        data,
        // is1904,
        numericDateFormatConverted,
        // deletedKeys,
        dateTimeFormatConverted,
      } = formatResult;

      // metadata
      let _dataset_meta_data = XLSX.utils.sheet_to_json(
        workbook.Sheets['dataset_meta_data'],
        { defval: null },
      );
      let dataset_meta_data = _dataset_meta_data
        ? formatDatasetMetadataSheet(_dataset_meta_data, workbook)
        : _dataset_meta_data;

      // vars metadata
      let _vars_meta_data = XLSX.utils.sheet_to_json(
        workbook.Sheets['vars_meta_data'],
        { defval: null },
      );
      let vars_meta_data = _vars_meta_data
        ? formatVariableMetadataSheet(_vars_meta_data)
        : _vars_meta_data;

      if (!vars_meta_data || !dataset_meta_data || !data) {
        this.props.snackbarOpen('Error parsing file: missing worksheets.');
        this.props.setLoadingMessage('');
        return;
      }

      // dispatch check name
      const shortName = dataset_meta_data[0].dataset_short_name;
      const longName = dataset_meta_data[0].dataset_long_name;

      this.props.checkSubmNamesRequestSend({ shortName, longName, submissionId: this.props.submissionToUpdate });

      this.setState({
        ...this.state,
        workbook,
        data,
        dataset_meta_data,
        vars_meta_data,
        numericDateFormatConverted,
        dateTimeFormatConverted,
      }, () => {
        console.log ('cleanup');
        this.props.setLoadingMessage('');
      }
      );

      // run report
      console.log ('prform audit');
      this.props.setLoadingMessage('Performing audit');
      this.performAudit(true);
    };

    reader.readAsArrayBuffer(file);
  };

  handleDrop = (e) => {
    e.preventDefault();
    var file = e.dataTransfer.items[0].getAsFile();
    this.props.setLoadingMessage('Reading Workbook');
    this.props.checkSubmissionOptionsAndStoreFile(file);
  };

  /* handleFileSelect = (e) => {
   *   var file = e.target.files[0];
   *   if (!file) return;
   *   this.props.setLoadingMessage('Reading Workbook');
   *   this.props.checkSubmissionOptionsAndStoreFile(file);
   *   e.target.value = null;
   * }; */

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

    console.log ('dispatching upload', {
      submissionType: this.props.submissionType, // "new" | "update"
      submissionId: this.props.submissionToUpdate,
      datasetName: this.state.dataset_meta_data[0].dataset_short_name,
      dataSource: this.state.dataset_meta_data[0].dataset_source,
      datasetLongName: this.state.dataset_meta_data[0].dataset_long_name,
    })

    this.props.uploadSubmission({
      submissionType: this.props.submissionType, // "new" | "update"
      submissionId: this.props.submissionToUpdate,
      file,
      rawFile: this.state.rawFile,
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
  };

  onModelUpdated = (params) => {};

  scrollGridTo = (index) => {
    this.gridApi.ensureIndexVisible(index, 'middle');
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
    // 1. should regenerate audits
    const noPrevSelectOptionsButNowReceivingOptions =
      !prevProps.dataSubmissionSelectOptions &&
      this.props.dataSubmissionSelectOptions;

    const noPrevAuditsButNowReceivingOptions =
      !this.audits && this.props.dataSubmissionSelectOptions;

    const yesPrevOptionsButNotSameAsNewOnes =
      prevProps.dataSubmissionSelectOptions !==
        this.props.dataSubmissionSelectOptions &&
      this.props.dataSubmissionSelectOptions;

    const shouldGenerateAudits =
      noPrevSelectOptionsButNowReceivingOptions ||
      noPrevAuditsButNowReceivingOptions ||
      yesPrevOptionsButNotSameAsNewOnes;

    if (shouldGenerateAudits) {
      this.audits = generateAudits(this.props.dataSubmissionSelectOptions);
    }

    // 2. should handle new submission file
    const prevFileIsNotSameAsNewFile =
      prevProps.submissionFile !== this.props.submissionFile
      && this.props.submissionFile;

    if (prevFileIsNotSameAsNewFile) {
      this.handleReadFile(this.props.submissionFile);
    }

    // 3. should rerun audits
    const subTypeChanged = this.props.submissionType !== prevProps.submissionType;
    const nameCheckChanged = this.props.checkSubmissionNameResult !== prevProps.checkSubmissionNameResult;
    if (subTypeChanged || nameCheckChanged) {
      this.performAudit();
    }

    this.props.setLoadingMessage('');

    // 4. should re-dispatch name check
    // if subId has been changed and there is already a file
    const subIdHasChanged = this.props.submissionToUpdate !== prevProps.submissionToUpdate;
    const fileHasBeenSelected = Array.isArray(this.state.dataset_meta_data);
    if (subIdHasChanged && fileHasBeenSelected) {
      const shortName = safePath (['0','dataset_short_name']) (this.state.dataset_meta_data);
      const longName = safePath (['0','dataset_long_name']) (this.state.dataset_meta_data);
      this.props.checkSubmNamesRequestSend({ shortName, longName, submissionId: this.props.submissionToUpdate  });
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

    const noErrors = this.props.auditReport &&
                     this.props.auditReport.errorCount.sum === 0;

    return (
      <div className={classes.validationToolWrapper}>
        <StepAssistant step={this.state.step} changeStep={this.handleChangeValidationStep} />
        <FullWidthContainer>
          <Section>

            <Header subType={''} />

            <div>
              <Navigation
                file={this.props.submissionFile}
                step={validationStep}
                datasetName={datasetName}
                changeStep={this.handleChangeValidationStep}
              />
            </div>

            <Chooser step={this.state.validationStep} />

            <Step1
              step={this.state.validationStep}
              changeStep={this.handleChangeValidationStep}
            />

            <Step2
              step={this.state.validationStep}
              fileData={{
                data: this.state.data,
                dataset_meta_data: this.state.dataset_meta_data,
                vars_meta_data: this.state.vars_meta_data,
              }}
              onGridReady={this.onGridReady}
              handleCellValueChanged={this.handleCellValueChanged}
              handleGridSizeChanged={this.handleGridSizeChanged}
              auditCell={this.auditCell}
              dataSubmissionSelectOptions={this.props.dataSubmissionSelectOptions}
            />


            {Boolean(validationStep === validationSteps.length - 1) && (
              <Paper elevation={2} className={`${classes.fileSelectPaper}`}>
                <Typography variant={"h5"}>Submit</Typography>

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

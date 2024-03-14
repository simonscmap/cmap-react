// Wrapper for data submission process

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import XLSX from 'xlsx';

import { withStyles } from '@material-ui/core/styles';

import {
  uploadSubmission,
  retrieveMostRecentFile,
  storeSubmissionFile,
  clearSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
  checkSubmNamesRequestSend,
  setAudit,
  setSheetAudit,
  setWorkbookAudit,
} from '../../Redux/actions/dataSubmission';
import { setLoadingMessage, snackbarOpen } from '../../Redux/actions/ui';
import Section, { FullWidthContainer } from '../Common/Section';

import Header from './ValidationToolHeader';
import Navigation from './ValidationToolNavigation';
import Chooser from './Chooser';
import Step1 from './ValidationToolStep1';
import Step2 from './ValidationToolStep2';
import Step3 from './SubmitDataset';
import StepAssistant from './StepAssistant';

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
  userDataSubmissions: state.dataSubmissions,
  dataSubmissionSelectOptions: state.dataSubmissionSelectOptions,
  submissionUploadState: state.submissionUploadState,
  user: state.user,
  checkSubmissionNameResult: state.checkSubmissionNameResult,
  submissionType: state.submissionType,
  submissionToUpdate: state.submissionToUpdate,
  auditReport: state.auditReport,
  retrieveUserDataSubmsissionsRequestStatus: state.retrieveUserDataSubmsissionsRequestStatus,
  checkSubmissionNameRequestStatus: state.checkSubmissionNameRequestStatus,
  loadingMessage: state.loadingMessage,
});

const mapDispatchToProps = {
  uploadSubmission,
  setLoadingMessage,
  snackbarOpen,
  retrieveMostRecentFile,
  storeSubmissionFile,
  clearSubmissionFile,
  checkSubmissionOptionsAndStoreFile,
  checkSubmNamesRequestSend,
  setAudit,
  setSheetAudit,
  setWorkbookAudit,
};

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
      changeLog: [],
    };
  }

  handleGridSizeChanged = () => {};

  handleDragOver = (e) => {
    e.preventDefault();
  };

  auditCell = (value, col, row) => {
    console.log ('Audit Cell', { value, col, row });
    let cellAudit = [];
    let auditFuncs = this.audits[col];

    if (auditFuncs) {
      auditFuncs.forEach((func) => {
        let result = func (value, row);

        if (result) {
          cellAudit.push(result);
        }
      });
    }

    return cellAudit;
  };

  auditWorkbook = (args) => {
    const newArgs = Object.assign ({}, args, {
      checkNameResult: this.props.checkSubmissionNameResult,
      submissionType: this.props.submissionType,
      submissionToUpdate: this.props.submissionToUpdate,
    });

    return workbookAudits(newArgs);
  };

  auditRows = (rows, sheet) => {
    const checkNameResult = this.props.checkSubmissionNameResult;
    let audit = [];

    if (Array.isArray(rows)) {
      rows.forEach((row, i) => {
        let rowAudit = {};

        let columns = auditReference[sheet];

        const hasDepthCol = this.state.data && Object.keys(this.state.data[0]).includes('depth');
        if (!hasDepthCol) {
          columns = columns.filter ((c) => c !== 'depth');
        }

        columns.forEach((col) => {
          let cellAudit = this.auditCell(row[col], col, i);

          if (i === 0) {
            // on the first row only
            // emend cellAudit with name conflict errors
            if (sheet === 'dataset_meta_data') {
              if (col === 'dataset_short_name') {
                if (checkNameResult && checkNameResult.shortNameIsAlreadyInUse) {
                  if (!Array.isArray (cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push (`The short name "${checkNameResult.shortName}" is already in use.`)
                } else if (checkNameResult && checkNameResult.shortNameUpdateConflict) {
                  if (!Array.isArray (cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push (`The short name "${checkNameResult.shortName}" confilcts with another data submission.`)
                }
              }
              if (col === 'dataset_long_name') {
                if (checkNameResult && checkNameResult.longNameIsAlreadyInUse) {
                  if (!Array.isArray (cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push (`The long name "${checkNameResult.longName}" is already in use.`)
                } else if (checkNameResult && checkNameResult.longNameUpdateConflict) {
                  if (!Array.isArray (cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push (`The long name "${checkNameResult.longName}" confilcts with another data submission.`)
                }
              }
            }
          }
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
  performAudit = (shouldAdvanceStep, callerName) => {
    const {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
      invalidDates,
    } = this.state;

    const { userDataSubmissions } = this.props;

    const argsObj = {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
      invalidDates,
      userDataSubmissions,
    };

    if (!workbook) {
      return;
    }

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
      fatal: workbookAudit.fatal,
    };

    const errors = countErrors (report);
    report.errorCount = errors;

    this.props.setAudit(report);

    if (shouldAdvanceStep) {
      const validationStep = (report.workbook.errors.length > 0
                           || report.workbook.confirmations.length > 0
                           || report.workbook.warnings.length > 0)
                           ? 1
                           : 2;

      this.setState({
        ...this.state,
        validationStep,
        loadingFile: {
          status: 'complete',
        }
      });
    }
  };

  handleResetState = (resetStep = false) => {
    this.props.storeSubmissionFile(null);
    this.props.clearSubmissionFile ();
    this.props.setAudit(null);

    this.setState({
      ...this.state,
      rawFile: null,
      data: null,
      dataset_meta_data: null,
      vars_meta_data: null,
      validationStep: resetStep ? 0 : this.state.validationStep,
      loadingFile: {
        status: 'error',
        totalBytes: 0
      }
    });
  };

  handleChangeValidationStep = (validationStep) => {
    if (validationStep >= 0 && validationStep < validationSteps.length) {
      this.setState({ ...this.state, validationStep });
    }
  };

  handleCellValueChanged = (event) => {
    const {
      rowIndex,
      newValue,
      column,
      node,
      context,
      oldValue,
    } = event;

    if (oldValue === newValue) {
      return;
    }

    const changeEvent = {
      row: rowIndex, col: column.colId, val: newValue, old: oldValue, sheet: context.sheet
    };

    console.log ('Cell Value Changed', changeEvent, node);


    // 1. check names
    const shouldResendCheckNameRequest =
      (column && column.colId === 'dataset_short_name')
      || (column && column.colId === 'dataset_long_name')


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

    // 2. audit cell that has changed

    let { sheet } = context;

    let newAudit = this.auditCell (newValue, column.colId, rowIndex);

    let auditReport = {
      ...this.props.auditReport
    };

    // if audit returned issues
    if (newAudit.length) {
      // if no record for this row in audit report, make one
      if (!auditReport[sheet][rowIndex]) {
        auditReport[sheet][rowIndex] = {};
      }
      // insert new audit into report
      auditReport[sheet][rowIndex][column.colId] = newAudit;
    } else {
      // if cell audit returned no issue,
      let currentCellAudit = safePath ([sheet, rowIndex, column.colId]) (auditReport);
      if (currentCellAudit) {
        // delete anything on current audit for this cell
        delete auditReport[sheet][rowIndex][column.colId];
      }
    }

    const row = safePath ([sheet, rowIndex]) (auditReport);
    // if no issues on this row of audit report, delete row
    if (row && Object.keys(row).length === 0) {
      auditReport[sheet][rowIndex] = null;
    } else {
      // console.log ('still audit value in row', auditReport[sheet][rowIndex])
    }

    // update the data
    let updated = this.state[sheet].slice(0, rowIndex).concat(
      node.data,
      ...this.state[sheet].slice(rowIndex + 1),
    );

    // 3. update workbook in state with new data, and add a changeEvent to the change log
    this.setState({
      ...this.state,
      [sheet]: updated,
      changeLog: this.state.changeLog.concat(changeEvent)
    }, () => {
      // redraw rows
      const row = this.gridApi.getDisplayedRowAtIndex(rowIndex);
      this.gridApi.redrawRows({rowNodes: [row]});

      // refresh cells
      event.api.refreshCells({
        force: true,
        rowNodes: [event.node] // pass rowNode that was edited
      });
    });

    this.props.setSheetAudit({
      sheetName: sheet,
      sheetAudit: auditReport[sheet]
    });

    // 4. refresh workbook audit as well
    const {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
    } = this.state;

    const argsObj = {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      numericDateFormatConverted,
    };
    const newWorkbookAudit = this.auditWorkbook (argsObj);
    this.props.setWorkbookAudit (newWorkbookAudit);
  };

  handleReadFile = (file) => {
    this.setState ({
        ...this.state,
        loadingFile: {
          status: 'reading',
          totalBytes: 0,
        }
      })
    var totalBytes = 0;
    var reader = new FileReader();
    if (file.size > 150000000) {
      this.setState({
        ...this.state,
        ...fileSizeTooLargeDummyState
      },
        () =>
          this.props.setLoadingMessage('', { tag: 'ValidationTool#handleReadFile'}),
      );
      return;
    }

    // reset checkName result (because we have a new file)
    this.setState({
      ...this.state,
      checkNameResult: null,
      rawFile: file
    });

    reader.onprogress = (ev) => {
      try {
        totalBytes = safePath (['total']) (ev);
        this.setState ({
        ...this.state,
        loadingFile: {
          status: 'reading',
          totalBytes,
        }
      })
        console.log ('size read: ' + formatBytes(totalBytes), totalBytes);
      } catch (e) {
        console.log ('error: file reader progress event total was not a number')
      }
    }

    reader.onload = (progressEvent) => {
      this.setState ({
        ...this.state,
        loadingFile: {
          status: 'parsing',
          totalBytes,
        }
      })

      const readFile = new Uint8Array(progressEvent.target.result);
      let workbook;
      try {
        workbook = XLSX.read(readFile, { type: 'array' });
      } catch (e) {
        console.log ('error loading file', e);
        this.props.snackbarOpen('Error reading file.');
        this.handleResetState ();
        this.setState ({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0
          }
        });
        return;
      }
      let _data = XLSX.utils.sheet_to_json(workbook.Sheets['data'], {
        defval: null,
      });

      let formatResult;
      try {
        formatResult = formatDataSheet(_data, workbook);
      } catch (e) {
        console.log ('error loading file', e);
        this.props.snackbarOpen('Error parsing file.');
        this.handleResetState ();
        this.setState ({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0
          }
        });
        return;
      }

      let {
        data,
        numericDateFormatConverted,
        invalidDates, // boolean
      } = formatResult;

      // parse metadata sheets
      let _dataset_meta_data,
          dataset_meta_data,
          _vars_meta_data,
          vars_meta_data;

      try {
        _dataset_meta_data = XLSX.utils.sheet_to_json(
          workbook.Sheets['dataset_meta_data'],
          { defval: null },
        );
        dataset_meta_data = _dataset_meta_data
                          ? formatDatasetMetadataSheet(_dataset_meta_data, workbook)
                          : _dataset_meta_data;

        // vars metadata
        _vars_meta_data = XLSX.utils.sheet_to_json(
          workbook.Sheets['vars_meta_data'],
          { defval: null },
        );
        vars_meta_data = _vars_meta_data
                       ? formatVariableMetadataSheet(_vars_meta_data)
                       : _vars_meta_data;

      } catch (e) {
        console.log ('error parsing metadata sheets', e);
      }

      if (!vars_meta_data || !dataset_meta_data || !data) {
        this.props.snackbarOpen('Error parsing file: missing worksheets.');
        this.handleResetState ();
        this.setState ({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0
          }
        });
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
        invalidDates,
        loadingFile: {
          status: 'validating',
          totalBytes,
        }
      }, () => {
        this.props.setLoadingMessage('', { tag: 'ValidationTool#reader.onload' });
      });

      // run report
      console.log ('file parsed; perform audit');
      this.performAudit(true, 'onload');
    };

    reader.readAsArrayBuffer(file);
  };

  handleUploadSubmission = () => {
    // rerun all audits
    this.performAudit (false);

    // prevent upload if errors exist
    if (!this.props.auditReport) {
      console.log ('No audit report present; preventing submit action.');
      return;
    } else if (this.props.auditReport.errorCount.sum !== 0) {
      console.log ('Errors are still present; aborting submit action.');
      return;
    }

    // assemble file
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
    const tag = { tag: 'ValidationTool#handleDownload' };
    this.props.setLoadingMessage('Downloading', tag);
    setTimeout(() => {
      window.requestAnimationFrame(() => this.props.setLoadingMessage('', tag));
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
    if ((subTypeChanged || nameCheckChanged) && this.props.submissionFile) {
      console.log ('call perform audit because nameCheck has changed');
      this.performAudit(false, 'componentDidUpdate');
    }

    // 4. should re-dispatch name check
    // if subId has been changed and there is already a file
    const subIdHasChanged = this.props.submissionToUpdate !== prevProps.submissionToUpdate;
    const fileHasBeenSelected = Array.isArray(this.state.dataset_meta_data);
    if (subIdHasChanged && fileHasBeenSelected) {
      const shortName = safePath (['0','dataset_short_name']) (this.state.dataset_meta_data);
      const longName = safePath (['0','dataset_long_name']) (this.state.dataset_meta_data);
      console.log (`id ${this.props.submissionToUpdate} ?= ${prevProps.submissionToUpdate}`, typeof this.props.submissionToUpdate, prevProps.submissionToUpdate);
      console.log ('dispatching', subIdHasChanged, fileHasBeenSelected);
      this.props.checkSubmNamesRequestSend({ shortName, longName, submissionId: this.props.submissionToUpdate  });
    }

    // 5. success & should reset state
    const submissionWasSuccessfullyUploaded =
      this.props.submissionUploadState === states.succeeded &&
      this.props.submissionUploadState !== prevProps.submissionUploadState;

    if (submissionWasSuccessfullyUploaded) {
      console.log ('resetting state');
      this.handleResetState ();
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

    const shortName = safePath (['dataset_meta_data', '0', 'dataset_short_name']) (this.state);

    return (
      <div className={classes.validationToolWrapper}>
        <StepAssistant step={this.state.step} changeStep={this.handleChangeValidationStep} />
        <FullWidthContainer>
          <Section>

            <Header />

            <div>
              <Navigation
                file={this.props.submissionFile}
                step={validationStep}
                datasetName={datasetName}
                changeStep={this.handleChangeValidationStep}
              />
            </div>

            <Chooser
              step={this.state.validationStep}
              status={this.state.loadingFile}
              reset={this.handleResetState}
            />

            <Step1
              step={this.state.validationStep}
              changeStep={this.handleChangeValidationStep}
              reset={this.handleResetState}
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
              getChangeLog={() => this.state.changeLog}
            />

            <Step3
              validationStep={validationStep}
              handleUploadSubmission={this.handleUploadSubmission}
              shortName={shortName}
              handleDownloadWorkbook={this.handleDownload}
              resetState={this.handleResetState}
              getChangeLog={() => this.state.changeLog}
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

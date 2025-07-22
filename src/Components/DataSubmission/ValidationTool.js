// Wrapper for data submission process

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import XLSX from 'xlsx';

import { withStyles } from '@material-ui/core/styles';

import deepEqual from 'deep-equal';

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
  setSubmissionStep,
} from '../../Redux/actions/dataSubmission';
import { setLoadingMessage, snackbarOpen } from '../../Redux/actions/ui';
import Section, { FullWidthContainer } from '../Common/Section';

import Header from './ValidationToolHeader';
import Navigation from './ValidationToolNavigation';
import Chooser from './Chooser';
import Step1 from './ValidationToolStep1';
import Step2 from './ValidationToolStep2';
import Step3 from './ValidationToolStep3';
import StepAssistant from './StepAssistant';

import LoginRequiredPrompt from '../User/LoginRequiredPrompt';

import formatDataSheet from './Helpers/formatDataSheet';
import formatDatasetMetadataSheet from './Helpers/formatDatasetMetadataSheet';
import formatVariableMetadataSheet from './Helpers/formatVariableMetadataSheet';
import generateAudits from './Helpers/generateAudits';
import workbookAudits from './Helpers/workbookAudits';
import auditReference from './Helpers/auditReference';
import countErrors from './Helpers/countErrors';
import DeleteEmptyRowConfirmation from './DeleteEmptyRowConfirmation';
import { formatBytes } from './Helpers/display';
import { safePath } from '../../Utility/objectUtils';

import styles from './ValidationToolStyles';

import {
  validationSteps,
  fileSizeTooLargeDummyState,
} from './ValidationToolConstants';

import states from '../../enums/asyncRequestStates';

import { debugTimer } from '../../Utility/debugTimer';
import { downloadWorkbook } from './downloadWorkbook';

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
  retrieveUserDataSubmsissionsRequestStatus:
    state.retrieveUserDataSubmsissionsRequestStatus,
  checkSubmissionNameRequestStatus: state.checkSubmissionNameRequestStatus,
  loadingMessage: state.loadingMessage,
  validationStep: state.submissionStep,
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
  setSubmissionStep,
};

class ValidationTool extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tab: 0,
      file: null,
      data: null,
      dataset_meta_data: null,
      vars_meta_data: null,
      auditReport: null,
      changeLog: [],
      delRow: null,
      originalWorkbook: null,
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
        // apply audit functions to cell value
        let result = func(value, row);
        if (result) {
          cellAudit.push(result);
        }
      });
    }
    return cellAudit;
  };

  auditWorkbook = (args) => {
    const newArgs = Object.assign({}, args, {
      checkNameResult: this.props.checkSubmissionNameResult,
      submissionType: this.props.submissionType,
      submissionToUpdate: this.props.submissionToUpdate,
    });

    console.log('calling workbook Audits', newArgs);
    return workbookAudits(newArgs);
  };

  auditRows = (rows, sheet) => {
    // console.log (`auditing rows for ${sheet}`)
    const checkNameResult = this.props.checkSubmissionNameResult;
    let audit = [];

    if (Array.isArray(rows)) {
      rows.forEach((row, i) => {
        let rowAudit = {};

        let columns = auditReference[sheet];

        const hasDepthCol =
          this.state.data && Object.keys(this.state.data[0]).includes('depth');
        if (!hasDepthCol) {
          columns = columns.filter((c) => c !== 'depth');
        }

        columns.forEach((col) => {
          let cellAudit = this.auditCell(row[col], col, i);

          if (i === 0) {
            // on the first row only
            // emend cellAudit with name conflict errors
            if (sheet === 'dataset_meta_data') {
              if (col === 'dataset_short_name') {
                if (
                  checkNameResult &&
                  checkNameResult.shortNameIsAlreadyInUse
                ) {
                  if (!Array.isArray(cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push(
                    `The short name "${checkNameResult.shortName}" is already in use.`,
                  );
                } else if (
                  checkNameResult &&
                  checkNameResult.shortNameUpdateConflict
                ) {
                  if (!Array.isArray(cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push(
                    `The short name "${checkNameResult.shortName}" confilcts with another data submission.`,
                  );
                }
              }
              if (col === 'dataset_long_name') {
                if (checkNameResult && checkNameResult.longNameIsAlreadyInUse) {
                  if (!Array.isArray(cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push(
                    `The long name "${checkNameResult.longName}" is already in use.`,
                  );
                } else if (
                  checkNameResult &&
                  checkNameResult.longNameUpdateConflict
                ) {
                  if (!Array.isArray(cellAudit)) {
                    cellAudit = [];
                  }
                  cellAudit.push(
                    `The long name "${checkNameResult.longName}" confilcts with another data submission.`,
                  );
                }
              }
            }
          }
          if (cellAudit.length) {
            rowAudit[col] = cellAudit;
          }
        }); // end column iteration

        const cellIsEmpty = (colName) => {
          const val = row[colName];
          const isEmpty = val === null || val === undefined || val === '';
          return isEmpty;
        };

        const rowIsEmpty = Object.keys(row).every(cellIsEmpty);

        if (rowIsEmpty) {
          // console.log ('ROW IS EMPTY', row, i, sheet);
          this.setState({
            ...this.state,
            delRow: {
              open: true,
              sheet,
              rowToRemove: i,
            },
          });
          // this.setState({ ...this.state, [sheet]: modifiedRows });
        } else {
          // console.log ('ROW IS NOT EMPTY', row)
        }

        if (Object.keys(rowAudit).length) {
          audit[i] = rowAudit;
        }
      }); // end rows iteration
    }

    return audit;
  };

  removeRow = (sheetName, rowToRemove) => {
    // console.log ('removeRow', sheetName, rowToRemove);
    if (!sheetName || !Number.isInteger(rowToRemove)) {
      return;
    }

    const sheetData = this.state[sheetName];
    if (!Array.isArray(sheetData)) {
      // console.log (`no data for sheetName ${sheetName}: cannot remove row`);
      return;
    }

    const newData = sheetData
      .slice(0, rowToRemove)
      .concat(sheetData.slice(rowToRemove + 1));

    // console.log (`setting ${sheetName} with newData`, newData);
    this.setState({
      ...this.state,
      [sheetName]: newData,
      delRow: null,
    });

    setTimeout(this.performAudit, 10);
    // this.performAudit(false, 'after remove row');
  };

  closeRemoveRowDialog = () => {
    this.setState({
      ...this.state,
      delRow: null,
    });
  };

  // Takes a workbook and returns an audit report
  performAudit = (shouldAdvanceStep, callerName) => {
    // console.log ('perform audit', { shouldAdvanceStep, callerName })
    const {
      // flags
      data,
      dataset_meta_data,
      dataChanges,
      integerDate,
      invalidDateString,
      is1904,
      missingDate,
      negativeNumberDate,
      vars_meta_data,
      workbook,
    } = this.state;

    const { userDataSubmissions } = this.props;
    const argsObj = {
      // flags
      data,
      dataset_meta_data,
      dataChanges,
      integerDate,
      invalidDateString,
      is1904,
      missingDate,
      negativeNumberDate,
      userDataSubmissions,
      vars_meta_data,
      workbook,
    };

    if (!workbook) {
      return;
    }

    let workbookAudit = this.auditWorkbook(argsObj);

    let report = {
      workbook: workbookAudit,
      data: this.auditRows(data, 'data'),
      dataset_meta_data: this.auditRows(dataset_meta_data, 'dataset_meta_data'),
      vars_meta_data: this.auditRows(vars_meta_data, 'vars_meta_data'),
      fatal: workbookAudit.fatal,
    };

    const errors = countErrors(report);
    report.errorCount = errors;

    this.props.setAudit(report);

    if (shouldAdvanceStep) {
      this.props.setSubmissionStep(1);
    }

    this.setState({
      ...this.state,
      loadingFile: {
        status: 'complete',
      },
    });
  };

  resetSubmissionFile = () => {
    console.log('clearing submission file');
    this.props.clearSubmissionFile();
  };

  resetAudit = () => {
    // console.log ('resetting audit state');
    this.props.setAudit(null);
  };

  resetLocalState = (resetStep = false, callerName) => {
    // console.log (`resetting local state (caller name: ${callerName})`);
    this.setState({
      ...this.state,
      rawFile: null,
      data: null,
      dataset_meta_data: null,
      vars_meta_data: null,
      changeLog: [],
      loadingFile: {
        status: 'not-tried',
        totalBytes: 0,
      },
    });

    if (resetStep) {
      this.props.setSubmissionStep(0);
    }
  };

  handleResetState = (resetStep = false, callerName) => {
    this.resetSubmissionFile();
    this.resetAudit();
    this.resetLocalState(resetStep, callerName);
  };

  handleChangeValidationStep = (validationStep) => {
    if (validationStep >= 0 && validationStep < validationSteps.length) {
      this.props.setSubmissionStep(validationStep);
    }
  };

  handleCellValueChanged = (event) => {
    const { rowIndex, newValue, column, node, context, oldValue } = event;

    if (oldValue === newValue) {
      // console.log ('a change event fired, but state has not changed');
      return;
    } else if (oldValue === null && newValue === '') {
      console.log('a change event fired when a user clicked on an empty cell');
      return;
    }

    const changeEvent = {
      row: rowIndex,
      col: column.colId,
      val: newValue,
      old: oldValue,
      sheet: context.sheet,
    };

    console.log('Cell Value Changed', changeEvent, node);

    // 1. check names
    const shouldResendCheckNameRequest =
      (column && column.colId === 'dataset_short_name') ||
      (column && column.colId === 'dataset_long_name');

    if (shouldResendCheckNameRequest) {
      let shortName = safePath([
        'dataset_meta_data',
        '0',
        'dataset_short_name',
      ])(this.state);
      let longName = safePath(['dataset_meta_data', '0', 'dataset_long_name'])(
        this.state,
      );

      console.log('state.shortName', shortName);
      if (column.colId === 'dataset_short_name') {
        console.log('update.shortName', newValue);
        shortName = newValue;
      }
      if (column.colId === 'dataset_long_name') {
        longName = newValue;
      }
      console.log('calling check-name api');
      this.props.checkSubmNamesRequestSend({
        shortName,
        longName,
        submissionId: this.props.submissionToUpdate,
      });
    }

    // 2. audit cell that has changed

    let { sheet } = context;

    let newAudit = this.auditCell(newValue, column.colId, rowIndex);

    console.log(`auditing cell ${column.colId}@${rowIndex}`, newValue, {
      newAudit,
    });

    let auditReport = {
      ...this.props.auditReport,
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
      let currentCellAudit = safePath([sheet, rowIndex, column.colId])(
        auditReport,
      );
      if (currentCellAudit) {
        // delete anything on current audit for this cell
        delete auditReport[sheet][rowIndex][column.colId];
      }
    }

    const row = safePath([sheet, rowIndex])(auditReport);
    // if no issues on this row of audit report, delete row
    if (row && Object.keys(row).length === 0) {
      auditReport[sheet][rowIndex] = null;
    } else {
      // console.log ('still audit value in row', auditReport[sheet][rowIndex])
    }

    // update the data
    let updated = this.state[sheet]
      .slice(0, rowIndex)
      .concat(node.data, ...this.state[sheet].slice(rowIndex + 1));

    // 3. update workbook in state with new data, and add a changeEvent to the change log
    console.log('setting state with updated sheet');
    this.setState(
      {
        ...this.state,
        [sheet]: updated,
        changeLog: this.state.changeLog.concat(changeEvent),
      },
      () => {
        // redraw rows
        console.log('calling redrawRows');
        const row = this.gridApi.getDisplayedRowAtIndex(rowIndex);
        this.gridApi.redrawRows({ rowNodes: [row] });

        // refresh cells
        console.log('calling refreshCells');
        event.api.refreshCells({
          force: true,
          rowNodes: [event.node], // pass rowNode that was edited
        });
      },
    );

    this.props.setSheetAudit({
      sheetName: sheet,
      sheetAudit: auditReport[sheet],
    });

    // 4. refresh workbook audit as well
    const {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      // flags
      is1904,
      invalidDateString,
      negativeNumberDate,
      integerDate,
      missingDate,
    } = this.state;

    const argsObj = {
      workbook,
      data,
      dataset_meta_data,
      vars_meta_data,
      // flags
      is1904,
      invalidDateString,
      negativeNumberDate,
      integerDate,
      missingDate,
    };

    const newWorkbookAudit = this.auditWorkbook(argsObj);
    this.props.setWorkbookAudit(newWorkbookAudit);

    // audit rows for this sheet
    const sheetAudit = this.auditRows(this.state[sheet], sheet);
    this.props.setSheetAudit({
      sheetName: sheet,
      sheetAudit: sheetAudit,
    });
  };

  handleReadFile = (file) => {
    const timer = debugTimer();
    timer.start();
    timer.add('restart local state');
    this.resetLocalState(false, 'handleReadFile');
    timer.add('set state: loading file');
    this.setState({
      ...this.state,
      loadingFile: {
        status: 'reading',
        totalBytes: 0,
      },
    });
    var totalBytes = 0;
    timer.add('create new file reader');
    var reader = new FileReader();

    timer.add('check file size threshold');
    if (file.size > 150000000) {
      console.log('file too large', file.size);
      this.setState({
        ...this.state,
        ...fileSizeTooLargeDummyState,
      });
      return;
    }

    // reset checkName result (because we have a new file)
    timer.add('set state: clear check name result');
    this.setState({
      ...this.state,
      checkNameResult: null,
      rawFile: file,
    });

    reader.onprogress = (ev) => {
      timer.add('onprogress');
      try {
        totalBytes = safePath(['total'])(ev);
        this.setState({
          ...this.state,
          loadingFile: {
            status: 'reading',
            totalBytes,
          },
        });
        console.log('size read: ' + formatBytes(totalBytes));
      } catch (e) {
        console.log('error: file reader progress event total was not a number');
      }
    };

    reader.onload = (progressEvent) => {
      timer.add('onload');
      this.setState({
        ...this.state,
        loadingFile: {
          status: 'parsing',
          totalBytes,
        },
      });

      timer.add('create Unit8Array from file drop');
      const readFile = new Uint8Array(progressEvent.target.result);
      let workbook;
      try {
        timer.add('xlsx read file');
        workbook = XLSX.read(readFile, { type: 'array' });
      } catch (e) {
        console.log('error loading file', e);
        this.props.snackbarOpen('Error reading file.');
        this.handleResetState(false, 'handleReadFile: loading error');
        this.setState({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0,
          },
        });
        return;
      }

      timer.add('sheet_to_json: data');

      let formatResult;
      try {
        timer.add('format data sheet');
        formatResult = formatDataSheet(workbook);
      } catch (e) {
        console.log('error loading file', e);
        this.props.snackbarOpen('Error parsing file.');
        this.handleResetState(false, 'handleReadFile: parse error');
        this.setState({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0,
          },
        });
        return;
      }

      let {
        // flags
        data,
        dataChanges,
        integerDate,
        invalidDateString,
        is1904,
        missingDate,
        negativeNumberDate,
      } = formatResult;

      // parse metadata sheets
      let _dataset_meta_data,
        dataset_meta_data,
        _vars_meta_data,
        vars_meta_data;

      try {
        timer.add('sheet_to_json: metadata');
        _dataset_meta_data = XLSX.utils.sheet_to_json(
          workbook.Sheets['dataset_meta_data'],
          { defval: null },
        );

        // console.log (_dataset_meta_data);
        timer.add('format metadata');
        dataset_meta_data = _dataset_meta_data
          ? formatDatasetMetadataSheet(_dataset_meta_data, workbook)
          : _dataset_meta_data;

        // vars metadata
        timer.add('sheet_to_json: vars metadata');
        _vars_meta_data = XLSX.utils.sheet_to_json(
          workbook.Sheets['vars_meta_data'],
          { defval: null },
        );

        timer.add('format vars metadata');
        vars_meta_data = _vars_meta_data
          ? formatVariableMetadataSheet(_vars_meta_data)
          : _vars_meta_data;
      } catch (e) {
        console.log('error parsing metadata sheets', e);
      }

      timer.add('check formatted sheets exist');
      if (!vars_meta_data || !dataset_meta_data || !data) {
        this.props.snackbarOpen('Error parsing file: missing worksheets.');
        this.handleResetState(
          false,
          'handleReadFile: missing worksheets error',
        );
        this.setState({
          ...this.state,
          loadingFile: {
            status: 'error',
            totalBytes: 0,
          },
        });
        return;
      }

      // dispatch check name
      const shortName = dataset_meta_data[0].dataset_short_name;
      const longName = dataset_meta_data[0].dataset_long_name;

      timer.add('dispatch check name');
      this.props.checkSubmNamesRequestSend({
        shortName,
        longName,
        submissionId: this.props.submissionToUpdate,
      });

      timer.add('set state with results');
      this.setState(
        {
          ...this.state,
          // flags
          data,
          dataset_meta_data,
          dataChanges,
          integerDate,
          invalidDateString,
          is1904,
          loadingFile: {
            status: 'validating',
            totalBytes,
          },
          missingDate,
          negativeNumberDate,
          vars_meta_data,
          workbook,
        },
        () => {
          this.props.setLoadingMessage('', {
            tag: 'ValidationTool#reader.onload',
          });
        },
      );

      // run report
      timer.add('call perform audit');
      this.performAudit(true, 'onload');
      timer.done();
      timer.report();
    };

    reader.readAsArrayBuffer(file);
  };

  handleUploadSubmission = () => {
    // rerun all audits
    this.performAudit(false);

    // prevent upload if errors exist
    if (!this.props.auditReport) {
      console.log('No audit report present; preventing submit action.');
      return;
    } else if (this.props.auditReport.errorCount.sum !== 0) {
      console.log('Errors are still present; aborting submit action.');
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

    console.log('dispatching upload', {
      submissionType: this.props.submissionType, // "new" | "update"
      submissionId: this.props.submissionToUpdate,
      datasetName: this.state.dataset_meta_data[0].dataset_short_name,
      dataSource: this.state.dataset_meta_data[0].dataset_source,
      datasetLongName: this.state.dataset_meta_data[0].dataset_long_name,
    });

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

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  };

  componentDidMount = () => {
    let submissionID = new URLSearchParams(window.location.search).get(
      'submissionID',
    );
    if (submissionID) {
      this.resetAudit();
      this.resetLocalState(
        false,
        'componentDidMount: submissionId in search string',
      );
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
      prevProps.submissionFile !== this.props.submissionFile &&
      this.props.submissionFile;

    if (prevFileIsNotSameAsNewFile) {
      this.handleReadFile(this.props.submissionFile);
    }

    // 3. should rerun audits
    const subTypeChanged =
      this.props.submissionType !== prevProps.submissionType;
    const nameCheckChanged =
      this.props.checkSubmissionNameResult !==
      prevProps.checkSubmissionNameResult;
    if ((subTypeChanged || nameCheckChanged) && this.props.submissionFile) {
      // call perform audit because nameCheck has changed
      // but don't change step after audit
      this.performAudit(false, 'componentDidUpdate');
    }

    // 4. should re-dispatch name check
    // if subId has been changed and there is already a file
    const subIdHasChanged =
      this.props.submissionToUpdate !== prevProps.submissionToUpdate;
    const fileHasBeenSelected = Array.isArray(this.state.dataset_meta_data);
    if (subIdHasChanged && fileHasBeenSelected) {
      const shortName = safePath(['0', 'dataset_short_name'])(
        this.state.dataset_meta_data,
      );
      const longName = safePath(['0', 'dataset_long_name'])(
        this.state.dataset_meta_data,
      );
      // console.log (`id ${this.props.submissionToUpdate} ?= ${prevProps.submissionToUpdate}`, typeof this.props.submissionToUpdate, prevProps.submissionToUpdate);
      // console.log ('dispatching', subIdHasChanged, fileHasBeenSelected);
      this.props.checkSubmNamesRequestSend({
        shortName,
        longName,
        submissionId: this.props.submissionToUpdate,
      });
    }

    // 5. success & should reset state
    const submissionWasSuccessfullyUploaded =
      this.props.submissionUploadState === states.succeeded &&
      this.props.submissionUploadState !== prevProps.submissionUploadState;

    if (submissionWasSuccessfullyUploaded) {
      console.log('resetting validation tool state');
      this.handleResetState();
    }

    const prevAudit = prevProps.auditReport;
    const currAudit = this.props.auditReport;

    let shouldRefreshCells = false;
    ['data', 'dataset_meta_data', 'vars_meta_data', 'workbook'].forEach(
      (sh) => {
        const prev = safePath([sh])(prevAudit);
        const curr = safePath([sh])(currAudit);
        const dataSheet = safePath([sh])(this.state);

        if (!deepEqual(prev, curr) && Array.isArray(dataSheet)) {
          shouldRefreshCells = true;
        }
      },
    );

    if (shouldRefreshCells) {
      if (this.gridApi) {
        this.gridApi.redrawRows();
      } else {
        // console.log ('no grid api');
      }
    }
  };

  render = () => {
    if (!this.props.user) return <LoginRequiredPrompt />;

    const { classes } = this.props;
    const { validationStep } = this.props;

    const shortName = safePath([
      'dataset_meta_data',
      '0',
      'dataset_short_name',
    ])(this.state);
    const longName = safePath(['dataset_meta_data', '0', 'dataset_long_name'])(
      this.state,
    );

    const summary = {
      shortName,
      longName,
      cols: this.state.data ? Object.keys(this.state.data[0]).length : 0,
      rows: this.state.data ? this.state.data.length : 0,
      vars: this.state.vars_meta_data ? this.state.vars_meta_data.length : 0,
    };

    return (
      <div className={classes.validationToolWrapper}>
        <DeleteEmptyRowConfirmation
          data={this.state.delRow}
          remove={this.removeRow}
          close={this.closeRemoveRowDialog}
        />
        <StepAssistant
          step={this.props.validationStep}
          changeStep={this.handleChangeValidationStep}
        />
        <FullWidthContainer paddingTop={120}>
          <Section>
            <Header newLongName={longName} step={validationStep} />

            <div>
              <Navigation
                file={this.props.submissionFile}
                step={validationStep}
                datasetName={shortName}
                summary={summary}
                changeStep={this.handleChangeValidationStep}
              />
            </div>

            <Chooser
              step={this.props.validationStep}
              status={this.state.loadingFile}
              reset={this.handleResetState}
            />

            <Step1
              step={this.props.validationStep}
              changeStep={this.handleChangeValidationStep}
              reset={this.handleResetState}
            />

            <Step2
              step={this.props.validationStep}
              fileData={{
                data: this.state.data,
                dataset_meta_data: this.state.dataset_meta_data,
                vars_meta_data: this.state.vars_meta_data,
              }}
              onGridReady={this.onGridReady}
              handleCellValueChanged={this.handleCellValueChanged}
              handleGridSizeChanged={this.handleGridSizeChanged}
              auditCell={this.auditCell}
              dataSubmissionSelectOptions={
                this.props.dataSubmissionSelectOptions
              }
              getChangeLog={() => this.state.changeLog}
            />

            <Step3
              validationStep={validationStep}
              handleUploadSubmission={this.handleUploadSubmission}
              shortName={shortName}
              handleDownloadWorkbook={() =>
                downloadWorkbook({
                  data: this.state.data,
                  dataset_meta_data: this.state.dataset_meta_data,
                  vars_meta_data: this.state.vars_meta_data,
                  setLoadingMessage: this.props.setLoadingMessage,
                })
              }
              resetState={this.handleResetState}
              getChangeLog={() => this.state.changeLog}
              dataChanges={this.state.dataChanges}
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

// Step 2: Data Sheet Validaition

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Typography, Paper, Tab, Tabs } from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { safePath } from '../../Utility/objectUtils';
import { flattenErrors } from './Helpers/audit';

import ValidationGrid from './ValidationGrid';
import DSCustomGridHeader from './DSCustomGridHeader';

import ValidationGridColumns from './ValidationGridColumns';
import { textAreaLookup } from './ValidationToolConstants';
import { auditKeyToLabel } from './ValidationToolConstants';
import { getChangeForCell } from './Helpers/changeLog';

import ReduxStore from '../../Redux/store';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    color: 'white',
    '& > h5': {
      marginBottom: '1em',
    },
  },
  workbookTab: {
    textTransform: 'none',
  },
  tabs: {
    marginBottom: '1em',
    '& .MuiTab-root': {
      overflow: 'unset',
      margin: '0 20px',
    },
  },
  paper: {
    padding: '10px',
    borderRadius: '5px',
    margin: '2em 0',
  },
}));

// HELPERS

const StyledBadgeRed = withStyles((theme) => ({
  badge: {
    right: -11,
    top: 0,
    backgroundColor: 'rgb(255, 0, 0)',
  },
}))(Badge);

const StyledBadgeGreen = withStyles((theme) => ({
  badge: {
    right: -11,
    top: 1,
    backgroundColor: 'green',
  },
}))(Badge);

const generateSelectOptions = (reduxStoreOptions) => ({
  var_temporal_res: reduxStoreOptions.Temporal_Resolution,
  var_discipline: reduxStoreOptions.Study_Domain,
  var_sensor: reduxStoreOptions.Sensor,
  var_spatial_res: reduxStoreOptions.Spatial_Resolution,
  dataset_make: reduxStoreOptions.Make,
  visualize: [0, 1],
  climatology: [0, 1],
});

const getColumns = (sheet, data, tooltipValueGetter) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (sheet === 'dataset_meta_data' || sheet === 'vars_meta_data') {
    return ValidationGridColumns[sheet];
  }

  const nonKeys = ['__rowNum__'];

  const presetColHeaders = {
    lon: 'lon',
    lat: 'lat',
    // time: 'time',
    depth: 'depth',
  };

  const nameToHeader = (name) => presetColHeaders[name] || name;

  const detectDataType = (colId) => {
    let t;
    let row = 0;
    let attemptLimit = 100 < data.length ? 100 : data.length;
    while (!t && row < attemptLimit) {
      const valAtRow = safePath([row, colId])(data);
      if (valAtRow === undefined) {
        continue;
      } else if (valAtRow === '') {
        t = 'string';
      } else if (!isNaN(valAtRow)) {
        t = 'number';
      }
      row += 1;
    }
    return t;
  };

  const numberParser = (ev) => {
    const { newValue } = ev;
    if (!Number.isFinite(Number(newValue))) {
      console.log('NOT A NUMBER', newValue);
      return null;
    } else {
      const parsedValue = Number(newValue);
      console.log('PARSED VALUE', parsedValue);
      return parsedValue;
    }
  };
  /* const numberGetter = (params) => {
   *   console.log (params);
   *   const val = params.data[params.colDef.field];
   *   return isNaN(val) ? null : Number(val);
   * } */

  const provideColDef = (columnName) => {
    const col = ValidationGridColumns.data.find(
      (colDef) => colDef.field === columnName,
    );
    if (col) {
      return Object.assign(col, { tooltipValueGetter });
    } else {
      const dataType = detectDataType(columnName);
      const def = {
        headerName: nameToHeader(columnName),
        field: columnName,
        // type: dataType,
        valueParser: dataType === 'number' ? numberParser : (id) => id,
        tooltipValueGetter,
      };
      return def;
    }
  };

  const columns = Object.keys(data[0])
    .filter((key) => !nonKeys.includes(key))
    .map(provideColDef);

  return columns;
};

const getSheet = (n) => {
  switch (n) {
    case 0:
      return 'data';
    case 1:
      return 'dataset_meta_data';
    case 2:
      return 'vars_meta_data';
    default:
      return null;
  }
};

const goToNextError = (data, gridApi, sheet, auditReport, setMessage) => {
  if (!data) {
    console.log('no data');
    return;
  }
  if (!sheet) {
    console.log('no sheet');
    return;
  }
  if (!gridApi) {
    console.log('no gridApi');
    return;
  }

  let lastFocusedCell = gridApi.getFocusedCell();

  let lastFocusedRow = -1;
  let lastFocusedColKey = null;

  if (lastFocusedCell) {
    lastFocusedRow = lastFocusedCell.rowIndex;
    lastFocusedColKey = lastFocusedCell.column.colId;
  }

  console.log('lastFocusedCell', lastFocusedCell, {
    lastFocusedRow,
    lastFocusedColKey,
  });

  const allErrorsBySheet = {
    data: flattenErrors(auditReport.data),
    dataset_meta_data: flattenErrors(auditReport.dataset_meta_data),
    vars_meta_data: flattenErrors(auditReport.vars_meta_data),
  };

  const lookupErrorMessage = ({ row, col }) => {
    const auditErrorText = safePath([sheet, row, col])(auditReport);
    if (auditErrorText && setMessage) {
      const msg = Array.isArray(auditErrorText)
        ? auditErrorText.join('. ')
        : auditErrorText;
      setMessage(msg);
    }
  };

  const goToError = ({ row, col }) => {
    console.log('goToError', { row, col });
    if (gridApi) {
      gridApi.ensureColumnVisible(col);
      gridApi.setFocusedCell(row, col, null);
      gridApi.startEditingCell({ rowIndex: row, colKey: col });
      lookupErrorMessage({ row, col });
    }
  };

  const thereAreErrorsOnCurrentSheet = allErrorsBySheet[sheet].length > 0;

  if (thereAreErrorsOnCurrentSheet) {
    const positionOfLastError = allErrorsBySheet[sheet].findIndex(
      (err) => err.row === lastFocusedRow && err.col === lastFocusedColKey,
    );
    console.log('positionOfLastError', positionOfLastError);
    if (positionOfLastError > -1) {
      // find next after current
      const hasNextError =
        allErrorsBySheet[sheet].length > positionOfLastError + 1;
      console.log('hasNextError', hasNextError);
      if (hasNextError) {
        const nextError = allErrorsBySheet[sheet][positionOfLastError + 1];
        // go to nextError
        goToError(nextError);
        return;
      } else {
        console.log('go to first error', allErrorsBySheet[sheet][0]);
        goToError(allErrorsBySheet[sheet][0]);
        return;
      }
    } else {
      // go to first error
      console.log('go to first error', allErrorsBySheet[sheet][0]);
      goToError(allErrorsBySheet[sheet][0]);
      return;
    }
  }
};

// COMPONENT

const Step2 = (props) => {
  const cl = useStyles();

  const {
    dataSubmissionSelectOptions,
    step,
    // errorCount,
    // auditReport
    fileData, // sheets stored on parent state
    handleCellValueChanged,
    handleGridSizeChanged,
    auditCell,
    onGridReady,
    getChangeLog,
  } = props;

  // console.log ('FILE DATA (into grid)',fileData);

  const auditReport = useSelector((state) => state.auditReport);
  const errorCount = auditReport && auditReport.errorCount;

  const gridApi = useRef();

  let [message, setMessage] = useState();

  let [tab, setTab] = useState(0);

  useEffect(() => {
    if (step !== 2 && tab !== 0) {
      // reset to first tab every time the user
      // navigates away from this step
      setTab(0);
    }
  }, [step]);

  useEffect(() => {
    if (gridApi && gridApi.current) {
      // console.log ('SHOULD refresh cells')
      // gridApi.current;
    }
  }, [auditReport]);

  const sheet = getSheet(tab);
  const currentSheetLabel = auditKeyToLabel[sheet];

  const handleClickTab = (ev, newVal) => {
    setTab(newVal);
  };

  const handleOnGridReady = (args) => {
    gridApi.current = args.api;
    onGridReady(args);
  };

  const handleFindNext = () => {
    if (!gridApi.current) {
      // console.log ('no ref to gridApi');
    } else {
      const currentSheet = getSheet(tab);
      goToNextError(
        fileData,
        gridApi.current,
        currentSheet,
        auditReport,
        setMessage,
      );
    }
  };

  const checkCellStyle = (params) => {
    const row = params.node.childIndex;
    const colId = params.column.colId;
    const { sheet: sheetName } = params.context;
    const changeLog = getChangeLog();

    // getting this by the enclosed result of a selector does not work
    const auditReport_ = (ReduxStore.getState() || {}).auditReport;

    let cellStyle = {};

    const path = [sheetName, row, colId];
    const shouldReStyleWithError = safePath(path)(auditReport_);

    const cevDef = { sheet: sheetName, row, col: colId };
    const shouldReStyleWithModified = getChangeForCell(changeLog, cevDef);

    if (shouldReStyleWithError) {
      // console.log ('SETTING CELL STYLE: ERROR', row, colId, shouldReStyleWithError)
      cellStyle.boxShadow = 'inset 0 0 2px 2px rgba(255, 0, 0, 1)';
    } else if (shouldReStyleWithModified) {
      cellStyle.boxShadow = 'inset 0 0 2px 2px rgba(34, 163, 185)';
    } else {
      cellStyle.boxShadow = 'unset';
    }
    return cellStyle;
  };

  const tooltipValueGetter = (args) => {
    const { rowIndex, column, context } = args;
    if (Number.isInteger(rowIndex) && column && column.colId) {
      const errorForCell = safePath([context.sheet, rowIndex, column.colId])(
        auditReport,
      );
      if (Array.isArray(errorForCell)) {
        return errorForCell.join(' ');
      }
    } else {
      // console.log ('value getter missing args', rowIndex)
    }
    return null;
  };

  const onCellFocused = (ev) => {
    setMessage();
  };

  const defaultColumnDef = {
    menuTabs: [],
    resizable: true,
    editable: true,
    cellStyle: checkCellStyle,
    tooltipValueGetter,
    cellEditor: 'DSCellEditor',
    width: 270,
    headerComponentFramework: DSCustomGridHeader,
  };

  if (step !== 2) {
    return <React.Fragment />;
  }

  if (!errorCount) {
    return <React.Fragment />;
  }

  return (
    <div className={cl.wrapper}>
      <Typography variant={'h5'}>Data Sheet Validation</Typography>
      {errorCount[sheet] ? (
        <Button variant="contained" color="primary" onClick={handleFindNext}>
          Go To Next Error on {currentSheetLabel}
        </Button>
      ) : (
        ''
      )}
      <Typography variant={'body1'}>{message}</Typography>

      <Paper elevation={2} className={cl.paper}>
        <Tabs value={tab} onChange={handleClickTab} className={cl.tabs}>
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
          />

          <Tab
            value={1}
            label={
              errorCount['dataset_meta_data'] > 0 ? (
                <StyledBadgeRed badgeContent={errorCount['dataset_meta_data']}>
                  Dataset Metadata
                </StyledBadgeRed>
              ) : (
                <StyledBadgeGreen badgeContent={'\u2713'}>
                  Dataset Metadata
                </StyledBadgeGreen>
              )
            }
          />

          <Tab
            value={2}
            label={
              errorCount['vars_meta_data'] > 0 ? (
                <StyledBadgeRed badgeContent={errorCount['vars_meta_data']}>
                  Variable Metadata
                </StyledBadgeRed>
              ) : (
                <StyledBadgeGreen badgeContent={'\u2713'}>
                  Variable Metadata
                </StyledBadgeGreen>
              )
            }
          />
        </Tabs>

        <ValidationGrid
          onGridReady={handleOnGridReady}
          rowData={fileData[sheet]} // from call to getSheet, which takes current tab
          defaultColumnDef={defaultColumnDef}
          handleCellValueChanged={handleCellValueChanged}
          handleGridSizeChanged={handleGridSizeChanged}
          columns={getColumns(sheet, fileData[sheet], tooltipValueGetter)}
          onCellFocused={onCellFocused}
          gridContext={{
            sheet,
            getAuditReport: () => auditReport,
            textAreaLookup,
            selectOptions: generateSelectOptions(dataSubmissionSelectOptions),
            auditCell: auditCell,
          }}
        />
      </Paper>
    </div>
  );
};

export default Step2;

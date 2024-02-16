// Step 2: Data Sheet Validaition

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Typography,
  Paper,
  Tab,
  Tabs,
} from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { safePath } from '../../Utility/objectUtils';
import { flattenErrors } from './Helpers/audit';

import ValidationGrid from './ValidationGrid';
import DSCustomGridHeader from './DSCustomGridHeader';

import ValidationGridColumns from './ValidationGridColumns';
import { textAreaLookup } from './ValidationToolConstants';

const useStyles = makeStyles ((theme) => ({
  wrapper: {
    color: 'white',
    '& > h5': {
      marginBottom: '1em',
    }
  },
  workbookTab: {
    textTransform: 'none',
  },
  tabs: {
    marginBottom: '1em',
    '& .MuiTab-root': {
      overflow: 'unset',
      margin: '0 20px'
    }
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
});

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
    case 1:
      return 'dataset_meta_data';
    case 2:
      return 'vars_meta_data';
    default:
      return null;
  }
}

const getTabFromSheet = (s) => {
  switch (s) {
    case 'data':
      return 0;
    case 'dataset_meta_data':
      return 1;
    case 'vars_meta_data':
      return 2;
    default:
      return null;
  }
}

const nextTab = (currentTab) => {
  if (currentTab < 2) {
    return currentTab + 1;
  } else {
    return 0;
  }
}

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

  const allErrorsBySheet = {
    'data':  flattenErrors (auditReport.data),
    'dataset_meta_data':flattenErrors (auditReport.dataset_meta_data),
    'vars_meta_data':flattenErrors (auditReport.vars_meta_data),
  };

  const lookupErrorMessage = ({ row, col }) => {
    const auditErrorText = safePath ([sheet, row, col]) (auditReport)
    if (auditErrorText && setMessage) {
      setMessage(auditErrorText);
    }
  }

  const goToError = ({ row, col }) => {
    if (gridApi) {
      gridApi.ensureColumnVisible(col);
      gridApi.startEditingCell({ rowIndex: row, colKey: col });
      lookupErrorMessage({ row, col });
    }
  }

  const thereAreErrorsOnCurrentSheet = allErrorsBySheet[sheet].length > 0;

  if (thereAreErrorsOnCurrentSheet) {
    console.log ('current errors',allErrorsBySheet[sheet]);
    const positionOfLastError = allErrorsBySheet[sheet].findIndex ((err) =>
      err.row === lastFocusedRow && err.col === lastFocusedColKey);
    if (positionOfLastError) {
      // find next after current
      const hasNextError = allErrorsBySheet[sheet].length > positionOfLastError;
      if (hasNextError) {
        const nextError = allErrorsBySheet[sheet][positionOfLastError + 1];
        // go to nextError
        goToError (nextError);
        return;
      }
    } else {
      // go to first error
      goToError (allErrorsBySheet[sheet][0]);
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
    onGridReady
  } = props;

  // TODO
  // 1. move Tool state for tabs into this component
  // 2. move find next error into this component
  // 3. move grid methods into this component
  // 4. move getSheet into this component

  const auditReport = useSelector((state) => state.auditReport);
  const errorCount = auditReport && auditReport.errorCount;

  const gridApi = useRef();

  let [message, setMessage] = useState();

  let [tab, setTab] = useState(0);

  const sheet = getSheet(tab);

  const handleClickTab = (ev, newVal) => {
    setTab (newVal);
  };

  const handleOnGridReady = (args) => {
    gridApi.current = args.api;
    onGridReady (args)
  };

  const handleFindNext = () => {
    if (!gridApi.current) {
      console.log ('no ref to gridApi');
    } else {
      const currentSheet = getSheet(tab);
      goToNextError (fileData, gridApi.current, currentSheet, auditReport, setMessage);
    }
  }

  const checkCellStyle = (params) => {
    let row = params.node.childIndex;
    let colId = params.column.colId;
    let { sheet: sheetName } = params.context;

    let cellStyle = {};

    const path = [sheetName, row, colId];
    const shouldReStyle = safePath (path) (auditReport);
    if (shouldReStyle) {
      cellStyle.boxShadow = 'inset 0 0 2px 2px rgba(255, 0, 0, 1)';
    }

    return cellStyle;
  };

  const tooltipValueGetter = (args) => {
    const { rowIndex, column, context } = args;
    if (rowIndex && column && column.colId) {
      const errorForCell = safePath ([context.sheet, rowIndex, column.colId]) (auditReport);
      if (Array.isArray(errorForCell)) {
        return errorForCell.join (' ');
      }
    }
    return null;
  }

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

  return (
    <div className={cl.wrapper}>
      <Typography variant={"h5"}>Data Sheet Validation</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFindNext}
      >
        Go To Next Error
      </Button>
      <Typography variant={"body1"}>{ message }</Typography>

      <Paper elevation={2} className={cl.paper}>
        <Tabs value={tab} onChange={handleClickTab} className={cl.tabs} >
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
        />
      </Tabs>

        <ValidationGrid
          onGridReady={handleOnGridReady}
          rowData={fileData[sheet]} // from call to getSheet, which takes current tab
          defaultColumnDef={defaultColumnDef}
          handleCellValueChanged={handleCellValueChanged}
          handleGridSizeChanged={handleGridSizeChanged}
          columns={getColumns(sheet, fileData[sheet])}
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

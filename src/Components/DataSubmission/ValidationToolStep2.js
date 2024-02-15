// Step 2: Data Sheet Validaition

import React, { useEffect, useState } from 'react';
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

//TODO clean this up when it's not late at night
const handleFindNext = () => {
  /* let lastFocused = this.gridApi.getFocusedCell();
   * let sheet = getSheet(this.state.tab);
   * let { auditReport } = this.state;


   * let cols = getColumns(sheet, this.state[sheet]);
   * var startRow = lastFocused ? lastFocused.rowIndex : -1;
   * var startColIndex = lastFocused
   *   ? cols.findIndex((e) => e === lastFocused.column.colId)
   *   : 0;

   * // Search the remaining columns in focused row
   * if (lastFocused) {
   *   for (let i = startColIndex + 1; i < cols.length && i > -1; i++) {
   *     if (
   *       auditReport[sheet][startRow] &&
   *       auditReport[sheet][startRow][cols[i]]
   *     ) {
   *       this.gridApi.ensureColumnVisible(cols[i]);
   *       this.gridApi.startEditingCell({
   *         rowIndex: startRow,
   *         colKey: cols[i],
   *       });
   *       return;
   *     }
   *   }
   * }

   * // Start from startRow + 1, end at beginning of startRow
   * for (let i = startRow + 1; i != startRow; i++) {
   *   if (auditReport && auditReport[sheet] && auditReport[sheet][i]) {
   *     for (let j = 0; j < cols.length; j++) {
   *       if (auditReport[sheet][i][cols[j]]) {
   *         this.gridApi.ensureColumnVisible(cols[j]);
   *         this.gridApi.startEditingCell({
   *           rowIndex: i,
   *           colKey: cols[j],
   *         });
   *         return;
   *       }
   *     }
   *   } else {
   *     i = -1
   *   }

   *   if (auditReport[sheet] && i === auditReport[sheet].length) {
   *     i = -1;
   *   }
   * }

   * // Search the rest of start row
   * if (lastFocused) {
   *   for (let i = 0; i <= startColIndex && i < cols.length; i++) {
   *     if (
   *       auditReport[sheet][startRow] &&
   *       auditReport[sheet][startRow][cols[i]]
   *     ) {
   *       this.gridApi.ensureColumnVisible(cols[i]);
   *       this.gridApi.startEditingCell({
   *         rowIndex: startRow,
   *         colKey: cols[i],
   *       });
   *       return;
   *     }
   *   }
   * } */
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

  let [tab, setTab] = useState(0);

  const sheet = getSheet(tab);

  const handleClickTab = (ev, newVal) => {
    setTab (newVal);
  };

  const handleOnGridReady = (args) => {
    onGridReady (args)
  };

  const defaultColumnDef = {
    menuTabs: [],
    resizable: true,
    editable: true,
    cellStyle: checkCellStyle,
    cellEditor: 'DSCellEditor',
    width: 270,
    headerComponentFramework: DSCustomGridHeader,
  };

  const checkCellStyle = (params) => {
    console.log ('checking cell style', params);
    let row = params.node.childIndex;
    let colId = params.column.colId;
    let { sheet: sheetName } = params.context;

    let cellStyle = {};

    if (safePath ([sheetName, row, colId]) (auditReport)) {
      cellStyle.boxShadow = 'inset 0 0 1px 1px rgba(255, 0, 0, .5)';
    }

    return cellStyle;
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
// Step 2: Data Sheet Validaition

import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Typography,
  Paper,
  Tab,
  Tabs,
} from '@material-ui/core';
import messages from './Messages';
import styles from './ValidationToolStyles';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { safePath } from '../../Utility/objectUtils';

import ValidationGrid from './ValidationGrid';
import DSCustomGridHeader from './DSCustomGridHeader';

import ValidationGridColumns from './ValidationGridColumns';
import {
  textAreaLookup,
  // validationSteps,
  // fileSizeTooLargeDummyState,
} from './ValidationToolConstants';
import { AgGridReact } from 'ag-grid-react';



const useStyles = makeStyles (styles);

// HELPERS

const errorOutlineStyle = {
  color: 'rgba(255, 0, 0, .7)',
  margin: '0 2px -5px 0',
  fontSize: '1.4em',
};

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
  const classes = useStyles();

  const {
    dataSubmissionSelectOptions,
    step,
    auditReport,
    errorCount,
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
    let colId = params.column.colId;
    let { sheet: sheetName } = params.context;

    let cellStyle = {};

    if (safePath ([sheetName, 'row', colId]) (auditReport)) {
      cellStyle.boxShadow = 'inset 0 0 1px 1px rgba(255, 0, 0, .5)';
    }

    return cellStyle;
  };

  if (step !== 2) {
    return <React.Fragment />;
  }

  return (
    <Paper elevation={2} className={`${classes.workbookAuditPaper}`}>
      <Typography variant={"h5"}>Validate Data Sheet</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleFindNext}
      >
        Go To Next Error
      </Button>
      <Tabs value={tab} onChange={handleClickTab}>
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

    <AgGridReact />
    </Paper>
  );
};

export default Step2;

// Variable grid appearing on dataset pages

import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';

import {
  withStyles,
  TextField,
  InputAdornment,
  Link,
  Dialog,
} from '@material-ui/core';
import { Search, Menu, ArrowUpward, ArrowDownward } from '@material-ui/icons';

import { AgGridReact } from 'ag-grid-react';

import ReactMarkdown from 'react-markdown';

import HelpButtonAndDialog from '../Help/HelpButtonAndDialog';
import VariableGridHelpContents from './VariableGridHelpContents';

import colors from '../../enums/colors';

const rendererStyles = (theme) => ({
  dialogPaper: {
    backgroundColor: colors.solidPaper,
    color: 'white',
    padding: '12px',
  },

  markdown: {
    '& img': {
      maxWidth: '100%',
      margin: '20px auto 20px auto',
      display: 'block',
    },
    '& a': {
      color: colors.primary,
      textDecoration: 'none',
    },
  },
});

const CommentCellRenderer = withStyles(rendererStyles)((props) => {
  const { value, classes } = props;

  const [open, setOpen] = React.useState(false);

  return !props.value || (props.value && props.value.length) < 20 ? (
    props.value
  ) : (
    <React.Fragment>
      <Link
        component="button"
        style={{ color: colors.primary, fontSize: '12px', lineHeight: '38px' }}
        onClick={() => setOpen(true)}
      >
        View Comment
      </Link>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        classes={{ paper: classes.dialogPaper }}
      >
        <ReactMarkdown source={value} className={classes.markdown} />
      </Dialog>
    </React.Fragment>
  );
});

const columnDefs = [
  {
    headerName: 'General Information',
    children: [
      {
        headerName: 'Variable Name',
        field: 'Long_Name',
        tooltipField: 'Long_Name',
      },
      { headerName: 'Short Name', field: 'Variable' },
      { headerName: 'Sensor', field: 'Sensor' },
      { headerName: 'Unit', field: 'Unit' },
      {
        headerName: 'Comment',
        field: 'Comment',
        tooltipField: 'Comment',
        cellRenderer: 'commentCellRenderer',
      },
    ],
  },

  {
    headerName: 'Coverage',
    children: [
      { headerName: 'Lat Start', field: 'Lat_Min' },
      { headerName: 'Lat End', field: 'Lat_Max' },
      { headerName: 'Lon Start', field: 'Lon_Min' },
      { headerName: 'Long End', field: 'Lon_Max' },
      { headerName: 'Time Start', field: 'Time_Min' },
      { headerName: 'Time End', field: 'Time_Max' },
      { headerName: 'Depth Start', field: 'Depth_Min' },
      { headername: 'Depth End', field: 'Depth_Max' },
    ],
  },

  {
    headerName: 'Table Statistics',
    children: [
      { headerName: 'Database Row Count', field: 'Variable_Count' },
      { headerName: 'Mean Value', field: 'Variable_Mean' },
      { headerName: 'Min Value', field: 'Variable_Min' },
      { headerName: 'Max Value', field: 'Variable_Max' },
      { headerName: 'STD', field: 'Variable_STD' },
      { headerName: '25th Quantile', field: 'Variable_25th' },
      { headerName: '50th Quantile', field: 'Variable_50th' },
      { headerName: '75th Quantile', field: 'Variable_75th' },
      { headerName: 'Keywords', field: 'Keywords', hide: true },
    ],
  },
];

const defaultColumnDef = {
  cellStyle: { fontSize: '12px', lineHeight: '38px' },
  menuTabs: [],
  suppressMovable: true,
  sortable: true,
};

// const getMainMenuItems = ({ column }) => column.rowGroupActive ? ['rowUnGroup'] : ['rowGroup'];

const styles = (theme) => ({
  gridWrapper: {
    border: '1px solid black',
  },

  helpButton: {
    margin: '0 0 -40px 6px',
  },
});

const DatasetPageAGGrid = React.memo((props) => {
  const { Variables, classes } = props;
  const [quickSearch, setQuickSearch] = useState('');

  return (
    <div>
      <TextField
        className={classes.gridSearch}
        margin="normal"
        type="text"
        variant="outlined"
        name="quickSearch"
        value={quickSearch}
        label="Variable Filter"
        onChange={(e) => setQuickSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search style={{ color: colors.primary }} />
            </InputAdornment>
          ),
        }}
      />

      <HelpButtonAndDialog
        title="Variable Table"
        content={<VariableGridHelpContents />}
        buttonClass={classes.helpButton}
      />

      <div
        className={classes.gridWrapper + ' ag-theme-material'}
        style={{
          height: `${Variables.length * 60 + 200}px`,
          maxHeight: '600px',
        }}
      >
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColumnDef}
          rowData={Variables}
          onGridReady={(params) => params.columnApi.autoSizeAllColumns()}
          enableCellTextSelection={true}
          rowHeight={38}
          enableBrowserTooltips={true}
          cacheQuickFilter={true}
          quickFilterText={quickSearch}
          getContextMenuItems={() => ['copy', 'csvExport']}
          icons={{
            menu: ReactDOMServer.renderToString(
              <Menu style={{ fontSize: '1.2rem', color: colors.primary }} />,
            ),
            sortAscending: ReactDOMServer.renderToString(
              <ArrowUpward
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
            sortDescending: ReactDOMServer.renderToString(
              <ArrowDownward
                style={{ fontSize: '1.2rem', color: colors.primary }}
              />,
            ),
          }}
          frameworkComponents={{ commentCellRenderer: CommentCellRenderer }}
        />
      </div>
    </div>
  );
});

export default withStyles(styles)(DatasetPageAGGrid);

// Variable grid appearing on dataset pages

import {
  Dialog,
  InputAdornment,
  Link,
  TextField,
  withStyles,
} from '@material-ui/core';
import { ArrowDownward, ArrowUpward, Menu, Search } from '@material-ui/icons';
import { AgGridReact } from 'ag-grid-react';
import React, { useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import colors from '../../enums/colors';
import HelpButtonAndDialog from '../Navigation/Help/HelpButtonAndDialog';
import VariableGridHelpContents from './VariableGridHelpContents';
import S from '../../Utility/sanctuary';
import $ from 'sanctuary-def';

let parseVariableUnstructuredMetadata = (vum) => {
  let parsed;
  try {
    // sql returns comma separated json objects, but we can't simply
    // split that string on commas, because there are commas within the json
    // objects;
    let arrayifiedVum = `[${vum}]`;
    parsed = JSON.parse(arrayifiedVum);
  } catch (e) {
    console.log('could not parse');
    console.log(vum);
  }
  return parsed;
}

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
      {
        headerName: 'Unstructured Metadata',
        field: 'Unstructured_Variable_Metadata',
        valueGetter: (param) => {
          let vum = param.data.Unstructured_Variable_Metadata;
          if (vum && vum.length > 0) {
            let pVum = parseVariableUnstructuredMetadata(vum);
            if (pVum) {
              return `View Metadata (${pVum.length})`;
            }
          }
          return '';
        }
      }
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
          onCellClicked={(e) => {
            let maybeColId = S.gets(S.is($.String))(['event', 'originalTarget', 'attributes', 'col-id', 'value'])(e);
            let x = S.fromMaybe('unknown')(maybeColId);

            let maybeVum = S.gets(S.is($.String))(['node', 'data', 'Unstructured_Variable_Metadata'])(e);
            let y = S.fromMaybe('unknown') (maybeVum);


            console.log('event', e.event);
            console.log('node', e.node);
            console.log('clicked', x, y);

            if (x === '') {
              //
            } else {
              //
            }
          }}
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

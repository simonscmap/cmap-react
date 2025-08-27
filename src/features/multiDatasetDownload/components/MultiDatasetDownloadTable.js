import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AgGridReact } from 'ag-grid-react';
import { Checkbox } from '@material-ui/core';

import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';

const ROW_HEIGHT = 35; // px

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    height: '400px',
    width: '100%',
    '& .ag-theme-material': {
      backgroundColor: 'rgba(16, 43, 60, 0.6)',
    },
    '& .ag-theme-material .ag-header': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
    '& .ag-status-bar': {
      border: 0,
    },
    '& .ag-theme-material .ag-row': {
      border: 0,
    },
    '& .ag-theme-material .ag-cell': {
      lineHeight: `${ROW_HEIGHT}px`,
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    '& .ag-theme-material .ag-header-cell': {
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    '& .ag-theme-material .ag-row-selected': {
      backgroundColor: 'rgba(16, 43, 60, 1)',
    },
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
}));

const CheckboxCellRenderer = ({ data, api }) => {
  const { isDatasetSelected, toggleDatasetSelection } =
    useMultiDatasetDownloadStore();
  const isSelected = isDatasetSelected(data.Dataset_Name);

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleDatasetSelection(data.Dataset_Name);
  };

  return (
    <Checkbox
      checked={isSelected}
      onChange={handleToggle}
      color="primary"
      size="small"
    />
  );
};

const columnDefinitions = [
  {
    field: 'selection',
    headerName: '',
    width: 50,
    cellRenderer: CheckboxCellRenderer,
    suppressMenu: true,
    sortable: false,
    resizable: false,
    pinned: 'left',
  },
  {
    field: 'Dataset_Name',
    headerName: 'Dataset Name',
    flex: 2,
    cellRenderer: (params) => {
      const { value } = params;
      return `<div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${value || ''}
              </div>`;
    },
  },
  {
    field: 'Dataset_Long_Name',
    headerName: 'Description',
    flex: 3,
    cellRenderer: (params) => {
      const { value } = params;
      return `<div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${value || ''}
              </div>`;
    },
  },
  {
    field: 'Row_Count',
    headerName: 'Row Count',
    width: 120,
    cellRenderer: (params) => {
      const { value } = params;
      return value ? value.toLocaleString() : 'N/A';
    },
  },
];

const MultiDatasetDownloadTable = () => {
  const classes = useStyles();
  const { datasets } = useMultiDatasetDownloadStore();
  console.log('🐛🐛🐛 MultiDatasetDownloadTable.js:115 datasets:', datasets);
  const [api, setApi] = useState(null);

  const onGridReady = (params) => {
    setApi(params.api);
    params.api.sizeColumnsToFit();
  };

  useEffect(() => {
    if (api) {
      api.sizeColumnsToFit();
    }
  }, [datasets, api]);

  return (
    <div className={classes.container}>
      <div
        className={`ag-theme-material ${classes.agGridStyles}`}
        style={{ height: '100%', width: '100%' }}
      >
        <AgGridReact
          rowHeight={ROW_HEIGHT}
          onGridReady={onGridReady}
          rowData={datasets}
          columnDefs={columnDefinitions}
          defaultColDef={{
            resizable: true,
            sortable: true,
            suppressMenu: true,
          }}
          suppressRowClickSelection={true}
          headerHeight={40}
        />
      </div>
    </div>
  );
};

export default MultiDatasetDownloadTable;

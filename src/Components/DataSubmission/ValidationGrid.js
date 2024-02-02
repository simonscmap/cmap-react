// Wrapper for grid used for each of data, dataset_meta_data, variable_meta_data sections of data submission

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AgGridReact } from 'ag-grid-react';

import DSCellEditor from './DSCellEditor';
import DSCellEditorTextArea from './DSCellEditorTextArea';
import DSCellEditorSelect from './DSCellEditorSelect';

const useStyles = makeStyles ((theme) => ({
  gridContainer: {
    height: '600px',
  }
}));

const ValidationGrid = (props) => {
  const { gridContext, columns, rowData } = props;
  const cl = useStyles();

  return (
    <div className={cl.gridContainer}>
      <AgGridReact
        singleClickEdit={true}
        // onModelUpdated={this.props.onModelUpdated}
        columnDefs={columns}
        defaultColDef={props.defaultColumnDef}
        rowData={rowData}
        onGridReady={props.onGridReady}
        // onGridSizeChanged={this.props.onGridSizeChanged}
        suppressDragLeaveHidesColumns={true}
        suppressMovableColumns={false}
        enableCellTextSelection={true}
        suppressContextMenu={false}
        onCellValueChanged={props.handleCellValueChanged}
        context={gridContext}
        // onGridSizeChanged={this.props.handleGridSizeChanged}
        frameworkComponents={{
          DSCellEditor,
          DSCellEditorSelect,
          DSCellEditorTextArea,
        }}
      />
      </div>
  );
}

export default ValidationGrid;

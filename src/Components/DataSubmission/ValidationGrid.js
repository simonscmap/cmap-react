// Wrapper for grid used for each of data, dataset_meta_data, variable_meta_data sections of data submission

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AgGridReact } from 'ag-grid-react';
import { useSelector } from 'react-redux';

import DSCellEditor from './DSCellEditor';
import DSCellEditorTextArea from './DSCellEditorTextArea';
import DSCellEditorSelect from './DSCellEditorSelect';
import DSCellRenderWithDelete from './DSCellRenderWithDelete';
import DSCellRenderDateTime from './DSCellRenderDateTime';

const useStyles = makeStyles ((theme) => ({
  gridContainer: {
    height: '600px',
  }
}));

const ValidationGrid = (props) => {
  const { gridContext, columns, rowData, defaultColumnDef, onCellFocused } = props;
  const cl = useStyles();

  const file = useSelector ((state) => state.submissionFile);

  if (!file) {
    console.log ('not rendering grid', file)
    return '';
  }

  return (
    <div id="dataSubmission">
      <div className={cl.gridContainer + ' ag-theme-material' }>
        <AgGridReact
          singleClickEdit={true}
          // onModelUpdated={this.props.onModelUpdated}
          columnDefs={columns}
          defaultColDef={defaultColumnDef}
          rowData={rowData}
          onGridReady={props.onGridReady}
          // onGridSizeChanged={this.props.onGridSizeChanged}
          suppressDragLeaveHidesColumns={true}
          suppressMovableColumns={false}
          enableCellTextSelection={true}
          suppressContextMenu={false}
          onCellValueChanged={props.handleCellValueChanged}
          context={gridContext}
          onCellFocused={onCellFocused}
          frameworkComponents={{
            DSCellEditor,
            DSCellEditorSelect,
            DSCellEditorTextArea,
            DSCellRenderWithDelete,
            DSCellRenderDateTime,
          }}
        />
      </div>
    </div>
  );
}

export default ValidationGrid;

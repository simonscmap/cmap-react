// Wrapper for grid used for each of data, dataset_meta_data, variable_meta_data sections of data submission

import React from 'react';

import { AgGridReact } from 'ag-grid-react';

import DSCellEditor from './DSCellEditor';
import DSCellEditorTextArea from './DSCellEditorTextArea';
import DSCellEditorSelect from './DSCellEditorSelect';

class ValidationGrid extends React.Component {
  render = () => {
    const { gridContext, columns } = this.props;

    return (
      <AgGridReact
        singleClickEdit={true}
        onModelUpdated={this.props.onModelUpdated}
        columnDefs={columns}
        defaultColDef={this.props.defaultColumnDef}
        rowData={this.props.rowData}
        onGridReady={this.props.onGridReady}
        // onGridSizeChanged={this.props.onGridSizeChanged}
        suppressDragLeaveHidesColumns={true}
        suppressMovableColumns={false}
        enableCellTextSelection={true}
        suppressContextMenu={false}
        onCellValueChanged={this.props.handleCellValueChanged}
        context={gridContext}
        onGridSizeChanged={this.props.handleGridSizeChanged}
        frameworkComponents={{
          DSCellEditor,
          DSCellEditorSelect,
          DSCellEditorTextArea,
        }}
      />
    );
  };
}

export default ValidationGrid;

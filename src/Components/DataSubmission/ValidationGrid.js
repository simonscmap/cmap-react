import React from 'react';

import { AgGridReact } from 'ag-grid-react';

import DSCellEditor from './DSCellEditor';
import DSCellEditorTextArea from './DSCellEditorTextArea';
import DSCellEditorSelect from './DSCellEditorSelect';

const numberParser = ({newValue}) => isNaN(newValue) ? null : Number(newValue);

const columnDefs = {
    data: [
        {
            headerName: 'Time',
            field: 'time'
        },
    
        {
            headerName: 'Latitude',
            field: 'lat',
            valueParser: numberParser
        },
    
        {
            headerName: 'Longitude',
            field: 'lon',
            valueParser: numberParser
        },
    
        {
            headerName: 'Depth',
            field: 'depth',
            valueParser: numberParser
        }
    ],

    dataset_meta_data: [
        {
            headerName: 'Short Name',
            field: 'dataset_short_name',
            autoHeight: true,
            tooltipField: 'dataset_short_name',
        },

        {
            headerName: 'Long Name',
            field: 'dataset_long_name',
            autoHeight: true,
            tooltipField: 'dataset_long_name',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'Version',
            field: 'dataset_version',
            autoHeight: true
        },
        

        {
            headerName: 'Release Date',
            field: 'dataset_release_date',
            autoHeight: true
        },

        {
            headerName: 'Make',
            field: 'dataset_make',
            autoHeight: true,
            cellEditor: 'DSCellEditorSelect'
        },

        {
            headerName: 'Source',
            field: 'dataset_source',
            autoHeight: true
        },

        {
            headerName: 'Distributor',
            field: 'dataset_distributor',
            autoHeight: true,
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'acknowledgement',
            field: 'dataset_acknowledgement',
            autoHeight: true,
            tooltipField: 'dataset_acknowledgement',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'History',
            field: 'dataset_history',
            autoHeight: true,
            tooltipField: 'dataset_history',
            cellEditor: 'DSCellEditorTextArea'
        },      

        {
            headerName: 'Description',
            field: 'dataset_description',
            autoHeight: true,
            tooltipField: 'dataset_description',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'References',
            field: 'dataset_references',
            autoHeight: true,
            tooltipField: 'dataset_references',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'climatology',
            field: 'climatology',
            valueParser: numberParser
        },

        {
            headerName: 'Cruise Names',
            field: 'cruise_names',
            autoHeight: true,
            tooltipField: 'cruise_names',
            cellEditor: 'DSCellEditorTextArea'
        },
    ],

    vars_meta_data: [
        {
            headerName: 'Short Name',
            field: 'var_short_name',
            autoHeight: true,
            tooltipField: 'var_short_name'
        },

        {
            headerName: 'Long Name',
            field: 'var_long_name',
            autoHeight: true,
            tooltipField: 'var_long_name',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'Sensor',
            field: 'var_sensor',
            autoHeight: true,
            cellEditor: 'DSCellEditorSelect'
        },

        {
            headerName: 'Unit',
            field: 'var_unit',
            autoHeight: true
        },

        {
            headerName: 'Spatial Resolution',
            field: 'var_spatial_res',
            autoHeight: true,
            cellEditor: 'DSCellEditorSelect'
        },

        {
            headerName: 'Temporal Resolution',
            field: 'var_temporal_res',
            autoHeight: true,
            cellEditor: 'DSCellEditorSelect'
        },

        {
            headerName: 'Discipline',
            field: 'var_discipline',
            autoHeight: true,
            cellEditor: 'DSCellEditorSelect'
        },

        {
            headerName: 'Visualize',
            field: 'visualize',
            autoHeight: true,
            valueParser: numberParser
        },

        {
            headerName: 'Keywords',
            field: 'var_keywords',
            autoHeight: true,
            tooltipField: 'var_keywords',
            cellEditor: 'DSCellEditorTextArea'
        },

        {
            headerName: 'Comment',
            field: 'var_comment',
            tooltipField: 'var_comment',
            autoHeight: true,
            tooltipField: 'var_comment',
            cellEditor: 'DSCellEditorTextArea'
        },
    ]
}

class ValidationGrid extends React.Component {

    render = () => {
        const { gridContext } = this.props;
        
        return (
            <AgGridReact
                singleClickEdit={true}
                onModelUpdated={this.props.onModelUpdated}
                columnDefs={columnDefs[gridContext.sheet]}
                defaultColDef={this.props.defaultColumnDef}
                rowData={this.props.rowData}
                onGridReady={this.props.onGridReady}
                // onGridSizeChanged={this.props.onGridSizeChanged}
                suppressDragLeaveHidesColumns={true}
                suppressMovableColumns={true}
                enableCellTextSelection={true}
                suppressContextMenu={true}
                onCellValueChanged={this.props.handleCellValueChanged}
                context={gridContext}
                onGridSizeChanged={this.props.handleGridSizeChanged}
                frameworkComponents={{
                    DSCellEditor,
                    DSCellEditorSelect,
                    DSCellEditorTextArea
                }}
            />
        )
    }
}

export default ValidationGrid;
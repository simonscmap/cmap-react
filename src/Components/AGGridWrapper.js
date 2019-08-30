import React, { Component } from 'react';

import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';

import GridDetail from './GridDetail';

import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import { Paper } from '@material-ui/core';

const detailCellRendererParams = {
  template:
    '<div style="height: 100%; box-sizing: border-box" class="testClass">' +
      '  <div style="height: 10%;">Call Details</div>' +
      '  <div ref="eDetailGrid" style="height: 90%;"></div>' +
    "</div>"
}

const columnDefs = [
  {
    headerName: "Long Name", 
    field: "longName",
    sortable: true,
    filter: true,
    tooltipField: 'longName',
    cellRenderer: "agGroupCellRenderer",
    cellStyle: {
      textAlign:'left'
    }
  },
  {
    headerName: "Variable", 
    field: "variable",
    sortable: true,
    filter: true,
    hide: true
  },
  {
    headerName: "Table Name", 
    field: "tableName",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  }, 
  {
    headerName: "Dataset Name", 
    field: "datasetName",
    sortable: true,
    filter: true,
    enableRowGroup: true,
    tooltipField: 'datasetName'
  }, 
  {
    headerName: "Make", 
    field: "make",
    sortable: true,
    filter: true,
    enableRowGroup: true
  },
  {
    headerName: "Sensor", 
    field: "sensor",
    sortable: true,
    filter: true,
    enableRowGroup: true
  }, 
  {
    headerName: "Study Domain", 
    field: "studyDomain",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  }, 
  {
    headerName: "Process Level", 
    field: "processLevel",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Spatial Resolution", 
    field: "spatialResolution",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Temporal Resolution", 
    field: "temporalResolution",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Unit", 
    field: "unit",
    sortable: true,
    filter: true,
    hide: true
  },
  {
    headerName: "Key Words",
    field: 'keywords',
    hide: true
  }
]

const styles = (theme) => ({
  gridWrapper: {
    height: '60vh', 
    width: '90%',
    margin: '0 auto'
  },

  gridSearch: {
    margin: '0 auto 30px auto'
  },

  gridPaper: {
    margin: '60px 5vw',
    padding: '30px'
  }
})

const defaultColDef = {
  resizable: true,
}

const autoGroupColumnDef = {
  cellStyle: {
    textAlign:'left'
  }
}

class AGGridWrapper extends Component {
  // const { classes } = props;

  state = {
    filterText: ''
  }

  handleChange = (event) => {
    this.setState({...this.state, filterText: event.target.value})
    this.gridApi.setQuickFilter(event.target.value);
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();
  }

  handleColumnRowGroupChanged = (event) => {
    event.columns.forEach(column => {
      column.columnApi.setColumnVisible(column.colId, false);
    })
  }

  render = () => {
    const {classes} = this.props;

    return (
        <Paper elevation={12} className={classes.gridPaper}>
          <TextField
            className={classes.gridSearch}
            autoFocus={true}
            margin="normal"
            id="name"
            type="text"
            variant='outlined'
            name='filterText'
            value={this.state.filterText}
            onChange={this.handleChange}
            label="Variable Search"
            InputLabelProps={{
                shrink: true,
            }}
          />
          <div className={classes.gridWrapper + " ag-theme-material"}>
            <AgGridReact
              // General settings
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowData={this.props.catalog}
              onGridReady={this.onGridReady}
              suppressDragLeaveHidesColumns= {true}

              //Settings related to grouping functionality
              rowGroupPanelShow='always'
              groupMultiAutoColumn={true}
              onColumnRowGroupChanged={this.handleColumnRowGroupChanged}
              autoGroupColumnDef={autoGroupColumnDef}
              enableBrowserTooltips={true}

              // Settings related to master/detail
              masterDetail={true}
              frameworkComponents= {{ myDetailCellRenderer: GridDetail }}
              detailCellRenderer="myDetailCellRenderer"
              detailRowHeight={280}
              detailCellRendererParams={detailCellRendererParams}
            />
          </div>
        </Paper>
    )
  }
  
}

export default (withStyles(styles)(AGGridWrapper));
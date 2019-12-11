import React, { Component } from 'react';

import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';

import GridDetail from './GridDetail';
import DatasetDescriptionDialog from './DatasetDescriptionDialog';
import VariableDescriptionDialog from './VariableDescriptionDialog';

import stringify from 'csv-stringify/lib/sync';

import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import { Paper, Button, Grid, Tooltip } from '@material-ui/core';

import ConnectedTooltip from './ConnectedTooltip';

const columnDefs = [
  {
    headerName: "Long Name", 
    field: "Long_Name",
    sortable: true,
    filter: true,
    tooltipField: 'longName',
    cellRenderer: "agGroupCellRenderer",

  },
  {
    headerName: "Variable", 
    field: "Variable",
    sortable: true,
    filter: true,
    hide: true
  },
  {
    headerName: "Table Name", 
    field: "Table_Name",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  }, 
  {
    headerName: "Dataset Name", 
    field: "Dataset_Name",
    sortable: true,
    filter: true,
    enableRowGroup: true,
    tooltipField: 'datasetName'
  }, 
  {
    headerName: "Make", 
    field: "Make",
    sortable: true,
    filter: true,
    enableRowGroup: true,
    maxWidth: 160
  },
  {
    headerName: "Sensor", 
    field: "Sensor",
    sortable: true,
    filter: true,
    enableRowGroup: true,
    maxWidth: 160
  }, 
  {
    headerName: "Study Domain", 
    field: "Study_Domain",
    sortable: true,
    filter: true,
    // hide: true,
    maxWidth: 160,
    enableRowGroup: true
  }, 
  {
    headerName: "Process Level", 
    field: "Process_Level",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Spatial Resolution", 
    field: "Spatial_Resolution",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Temporal Resolution", 
    field: "Temporal_Resolution",
    sortable: true,
    filter: true,
    hide: true,
    enableRowGroup: true
  },
  {
    headerName: "Unit", 
    field: "Unit",
    sortable: true,
    filter: true,
    hide: true
  },
  {
    headerName: "Key Words",
    field: 'Keywords',
    hide: true
  }
]

const styles = (theme) => ({
  gridWrapper: {
    height: '70vh', 
    width: '92%',
    margin: '0 auto'
  },

  gridSearch: {
    margin: '0 auto 30px auto'
  },

  gridPaper: {
    margin: '70px 2vw 30px 2vw',
    padding: '20px'
  },

  downloadButton: {
    margin: '6px 0 0 0',
    textTransform: 'none',
    color: 'black',
    backgroundColor: '#FF8000',
    '&:hover': {
      backgroundColor: '#ab5600',
  }
  }
})

const defaultColDef = {
  resizable: true,
  cellStyle: {
    textAlign:'left'
  }
}

const autoGroupColumnDef = {
  cellStyle: {
    textAlign:'left'
  },
}

class AGGridWrapper extends Component {
  // const { classes } = props;

  state = {
    filterText: '',
    //dataset long name
    describedDataset: '',
    //variable index
    describedVariable: null
  }

  handleDescribeDataset = (dataset) => {
    this.setState({...this.state, describedDataset: dataset})
  }

  handleDescribeVariable = (variable) => {
    this.setState({...this.state, describedVariable: variable})
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

  onGridSizeChanged = (params) => {
    this.gridApi.sizeColumnsToFit();
  }

  handleColumnRowGroupChanged = (event) => {
    this.gridApi.sizeColumnsToFit()
    event.columns.forEach(column => {
      column.columnApi.setColumnVisible(column.colId, false);
    })
  }

  handleDownloadCatalog = () => {
    let csv = stringify(this.props.catalog, {
      header: true
    });

    const blob = new Blob([csv], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `CMAP_Catalog.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  render = () => {
    const { classes, datasets } = this.props;
    const { describedDataset, describedVariable } = this.state;
    const description = !datasets ? '' : !datasets[describedDataset] ? '' : datasets[describedDataset].Description;

    return (
      <Paper elevation={12} className={classes.gridPaper}>
        <DatasetDescriptionDialog 
          description={description}
          clearDescription={() => this.handleDescribeDataset('')}
          datasetName={describedDataset}
        />
        <VariableDescriptionDialog
          clearDescription={() => this.handleDescribeVariable(null)}
          describedVariable={describedVariable}
        />
        <Grid container>
          <Grid item xs={3}>

          </Grid>
          <Grid item xs={6}>
            <ConnectedTooltip placement title='Enter one or more search terms.' placement='top'>
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
                label="Search Variables"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </ConnectedTooltip>

          </Grid>
          <Grid item xs={2}>
            <Tooltip placement='top' title='Download the full catalog in CSV format'>
              <Button 
                className={classes.downloadButton}
                variant='contained'
                color='primary'
                onClick={this.handleDownloadCatalog}            
              >
                  Download
              </Button>
            </Tooltip>
          </Grid>

          <Grid item xs={1}>

          </Grid>
        </Grid>

          
          <div className={classes.gridWrapper + " ag-theme-material"}>
            <AgGridReact
              // General settings
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowData={this.props.catalog}
              onGridReady={this.onGridReady}
              onGridSizeChanged={this.onGridSizeChanged}
              suppressDragLeaveHidesColumns= {true}
              enableCellTextSelection={true}
              suppressContextMenu={true}

              // Additional props
              context={{
                datasets,
                handleDescribeDataset: this.handleDescribeDataset,
                handleDescribeVariable: this.handleDescribeVariable
              }}

              // Setting related to styling
              getRowStyle= {function(params) {
                if (params.node.detail) {
                    return { background: 'transparent' }
                }
              }}

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
            />
          </div>
        </Paper>
    )
  }
  
}

export default (withStyles(styles)(AGGridWrapper));
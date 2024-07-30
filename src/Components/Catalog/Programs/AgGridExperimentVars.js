import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import {
  selectedProgramDatasetShortNameSelector,
} from './programSelectors';
import {
  selectProgramDatasetVariable,
} from '../../../Redux/actions/catalog';


import { safePath } from '../../../Utility/objectUtils';


const ROW_HEIGHT = 35; // px

const useStyles = makeStyles ((theme) => ({
  container: {
    height: '700px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
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
    },
    '& .ag-theme-material .ag-row-selected': {
      backgroundColor: 'rgba(16, 43, 60, 1)'
    }
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  }
}));


function getFullWidthCellRenderer() {
  function FullWidthCellRenderer() {}

  FullWidthCellRenderer.prototype.init = function(params) {
    var eTemp = document.createElement("div");
    eTemp.innerHTML = this.getTemplate(params);
    this.eGui = eTemp.firstElementChild;
  };

  FullWidthCellRenderer.prototype.getTemplate = function(params) {
    var data = params.node.data;
    console.log ('fullwidthcellrenderer', data);
    var template =
      '<div class="full-width-panel">' +
        `${data}` +
      "</div>";
    return template;
  };

  FullWidthCellRenderer.prototype.getGui = function() {
    return this.eGui;
  };

  return FullWidthCellRenderer;
}


const Exp = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const program = useSelector ((state) => state.programDetails);
  const datasets = program && program.datasets && Object.values(program.datasets);
  const selectedShortName = useSelector (selectedProgramDatasetShortNameSelector);
  const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName);

  const [api, setApi] = useState(null);
  const [rowData, setRowData] = useState([]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, /* setColDefs */] = useState([
    { field: '',
      checkboxSelection: true,
      width: 25,
      cellRenderer: "agGroupCellRenderer",
    },
    { field: "VariableName", flex: 1 },
  ]);

  useEffect (() => {
    if (datasets && selectedDataset) {
      const variables = safePath (['visualizableVariables','variables']) (selectedDataset);

      setRowData (variables.map ((v) => ({
        VariableName: v.Short_Name,
        ...v,
        childRecords: [{ link: 'hi', description: 'hi' }]
      })))
    }
  }, [selectedDataset])

  const handleChange = (data) => {
    const rows = api && api.getSelectedRows();
    const variable = rows && rows.length && rows[0];

    console.log ('variable', variable);

    dispatch (selectProgramDatasetVariable ({
      varShortName: variable.Short_Name,
      varId: variable.ID,
      datasetId: selectedDataset && selectedDataset.ID,
    }));
  }

  const onGridReady = (params) => {
    setApi (params.api);
    params.api.sizeColumnsToFit();
    params.api.forEachLeafNode(function(node) {
      node.expanded = true;
    });
    params.api.forEachDetailGridInfo ((params2) => {
      console.log ('detail grid info', params2)
    });
    params.api.onGroupExpandedOrCollapsed();
  }

  const isFullWidthCell = (rowNode) => {
    return rowNode.flower;
  }

  const FullWidthCellRenderer = getFullWidthCellRenderer();

  return (
    <div className={cl.container}>
      <div
        className={`ag-theme-material ${cl.agGridStyles}`} // applying the Data Grid theme
        style={{ height: '635px', width: '100%' }} // the Data Grid will fill the size of the parent container
      >
      <AgGridReact
        defaultColDef={{
          resizable: true,
        }}
        rowHeight={ROW_HEIGHT}
        rowSelection="single"
        // checkboxSelection={true}
        getSelectedRows ={(data) => {
          console.log ('selected rows', data)
        }}
        onGridReady={onGridReady}
        rowData={rowData}
        columnDefs={colDefs}
        onSelectionChanged={handleChange}
        doesDataFlower={(item) => {
          return false;
        }}
        isFullWidthCell={isFullWidthCell}
        fullWidthCellRenderer={FullWidthCellRenderer}
      />
      </div>
    </div>
  );
}

export default Exp;

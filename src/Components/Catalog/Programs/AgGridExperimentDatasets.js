import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import {
  selectProgramDataset,
} from '../../../Redux/actions/catalog';

import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import { safePath } from '../../../Utility/objectUtils';

const ROW_HEIGHT = 35; // px

const useStyles = makeStyles ((theme) => ({
  container: {
    position: 'relative',
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
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    '& .ag-theme-material .ag-row-selected': {
      backgroundColor: 'rgba(16, 43, 60, 1)'
    },
    '& .ag-theme-material .ag-icon-checkbox-checked': {
       backgroundColor: '#9dd162'
    }
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  searchContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '55px',
    width: '55px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: '20px',
    paddingLeft: '10px',
    transition: 'all 0.5s ease',
    borderRadius: '5px',
    '& svg': {
      paddingRight: '10px'
    },
    '& .MuiOutlinedInput-input': {
      border: 'none',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 0,
    }
  },
  searchActive:{
    width: 'calc(100% - 10px)',
    borderRadius: '5px',
    background: 'rgba(0,0,0,0.3)',
    '& .MuiOutlinedInput-input': {
      background: 'rgba(0,0,0,1)',
      borderRadius: '5px',
      border: '2px solid #22A3B9', // #3f51b5 // #22A3B9
    },
    '& fieldset': {
      borderRadius: '5px',
    },
    '& .MuiFormControl-root': {
      flexGrow: 3,
    }
  },
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

const transformDataset = (d) => ({
  ...d,
  DatasetName: d.Dataset_Name,
  Source: d.Data_Source,
});

const columnDefinitions = [
  { field: '',
    checkboxSelection: true,
    width: 25,
    cellRenderer: "agGroupCellRenderer",
  },
  { field: "DatasetName", flex: 1 },
  { field: "Source", flex: 1 },
];




const Exp = () => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const program = useSelector ((state) => state.programDetails);
  const datasets = program && program.datasets &&
        Object.values (program.datasets).map (transformDataset);

  const [api, setApi] = useState (null);

  // const [rowData, setRowData] = useState([]);
  let [filteredDatasets, setFilteredDatasets] = useState([]);

  useEffect (() => {
    if (datasets) {
      setFilteredDatasets (datasets);
    }
  }, [program]);

  // handle change in dataset selection
  const handleChange = (/* data */) => {
    const rows = api && api.getSelectedRows();
    const dataset  = rows&& rows.length && rows[0];

    dispatch (selectProgramDataset ({
      shortName: dataset.Dataset_Name,
      datasetId: dataset.ID
    }));
  }

  // bootstrap grid
  const onGridReady = (params) => {
    setApi (params.api);
    params.api.sizeColumnsToFit();
    // params.api.forEachLeafNode(function(node) {
    //  node.expanded = true;
    // });
    // params.api.forEachDetailGridInfo ((params2) => {
    //  console.log ('detail grid info', params2)
    // });
    params.api.onGroupExpandedOrCollapsed();
  }

  const isFullWidthCell = (rowNode) => {
    return rowNode.flower;
  }

  const FullWidthCellRenderer = getFullWidthCellRenderer();

  // Search overlay ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const dsRef = useRef();
  let [datasetSearchTerm, setDatasetSearchTerm] = useState();
  let [datasetSearchActive, setDatasetSearchActive] = useState(false);

  const datasetSearchChange = (x) => {
    if (typeof safePath(['target','value'])(x) !== 'string') {
      return;
    }
    const newSearchTerm = x.target.value.trim().toLowerCase();
    if (newSearchTerm !== datasetSearchTerm) {
      setDatasetSearchTerm (newSearchTerm);
    }
  }

  const handleSearchOpenClose = (e) => {
    e.preventDefault();
    if (!datasetSearchActive) {
      dsRef && dsRef.current && dsRef.current.focus && dsRef.current.focus();
    }
    setDatasetSearchActive (!datasetSearchActive);
    setDatasetSearchTerm (''); // clear search when closed1
  }

  useEffect(() => {
    if (!datasetSearchTerm  || datasetSearchTerm === '') {
      setFilteredDatasets (datasets);
    } else if (datasets) {
      const filtered = datasets.filter (({Dataset_Name, Data_Source}) => {
        const subject = (`${Dataset_Name || ''}${Data_Source || ''}`).toLowerCase();
        return subject.includes(datasetSearchTerm);
      });
      setFilteredDatasets (filtered);
    }
  }, [datasetSearchTerm]);

  // Render
  return (
    <div className={cl.container}>
      <div className={`${cl.searchContainer} ${(datasetSearchActive && cl.searchActive)}`}>
        <TextField
          inputRef={dsRef}
          name="searchTerms"
          onChange={datasetSearchChange}
          placeholder="Search Dataset Name or Source"
          InputProps={{
            classes: {
              root: cl.inputRoot,
            }
          }}
          variant="outlined"
        />
        {datasetSearchActive
         ? <ClearIcon style={{ color: 'white', cursor: 'pointer' }} onClick={handleSearchOpenClose} />
         : <SearchIcon style={{ color: 'white', cursor: 'pointer' }} onClick={handleSearchOpenClose} />
        }
      </div>
      <div
        className={`ag-theme-material ${cl.agGridStyles}`} // applying the Data Grid theme
        style={{ height: '635px', width: '100%' }} // the Data Grid will fill the size of the parent container
      >
      <AgGridReact
        rowHeight={ROW_HEIGHT}
        rowSelection="single"
        // checkboxSelection={true}
        getSelectedRows ={(data) => {
          console.log ('selected rows', data)
        }}
        onGridReady={onGridReady}
        rowData={filteredDatasets}
        columnDefs={columnDefinitions}
        defaultColDef={{ resizable: true, sortable: true, suppressMenu: true }}
        onSelectionChanged={handleChange}
        doesDataFlower={(/* item */) => {
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

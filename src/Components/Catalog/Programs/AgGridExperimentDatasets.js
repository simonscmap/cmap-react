import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';

import { selectProgramDataset } from '../../../Redux/actions/catalog';

import { selectedProgramDatasetShortNameSelector } from './programSelectors';

import { safePath } from '../../../Utility/objectUtils';

const ROW_HEIGHT = 35; // px

const useStyles = makeStyles((theme) => ({
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
    '& .ag-theme-material .ag-header-cell': {
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    '& .ag-theme-material .ag-row-selected': {
      backgroundColor: 'rgba(16, 43, 60, 1)',
    },
    '& .ag-theme-material .ag-icon-checkbox-checked': {
      backgroundColor: '#9dd162',
    },
    '& .radio-select': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      color: '#9dd162',
      height: `${ROW_HEIGHT}px`,
      width: `${ROW_HEIGHT}px`,
      fontSize: '.9em',
      cursor: 'pointer',
      '& .MuiSvgIcon-root': {
        transform: 'none',
        position: 'absolute',
        width: '.85em',
        height: '.85em',
      },
    },
    '& .radio-select.selected': {
      color: '#22A3B9',
    },
    '& .link-container': {
      gap: '10px',
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      '& > span': {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },
    '& .dataset-link': {
      color: '#9dd162',
      '& .MuiSvgIcon-root': {
        fontSize: '1em',
      },
    },
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
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
      paddingRight: '10px',
    },
    '& .MuiOutlinedInput-input': {
      border: 'none',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 0,
    },
  },
  searchActive: {
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
    },
  },
}));

// Helpers

const stringOrEmpty = (x) => (typeof x === 'string' ? x : '');
const alphabetizeBy = (prop) => (list) => {
  return list.sort((a_ = '', b_ = '') => {
    let a = stringOrEmpty(a_[prop]).toLowerCase();
    let b = stringOrEmpty(b_[prop]).toLowerCase();
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    if (a === b) {
      return 0;
    }
  });
};

const transformDataset = (d) => ({
  ...d,
  DatasetName: d.Dataset_Name,
  Source: d.Data_Source,
});

const columnDefinitions = [
  {
    field: '',
    // checkboxSelection: true,
    width: 30,
    cellRenderer: (params) => {
      const {
        // api,
        node,
        // value
      } = params;
      const selected = node.isSelected();

      if (selected) {
        return `<div class="radio-select selected">

<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg>
<svg class="MuiSvgIcon-root PrivateRadioButtonIcon-layer-199" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.465 8.465C9.37 7.56 10.62 7 12 7C14.76 7 17 9.24 17 12C17 13.38 16.44 14.63 15.535 15.535C14.63 16.44 13.38 17 12 17C9.24 17 7 14.76 7 12C7 10.62 7.56 9.37 8.465 8.465Z"></path></svg>

</div>`;
      } else {
        return `<div class="radio-select">
 <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg>

</div >`;
      }
    },
    onCellClicked: (event) => {
      console.log(event);
      event.node.setSelected(true);
      setTimeout(() => event.api.redrawRows(), 0); // allows for style change
    },
  },
  {
    field: 'DatasetName',
    flex: 1,
    cellRenderer: (params) => {
      const {
        // api,
        node,
        value,
      } = params;
      return `<div class="link-container">
              <span >${value}</span>
              <a href="/catalog/datasets/${node.data.Dataset_Name}" target="_blank" class="dataset-link">
                <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
                </svg>
              </a>
            </div>`;
    },
  },
  {
    field: 'Source',
    flex: 1,
  },
];

const Exp = () => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const program = useSelector((state) => state.programDetails);
  const datasets =
    program &&
    program.datasets &&
    alphabetizeBy('Dataset_Name')(
      Object.values(program.datasets).map(transformDataset),
    );
  const selectedShortName = useSelector(
    selectedProgramDatasetShortNameSelector,
  );
  // const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName);

  const [api, setApi] = useState(null);

  // const [rowData, setRowData] = useState([]);
  let [filteredDatasets, setFilteredDatasets] = useState([]);

  useEffect(() => {
    if (datasets) {
      setFilteredDatasets(datasets);
    }
  }, [datasets, program]);

  useEffect(() => {
    if (api) {
      api.forEachNode((params) => {
        if (params.data.Dataset_Name === selectedShortName) {
          console.log('set selected', params.setSelected);
          params && params.setSelected && params.setSelected(true);
          setTimeout(() => api.redrawRows(), 0);
        }
      });
    }
  }, [selectedShortName, api]);

  // handle change in dataset selection
  const handleChange = (/* data */) => {
    const rows = api && api.getSelectedRows();
    const dataset = rows && rows.length && rows[0];

    dispatch(
      selectProgramDataset({
        shortName: dataset.Dataset_Name,
        datasetId: dataset.ID,
      }),
    );
  };

  // bootstrap grid
  const onGridReady = (params) => {
    setApi(params.api);
    params.api.sizeColumnsToFit();
  };

  // Search overlay ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const dsRef = useRef();
  let [datasetSearchTerm, setDatasetSearchTerm] = useState();
  let [datasetSearchActive, setDatasetSearchActive] = useState(false);

  const datasetSearchChange = (x) => {
    if (typeof safePath(['target', 'value'])(x) !== 'string') {
      return;
    }
    const newSearchTerm = x.target.value.trim().toLowerCase();
    if (newSearchTerm !== datasetSearchTerm) {
      setDatasetSearchTerm(newSearchTerm);
    }
  };

  const handleSearchOpenClose = (e) => {
    e.preventDefault();
    if (!datasetSearchActive) {
      dsRef && dsRef.current && dsRef.current.focus && dsRef.current.focus();
    }
    setDatasetSearchActive(!datasetSearchActive);
    setDatasetSearchTerm(''); // clear search when closed1
  };

  useEffect(() => {
    if (!datasetSearchTerm || datasetSearchTerm === '') {
      setFilteredDatasets(datasets);
    } else if (datasets) {
      const filtered = datasets.filter(({ Dataset_Name, Data_Source }) => {
        const subject =
          `${Dataset_Name || ''}${Data_Source || ''}`.toLowerCase();
        return subject.includes(datasetSearchTerm);
      });
      setFilteredDatasets(filtered);
    }
  }, [datasetSearchTerm, datasets]);

  // Render
  return (
    <div className={cl.container}>
      <div
        className={`${cl.searchContainer} ${datasetSearchActive && cl.searchActive}`}
      >
        <TextField
          inputRef={dsRef}
          name="searchTerms"
          onChange={datasetSearchChange}
          placeholder="Search Dataset Name or Source"
          InputProps={{
            classes: {
              root: cl.inputRoot,
            },
          }}
          variant="outlined"
        />
        {datasetSearchActive ? (
          <ClearIcon
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={handleSearchOpenClose}
          />
        ) : (
          <SearchIcon
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={handleSearchOpenClose}
          />
        )}
      </div>
      <div
        className={`ag-theme-material ${cl.agGridStyles}`} // applying the Data Grid theme
        style={{ height: '635px', width: '100%' }} // the Data Grid will fill the size of the parent container
      >
        <AgGridReact
          rowHeight={ROW_HEIGHT}
          rowSelection="single"
          onGridReady={onGridReady}
          rowData={filteredDatasets}
          columnDefs={columnDefinitions}
          defaultColDef={{
            resizable: true,
            sortable: true,
            suppressMenu: true,
          }}
          onSelectionChanged={handleChange}
          suppressRowClickSelection={true}
        />
      </div>
    </div>
  );
};

export default Exp;

import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Paper from '@material-ui/core/Paper';
import Grow from '@material-ui/core/Grow';

import {
  selectedProgramDatasetShortNameSelector,
  selectedProgramDatasetVariableShortNameSelector,
} from './programSelectors';
import {
  selectProgramDatasetVariable,
} from '../../../Redux/actions/catalog';


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
    },
    '& .ag-theme-material .ag-row-selected': {
      backgroundColor: 'rgba(16, 43, 60, 1)'
    }
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  messageContainer: {
    position: 'absolute',
    right: '7px',
    top: 0,
    height: '55px',
  },
  messageContainerActive: {
    width: 'calc(100% - 15px)',
    zIndex: 10,
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
  selectVarInstruction: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
    background: 'rgba(30, 67, 113, 1)',
  },
  noVarsIndicator: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
    background: 'rgba(30, 67, 113, 1)',
  }
}));

const columnDefinitions = [
  { field: '',
    checkboxSelection: true,
    width: 25,
    cellRenderer: "agGroupCellRenderer",
  },
  { field: "VariableName", flex: 1 },
];

const Exp = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const program = useSelector ((state) => state.programDetails);
  const datasets = program && program.datasets && Object.values(program.datasets);
  const selectedShortName = useSelector (selectedProgramDatasetShortNameSelector);
  const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName);
  const selectedVariableShortName = useSelector (selectedProgramDatasetVariableShortNameSelector);


  const [api, setApi] = useState(null);

  let [filteredVariables, setFilteredVariables] = useState(null);

  useEffect (() => {
    if (datasets && selectedDataset) {
      const variables = safePath (['visualizableVariables','variables']) (selectedDataset);

      setFilteredVariables (variables.map ((v) => ({
        ...v,
        VariableName: v.Short_Name,
      })))
    }
  }, [selectedDataset])

  const handleChange = (data) => {
    const rows = api && api.getSelectedRows();
    const variable = rows && rows.length && rows[0];

    dispatch (selectProgramDatasetVariable ({
      varShortName: variable.Short_Name,
      varId: variable.ID,
      datasetId: selectedDataset && selectedDataset.ID,
    }));
  }

  const onGridReady = (params) => {
    setApi (params.api);
    params.api.sizeColumnsToFit();
  }

  const vsRef = useRef();
  let [searchTerm, setSearchTerm] = useState ('');
  let [variableSearchActive, setVariableSearchActive] = useState(false);

  useEffect(() => {
    const variables = safePath (['visualizableVariables','variables']) (selectedDataset);
      if (variables) {
      const filtered = variables.filter (({Short_Name, Unit}) => {
        const subject = (`${Short_Name || ''}${Unit || ''}`).toLowerCase();
        return subject.includes(searchTerm);
      });
        setFilteredVariables (filtered.map (((v) => ({
          ...v,
          VariableName: v.Short_Name,
        }))));
    }
  }, [searchTerm, selectedDataset]);

  const variableSearchChange = (x) => {
    if (typeof safePath(['target','value'])(x) !== 'string') {
      return;
    }
    const newSearchTerm = x.target.value.trim().toLowerCase();
    if (newSearchTerm !== searchTerm) {
      setSearchTerm (newSearchTerm);
    }
  }

  const handleVarSearchOpenClose = (e) => {
    e.preventDefault();
    if (!variableSearchActive) {
      vsRef && vsRef.current && vsRef.current.focus && vsRef.current.focus();
    }
    setVariableSearchActive (!variableSearchActive);
    setSearchTerm (''); // clear search when it is closed
  }

  const shouldShowSelectInstruction = !variableSearchActive
        && !selectedVariableShortName
        && (filteredVariables
            && filteredVariables.length != 0
           );

  const shouldShowNoVariablesInfo = !searchTerm
        && filteredVariables
        && filteredVariables.length === 0;

  const messageOpen = shouldShowSelectInstruction || shouldShowNoVariablesInfo;

  return (
    <div className={cl.container}>
      <div className={`${cl.searchContainer} ${(variableSearchActive && cl.searchActive)}`}>
        <TextField
          inputRef={vsRef}
          name="searchTerms"
          onChange={variableSearchChange}
          placeholder="Search Variable Name"
          InputProps={{
            classes: {
              root: cl.inputRoot,
            }
          }}
          variant="outlined"
        />
        {variableSearchActive
         ? <ClearIcon style={{ color: 'white', cursor: 'pointer' }} onClick={handleVarSearchOpenClose} />
         : <SearchIcon style={{ color: 'white', cursor: 'pointer' }} onClick={handleVarSearchOpenClose} />
        }
      </div>

      <div className={`${cl.messageContainer} ${messageOpen && cl.messageContainerActive}`}>
        {shouldShowSelectInstruction  &&
         <Grow in={!selectedVariableShortName}>
           <Paper className={cl.selectVarInstruction}>
             {'Select a variable'}
           </Paper>
         </Grow>}

        {shouldShowNoVariablesInfo &&
         <Grow in={shouldShowNoVariablesInfo}>
           <Paper className={cl.noVarsIndicator}>
             {'This dataset has no visualizable variables.'}
           </Paper>
         </Grow>}

      </div>
      <div
        className={`ag-theme-material ${cl.agGridStyles}`} // applying the Data Grid theme
        style={{ height: '635px', width: '100%' }} // the Data Grid will fill the size of the parent container
      >
      <AgGridReact
        rowHeight={ROW_HEIGHT}
        rowSelection="single"
        onGridReady={onGridReady}
        rowData={filteredVariables}
        columnDefs={columnDefinitions}
        defaultColDef={{ resizable: true, sortable: true, suppressMenu: true }}
        onSelectionChanged={handleChange}
      />
      </div>
    </div>
  );
}

export default Exp;

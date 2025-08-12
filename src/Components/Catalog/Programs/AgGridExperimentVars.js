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
import { selectProgramDatasetVariable } from '../../../Redux/actions/catalog';

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
    '& .radio-select': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      color: '#9dd162',
      fontSize: '.9em',
      height: `${ROW_HEIGHT}px`,
      width: `${ROW_HEIGHT}px`,
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
  },
  agGridStyles: {
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
  },
  messageContainer: {
    position: 'absolute',
    right: '7px',
    bottom: '100%',
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
  selectVarInstruction: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
    background: 'rgba(0,0,0,0.2)',
  },
  noVarsIndicator: {
    margin: '.5em 0',
    padding: '.5em',
    border: '2px solid #d16265',
    background: 'rgba(0,0,0,0.2)',
  },
  mark: {
    position: 'absolute',
    display: 'block',
    left: '30px',
    bottom: '3px',
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '5px solid #d16265',
  },
}));

const columnDefinitions = [
  {
    field: '',
    width: ROW_HEIGHT,
    cellRenderer: (params) => {
      const { api, node, value } = params;
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
  { field: 'VariableName', flex: 1 },
];

const Exp = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const program = useSelector((state) => state.programDetails);
  const datasets =
    program && program.datasets && Object.values(program.datasets);
  const selectedShortName = useSelector(
    selectedProgramDatasetShortNameSelector,
  );
  const selectedDataset =
    datasets && datasets.find((d) => d.Dataset_Name === selectedShortName);
  const selectedVariableShortName = useSelector(
    selectedProgramDatasetVariableShortNameSelector,
  );

  const [api, setApi] = useState(null);

  let [filteredVariables, setFilteredVariables] = useState(null);

  useEffect(() => {
    if (datasets && selectedDataset) {
      const variables = safePath(['visualizableVariables', 'variables'])(
        selectedDataset,
      );

      setFilteredVariables(
        variables.map((v) => ({
          ...v,
          VariableName: v.Short_Name,
        })),
      );
    }
  }, [datasets, selectedDataset]);

  useEffect(() => {
    if (api) {
      api.forEachNode((params) => {
        if (params.data.Short_Name === selectedVariableShortName) {
          console.log('set selected', params.setSelected);
          params && params.setSelected && params.setSelected(true);
          setTimeout(() => api.redrawRows(), 0);
        }
      });
    }
  }, [selectedVariableShortName, api]);

  const handleChange = (data) => {
    const rows = api && api.getSelectedRows();
    const variable = rows && rows.length && rows[0];

    dispatch(
      selectProgramDatasetVariable({
        varShortName: variable.Short_Name,
        varId: variable.ID,
        datasetId: selectedDataset && selectedDataset.ID,
      }),
    );
  };

  const onGridReady = (params) => {
    setApi(params.api);
    // params.api.sizeColumnsToFit();
  };

  const vsRef = useRef();
  let [searchTerm, setSearchTerm] = useState('');
  let [variableSearchActive, setVariableSearchActive] = useState(false);

  useEffect(() => {
    const variables = safePath(['visualizableVariables', 'variables'])(
      selectedDataset,
    );
    if (variables) {
      const filtered = variables.filter(({ Short_Name, Unit }) => {
        const subject = `${Short_Name || ''}${Unit || ''}`.toLowerCase();
        return subject.includes(searchTerm);
      });
      setFilteredVariables(
        filtered.map((v) => ({
          ...v,
          VariableName: v.Short_Name,
        })),
      );
    }
  }, [searchTerm, selectedDataset]);

  const variableSearchChange = (x) => {
    if (typeof safePath(['target', 'value'])(x) !== 'string') {
      return;
    }
    const newSearchTerm = x.target.value.trim().toLowerCase();
    if (newSearchTerm !== searchTerm) {
      setSearchTerm(newSearchTerm);
    }
  };

  const handleVarSearchOpenClose = (e) => {
    e.preventDefault();
    if (!variableSearchActive) {
      vsRef && vsRef.current && vsRef.current.focus && vsRef.current.focus();
    }
    setVariableSearchActive(!variableSearchActive);
    setSearchTerm(''); // clear search when it is closed
  };

  const shouldShowSelectInstruction =
    !variableSearchActive &&
    !selectedVariableShortName &&
    filteredVariables &&
    filteredVariables.length != 0;

  const shouldShowNoVariablesInfo =
    !searchTerm && filteredVariables && filteredVariables.length === 0;

  const messageOpen = shouldShowSelectInstruction || shouldShowNoVariablesInfo;

  return (
    <div className={cl.container}>
      <div
        className={`${cl.searchContainer} ${
          variableSearchActive && cl.searchActive
        }`}
      >
        <TextField
          inputRef={vsRef}
          name="searchTerms"
          onChange={variableSearchChange}
          placeholder="Search Variable Name"
          InputProps={{
            classes: {
              root: cl.inputRoot,
            },
          }}
          variant="outlined"
        />
        {variableSearchActive ? (
          <ClearIcon
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={handleVarSearchOpenClose}
          />
        ) : (
          <SearchIcon
            style={{ color: 'white', cursor: 'pointer' }}
            onClick={handleVarSearchOpenClose}
          />
        )}
      </div>

      <div
        className={`${cl.messageContainer} ${
          messageOpen && cl.messageContainerActive
        }`}
      >
        {shouldShowSelectInstruction && (
          <Grow in={!selectedVariableShortName}>
            <Paper className={cl.selectVarInstruction}>
              {'Select a variable'}
            </Paper>
          </Grow>
        )}

        {shouldShowNoVariablesInfo && (
          <Grow in={shouldShowNoVariablesInfo}>
            <Paper className={cl.noVarsIndicator}>
              {'This dataset has no visualizable variables.'}
            </Paper>
          </Grow>
        )}
        {messageOpen && <div className={cl.mark}></div>}
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
          defaultColDef={{
            resizable: true,
            sortable: true,
            suppressMenu: true,
          }}
          onSelectionChanged={handleChange}
        />
      </div>
    </div>
  );
};

export default Exp;

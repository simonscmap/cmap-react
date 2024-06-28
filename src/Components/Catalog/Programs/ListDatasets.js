import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import Proto from './Proto';
import {
  activeTrajectorySelector,
  selectedProgramDatasetShortNameSelector,
  selectedVariableDataSelector,
  selectedProgramDatasetVariableShortNameSelector,
} from './programSelectors';
import {
  selectProgramDataset,
  selectProgramDatasetVariable,
} from '../../../Redux/actions/catalog';

import { safePath } from '../../../Utility/objectUtils';

/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
const useVariableRowStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTableCell-root': {
      padding: '5px',
    },
    '& .MuiRadio-root': {
      padding: '5px',
    },
    '& > *': {
      borderBottom: 'unset',
      '& a': {
        color: theme.palette.primary.main,
        '&:visited': {
          color: theme.palette.primary.main
        }
      },
    },
  },}));

const VariableRow = (props) => {
  const { variable, selectedVariable, datasetId } = props;
  const {
    Short_Name: varShortName,
    Unit,
    ID: varId,
  } = variable;

  const cl = useVariableRowStyles();
  const dispatch = useDispatch();
  const handleSelect = () => {
    dispatch (selectProgramDatasetVariable ({ varShortName, varId, datasetId }));
  };

  const selected = varShortName === selectedVariable;

  return (
      <TableRow className={cl.root} selected={selected} >
        <TableCell padding="checkbox">
            <Radio
              checked={selected}
              onChange={handleSelect}
              name="radio-button"
            />
        </TableCell>
        <TableCell className={cl.shortNameCell}>
            <Typography noWrap={true}>{varShortName} {`(${Unit})`}</Typography>
        </TableCell>
      </TableRow>
  );
}

/*~~~~~~~~~~~~  Dataset Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTableCell-root': {
      padding: '5px',
    },
    '& .MuiRadio-root': {
      padding: '5px',
    },
    '& > *': {
      borderBottom: 'unset',
      '& a': {
        color: theme.palette.primary.main,
        '&:visited': {
          color: theme.palette.primary.main
        }
      },
    },
  },
  highlight: {
    background: 'rgba(0,0,0,0.1)',
  },
  shortNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    '& svg': {
      fontSize: '0.9em',
    },
  },
}));

const DatasetRow = (props) => {
  const { dataset, at, selected } = props;
  const {
    Dataset_Name: shortName,
    Data_Source,
    ID: datasetId,
  } = dataset;

  const cl = useRowStyles();
  const dispatch = useDispatch();
  const handleSelect = () => {
    dispatch (selectProgramDataset ({ shortName, datasetId }));
  };

  const highlight = dataset.cruises.includes(at);
  const isSelected = shortName === selected;

  const rowClasses = [ cl.root ];
  if (highlight) {
    rowClasses.push (cl.highlight);
  }
  if (isSelected) {
    rowClasses.push (cl.selected);
  }

  return (
    <React.Fragment>
      <TableRow className={rowClasses.join(' ')} selected={isSelected} stickyHeader={isSelected}>
        <TableCell padding="checkbox" className={cl.checkBox}>
          <Radio
            checked={shortName === selected}
            onChange={handleSelect}
            name="radio-button"
          />
        </TableCell>
        <TableCell className={cl.shortNameCell}>
          <div className={cl.shortNameContainer}>
            <Typography noWrap={true}>{shortName}</Typography>
            <RouterLink to={{pathname: `/catalog/datasets/${shortName}`}}>
              <OpenInNewIcon />
            </RouterLink>
          </div>
        </TableCell>
        <TableCell className={cl.dataSourceCell}>
          <Typography noWrap={true}>{Data_Source}</Typography>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles ((theme) => ({
  container: {
    height: '700px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em',
  },
  datasetListContainer: {
    position: 'relative',
    width: '60%',
    height: '100%',
  },
  tableContainer: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 122px)',
    width: '100%',
    marginTop: '-1px',
    position: 'relative',
  },

  datatsetHeaders: { // table container
    width: '100%',
  },
  variableHeaders: {
    width: '100%',
  },

  datasetVariablesListContainer: {
    position: 'relative',
    width: '40%',
    height: '100%',
  },
  root: { // table header
    tableLayout: 'fixed',
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
    '& .MuiTableCell-root': {
      borderBottom: 'unset',
    }
  },
  datasetTable: {  },
  hasSelected: {
    marginTop: '40px',
  },
  variablesTable: { },

  // cell styles
  checkBoxHeader: {
    width: '12px',
  },
  headerWhenSelection: {
    '& th': {
      padding: '5px',
      top: 0,
      position: 'sticky',
      zIndex: 2, // keeps it above the radio buttons, which are absolutely position by mui
      backgroundColor: 'rgba(6, 31, 62, 1)', // background:'rgb(22, 58, 82)',//  'rgba(34, 163, 185, 0.8)',
    },
    '& th:nth-child(2)': {
      padding: '5px',
    },
    '& th:nth-child(3)': {
      padding: '5px',
    },
    '& .MuiRadio-root': {
      padding: '5px',
    }
  },
  dummyCheckBoxHeader: {
    width: '36px'
  },
  nameHeader: {
    width: 'calc(50% - 20px)',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    overflow: 'hidden',
  },
  nameAndLinkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '5px',
    '& p': {
      textOverflow: 'ellipsis',
      textWrap: 'nowrap',
      overflow: 'hidden',
      padding: 0,
      margin: 0,
    },
    '& a': {
      color: theme.palette.primary.main,
      '&:visited': {
          color: theme.palette.primary.main
      }
    },
    '& svg': {
      fontSize: '0.9em',
    },
  },
  sourceHeader: {
    width: 'calc(50% - 20px)',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
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
  inputRoot: {
  }
}));

// TODO
const sortDatasetsByAssociationWithActiveTrajectory = (datasets, activeTrajectory) => {
  let datasetsArray = Object.values(datasets);
  let activeCruiseId = activeTrajectory && activeTrajectory.cruiseId;

  if (activeCruiseId && datasetsArray) {
    const pred = (dataset_) => {
      return dataset_ && dataset_.cruises.includes (activeCruiseId);
    };

    let associatedDatasets = datasetsArray.filter (pred);
    let others = datasetsArray.filter ((arg) => !pred(arg));
    datasetsArray = [...associatedDatasets, ...others];
  }

  return datasetsArray;
}

const DatasetControls = (props) => {
  const { datasets, at } = props;

  const cl = useStyles();
  const selectedShortName = useSelector (selectedProgramDatasetShortNameSelector);
  const selectedVariableShortName = useSelector (selectedProgramDatasetVariableShortNameSelector);

  // const selectedVariableData = useSelector (selectedVariableDataSelector);

  const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName);


  // Dataset Search
  const dsRef = useRef();
  let [filteredDatasets, setFilteredDatasets] = useState(datasets);
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

  const handleSearchOpenClose = (e) => {
    e.preventDefault();
    if (!datasetSearchActive) {
      dsRef && dsRef.current && dsRef.current.focus && dsRef.current.focus();
    }
    setDatasetSearchActive (!datasetSearchActive);
  }

  // Variable Search

  const vsRef = useRef();
  let [filteredVariables, setFilteredVariables] = useState(null);
  let [searchTerm, setSearchTerm] = useState ('');
  let [variableSearchActive, setVariableSearchActive] = useState(false);

  useEffect(() => {
    const variables = safePath (['visualizableVariables','variables']) (selectedDataset);
    if (variables) {
      const filtered = variables.filter (({Short_Name, Unit}) => {
        const subject = (`${Short_Name || ''}${Unit || ''}`).toLowerCase();
        return subject.includes(searchTerm);
      });
      setFilteredVariables (filtered);
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
  }

  // render

  return (
      <div className={cl.container}>
        <div className={cl.datasetListContainer}>
          {/* Dataset Column Headers */}
          <TableContainer component={Paper} className={cl.datasetHeaders} >
            <Table aria-label="collapsible table" stickyHeader className={`${cl.root} ${cl.datasetTable}`}>
              <TableHead>
                <TableRow>
                  <TableCell className={cl.checkBoxHeader}/>
                  <TableCell className={cl.nameHeader}>Dataset Name</TableCell>
                  <TableCell className={cl.sourceHeader}>Source</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
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
          {/* Dataset List with Sticky Selected Row */}
          <TableContainer component={Paper} className={cl.tableContainer} >
            <Table aria-label="collapsible table" stickyHeader className={`${cl.root} ${cl.datasetTable}`}>
              <TableBody>
                {filteredDatasets && filteredDatasets
                  .map((k, i) => (
                  <DatasetRow
                    key={`program_dataset_row${i}`}
                    dataset={k}
                    at={at}
                    selected={selectedShortName} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className={cl.datasetVariablesListContainer}>
          {/* Variables Column Headers */}
          <TableContainer component={Paper} className={cl.variableHeaders}>
            <Table aria-label="collapsible table" stickyHeader className={`${cl.root} ${cl.variablesTable}`}>
              <TableHead>
                <TableRow>
                  <TableCell className={cl.checkBoxHeader}/>
                  <TableCell className={cl.nameHeader}>Variable Name</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
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
          {/* Variable List with Stick Selected Row */}
          <TableContainer component={Paper} className={cl.tableContainer}>
            <Table aria-label="collapsible table" className={`${cl.root} ${cl.variablesTable}`}>
              <TableBody>
                {filteredVariables && filteredVariables.map((k, i) => (
                  <VariableRow
                    key={`program_dataset_var_row${i}`}
                    variable={k}
                    selectedVariable={selectedVariableShortName}
                    datasetId={selectedDataset && selectedDataset.ID}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
};

// List Datasets in Program
const DatasetList = () => {
  // selectors
  const selectProgramDetailsRequestStatus = (state) => state.programDetailsRequestStatus;

  // data
  const program = useSelector ((state) => state.programDetails);
  const AT = useSelector (activeTrajectorySelector)

  const deps = [
    selectProgramDetailsRequestStatus,
  ];

  let datasets = program && Object.values(program.datasets);

  if (AT && AT.cruiseId && datasets) {
    const pred = (dataset_) => {
      return dataset_ && dataset_.cruises.includes (AT.cruiseId);
    };

    let associatedDatasets = datasets.filter (pred);
    let others = datasets.filter ((arg) => !pred(arg));
    datasets = [...associatedDatasets, ...others];
  }

  // const description = <Typography>{'Datasets produced by this program'}</Typography>

  return (
    <Proto title={'Program Datasets'} deps={deps}>
        <DatasetControls datasets={datasets} at={AT && AT.cruiseId}/>
    </Proto>
  );
};

export default DatasetList;

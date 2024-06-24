import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import Grow from '@material-ui/core/Grow';
import Fade from '@material-ui/core/Fade';

import Proto from './Proto';
import {
  activeTrajectorySelector,
  selectedProgramDatasetShortNameSelector,
  selectedProgramDatasetDataSelector,
  selectedVariableDataSelector,
  selectedProgramDatasetVariableShortNameSelector,
} from './programSelectors';
import {
  selectProgramDataset,
  selectProgramDatasetVariable,
} from '../../../Redux/actions/catalog';

/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
const useVariableRowStyles = makeStyles((theme) => ({
  root: {
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
    <Grow in={!selected} enter={false} exit={true} unmountOnExit={true} timeout={500}>
      <TableRow className={cl.root} selected={selected} >
        <TableCell padding="checkbox">
            <Radio
              checked={selected}
              onChange={handleSelect}
              name="radio-button"
            />
        </TableCell>
        <TableCell className={cl.shortNameCell}>
            <Typography noWrap={true}>{varShortName}</Typography>
        </TableCell>
        <TableCell className={cl.unitCell}>
            <Typography noWrap={true}>{Unit}</Typography>
        </TableCell>
      </TableRow>
    </Grow>
  );
}



/*~~~~~~~~~~~~  Dataset Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles((theme) => ({
  root: {
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
  selected: {
    // border: '2px solid rgba(157, 209, 98,0.5)',
    '& td:nth-child(1)': {
      // borderLeft: '3px solid rgba(157, 209, 98,0.5)',
      //borderTop: '2px solid rgba(157, 209, 98,0.5)',
      // borderBottom: '2px solid rgba(157, 209, 98,0.5)'
    },
    '& td:nth-child(2)': {
      //borderTop: '2px solid rgba(157, 209, 98,0.5)',
      //borderBottom: '2px solid rgba(157, 209, 98,0.5)'
    },
    '& td:nth-child(3)': {
      //borderRight: '3px solid rgba(157, 209, 98,0.5)',
      //borderTop: '2px solid rgba(157, 209, 98,0.5)',
      //borderBottom: '2px solid rgba(157, 209, 98,0.5)'
    },
  },
  checkBox: {

  },
  shortNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexNrap: 'nowrap',
    alignItems: 'center',
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
    <Grow in={!isSelected} enter={false} exit={true} unmountOnExit={true} timeout={500}>
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
    </Grow>
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
      top: 0,
      position: 'sticky',
      zIndex: 2, // keeps it above the radio buttons, which are absolutely position by mui
      backgroundColor: 'rgba(6, 31, 62, 1)', // background:'rgb(22, 58, 82)',//  'rgba(34, 163, 185, 0.8)',
    },
    '& th:nth-child(2)': {
      padding: '16px',
    },
    '& th:nth-child(3)': {
      padding: '16px',
    },
  },
  dummyCheckBoxHeader: {
    width: '56px'
  },
  nameHeader: {
    width: 'calc(50% - 20px)',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    overflow: 'hidden',
    '& a': {
      float: 'right',
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


}));

const DatasetControls = (props) => {
  const { datasets, at } = props;

  const cl = useStyles();
  const selectedShortName = useSelector (selectedProgramDatasetShortNameSelector);
  const selectedVariableShortName = useSelector (selectedProgramDatasetVariableShortNameSelector);
  // const selectedDatasetData = useSelector (selectedProgramDatasetDataSelector);

  const selectedVariableData = useSelector (selectedVariableDataSelector);

  const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName);

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
          {/* Dataset List with Sticky Selected Row */}
          <TableContainer component={Paper} className={cl.tableContainer} >
            <Table aria-label="collapsible table" stickyHeader className={`${cl.root} ${cl.datasetTable}`}>
              <Grow in={Boolean(selectedDataset)} enter={true} exit={false} unmountOnExit={true} timeout={500}>
                <thead className={cl.headerWhenSelection}>
                  <tr>
                    <th className={cl.dummyCheckBoxHeader}>
                      <Radio checked={true} />
                    </th>
                    <th className={cl.nameHeader}>
                      <span>{selectedDataset && selectedDataset.Dataset_Name}</span>
                      <RouterLink to={{pathname: `/catalog/datasets/${selectedDataset.Dataset_Name}`}}>
                        <OpenInNewIcon />
                      </RouterLink>
                    </th>
                    <th className={cl.sourceHeader}>{selectedDataset && selectedDataset.Data_Source}</th>
                  </tr>
                </thead>
              </Grow>
              <TableBody>
                {datasets
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
                  <TableCell className={cl.sourceHeader}>Units</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
          {/* Variable List with Stick Selected Row */}
          <TableContainer component={Paper} className={cl.tableContainer}>
            <Table aria-label="collapsible table" stickyHeader className={`${cl.root} ${cl.variablesTable}`}>
              <Grow in={Boolean(selectedVariableShortName)} enter={true} exit={false} unmountOnExit={true} timeout={500}>
                 <thead className={cl.headerWhenSelection}>
                   <tr>
                     <th className={cl.dummyCheckBoxHeader}>
                       <Radio checked={true} />
                     </th>
                     <th className={cl.nameHeader}>{selectedVariableShortName && selectedVariableShortName}</th>
                     <th className={cl.sourceHeader}>{selectedVariableData && selectedVariableData.Unit}</th>
                   </tr>
                 </thead>
               </Grow>

              <TableBody>
                {selectedDataset && selectedDataset.visualizableVariables.variables
                                       .map((k, i) => (
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

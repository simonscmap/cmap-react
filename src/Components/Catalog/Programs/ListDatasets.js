import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import Proto from './Proto';
import {
  activeTrajectorySelector,
  selectedProgramDatasetShortNameSelector,
  selectedProgramDatasetDataSelector,
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
  } = variable;

  const cl = useVariableRowStyles();
  const dispatch = useDispatch();
  const handleSelect = () => {
    dispatch (selectProgramDatasetVariable ({ varShortName, datasetId }));
  };

  return (
    <React.Fragment>
      <TableRow className={cl.root} >
        <TableCell padding="checkbox">
          <Radio
            checked={varShortName === selectedVariable}
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
    </React.Fragment>
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
  shortNameCell: {
    width: 'calc((100% - 20px) / 2)',
  },
  dataSourceCell: {
    width: 'calc((100% - 20px) / 2)',
  }
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

  return (
    <React.Fragment>
      <TableRow className={(highlight ? `${cl.root} ${cl.highlight}` : cl.root)} >
        <TableCell padding="checkbox">
          <Radio
            checked={shortName === selected}
            onChange={handleSelect}
            // value={Short_Name}
            name="radio-button"
          />
        </TableCell>

        <TableCell className={cl.shortNameCell}>
          <RouterLink
            to={{pathname: `/catalog/datasets/${shortName}`}}
          >
            <Typography noWrap={true}>{shortName}</Typography>
          </RouterLink>
        </TableCell>
        <TableCell className={cl.dataSourceCell}>
          <Typography noWrap={true}>{Data_Source}</Typography>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles (() => ({
  container: {
    height: '700px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    gap: '1em'
  },
  wrapper: {
    marginTop: '10px',
    marginRight: '10px',
    marginBottom: '12px',
    display: 'flex',
    gap: '1em',
    flexDirection: 'row',
    alignItems: 'center',
  },
  datasetListContainer: {
    width: '50%',
    height: '100%',
  },
  datasetVariablesListContainer: {
    width: '50%',
    height: '100%',
  },
  root: { // table header
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
  },
  rows: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
  tableContainer: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 65px)',
    width: '100%',
  },
}));

const DatasetControls = (props) => {
  const { datasets, at } = props;

  const cl = useStyles();
  const selectedShortName = useSelector (selectedProgramDatasetShortNameSelector);
  const selectedVariableShortName = useSelector (selectedProgramDatasetVariableShortNameSelector);
  // const selectedDatasetData = useSelector (selectedProgramDatasetDataSelector);

  const selectedDataset = datasets && datasets.find (d => d.Dataset_Name === selectedShortName)

  return (
      <div className={cl.container}>
        <div className={cl.datasetListContainer}>
          <TableContainer component={Paper} className={cl.tableContainer} >
            <Table aria-label="collapsible table" stickyHeader className={cl.root}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Name</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datasets.map((k, i) => (
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
          <TableContainer component={Paper} className={cl.tableContainer} >
            <Table aria-label="collapsible table" stickyHeader className={cl.root}>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Variable</TableCell>
                  <TableCell>Units</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDataset && selectedDataset.visualizableVariables.variables.map((k, i) => (
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
    <Proto title={'Datasets'} deps={deps}>
        <DatasetControls datasets={datasets} at={AT && AT.cruiseId}/>
    </Proto>
  );
};

export default DatasetList;

import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Proto from './Proto';
import { activeTrajectorySelector} from './programSelectors';

/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
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
  }
}));

const Row = (props) => {
  const { dataset, at } = props;
  const {
    Dataset_Name,
    Data_Source,
  } = dataset;

  const cl = useRowStyles();

  const highlight = dataset.cruises.includes(at);

  return (
    <React.Fragment>
      <TableRow className={(highlight ? `${cl.root} ${cl.highlight}` : cl.root)} >
        <TableCell>
          <RouterLink
            to={{pathname: `/catalog/datasets/${Dataset_Name}`}}
          >
            {Dataset_Name}
          </RouterLink>
        </TableCell>
        <TableCell>
          {Data_Source}
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles (() => ({
  header: {
    height: '100%'
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
  inner: {
    width: '100%',
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
  container: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 65px)',
    maxHeight: '500px',
  },
}));

const List = (props) => {
  const cl = useStyles();

  const { datasets, at } = props;
  return (
      <div className={cl.header}>
        <div className={cl.inner}>
          <TableContainer component={Paper} className={cl.container} >
            <Table aria-label="collapsible table" stickyHeader className={cl.root}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datasets.map((k, i) => (
                  <Row key={`program_dataset_row${i}`} dataset={k}  at={at} />
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

  return (
    <Proto title={'Datasets'} deps={deps}>
      <List datasets={datasets} at={AT && AT.cruiseId}/>
    </Proto>
  );
};

export default DatasetList

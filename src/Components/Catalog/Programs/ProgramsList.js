import React, { useEffect } from 'react';
import { makeStyles, Link } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { safePath } from '../../../Utility/objectUtils';
import states from '../../../enums/asyncRequestStates';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProgramsSend } from '../../../Redux/actions/catalog';
import Spinner from '../../UI/Spinner';
import { Link as RouterLink } from 'react-router-dom';

/*~~~~~~~~~~~~  Spinner ~~~~~~~~~~~~~~~*/

const useSpinnerStyles = makeStyles((theme) => ({
  spinnerWrapper: {
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

const SpinnerWrapper = (props) => {
  const { message } = props;
  const cl = useSpinnerStyles();
  return (
    <div className={cl.spinnerWrapper}>
      <Spinner message={message} />
    </div>
  );
};

/*~~~~~~~~~~~~  Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

const Row = (props) => {
  const { programName } = props;
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell>
          <Link component={RouterLink} to={`/catalog/programs/${programName}`}>
            {programName}
          </Link>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

/*~~~~~~~~~~~~~~ List ~~~~~~~~~~~~~~~~~~~~*/
const useStyles = makeStyles(() => ({
  header: {
    height: '100%',
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
  root: {
    // table header
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
    },
  },
  container: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 65px)',
    maxHeight: '500px',
  },
}));

const ProgramsList = () => {
  const cl = useStyles();
  const dispatch = useDispatch();

  const programs = useSelector(safePath(['programs']));
  const reqStatus = useSelector(safePath(['programsRequestStatus']));

  useEffect(() => {
    if (reqStatus === states.notTried) {
      dispatch(fetchProgramsSend());
    }
  }, []);

  if (!programs && reqStatus === states.inProgress) {
    return <SpinnerWrapper message={'Fetching Programs'} />;
  } else if (programs && reqStatus === states.succeeded) {
    return (
      <div className={cl.header}>
        <div className={cl.inner}>
          <TableContainer component={Paper} className={cl.container}>
            <Table
              aria-label="collapsible table"
              stickyHeader
              className={cl.root}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((prog, i) => (
                  <Row key={`program_row_${i}`} programName={prog.name} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
  } else {
    return '';
  }
};

export default ProgramsList;

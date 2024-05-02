import React from 'react';
import { useSelector } from 'react-redux';
import {  makeStyles, Link } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';

import { safePathOr } from '../../../Utility/objectUtils';

const useRowStyles = makeStyles({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
});

const useStyles = makeStyles ((theme) => ({
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
  container: {
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
    height: 'calc(100% - 65px)',
    maxHeight: '500px',
  },
}));

const Row = (props) => {
  const { cruise } = props;
  const classes = useRowStyles();

  const {
    Chief_Name,
    Name,
    Nickname,
    Ship_Name,
  } = cruise;
  return (
    <React.Fragment>
      <TableRow className={classes.root} >
        <TableCell>
          <Link
            component={RouterLink}
            to={`/catalog/cruises/${Name}`}
          >
            {Name}
          </Link>
        </TableCell>
        <TableCell>{Nickname}</TableCell>
        <TableCell>{Ship_Name}</TableCell>
        <TableCell>{Chief_Name}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const sortCruises = (cruises) => cruises.slice().sort((a, b) => {
  const nameA = a.Name.toUpperCase();
  const nameB = b.Name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
});

const CruiseList = () => {
  const cl = useStyles();

  const cruises = useSelector (safePathOr ([]) (Array.isArray) (['datasetDetailsPage', 'cruises']));

  const sortedCruises = sortCruises(cruises);

  return (
    <div className={cl.header}>
      <div className={cl.inner}>
        <TableContainer component={Paper} className={cl.container} >
          <Table aria-label="collapsible table" stickyHeader className={cl.root}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Nickname</TableCell>
                <TableCell>Ship Name</TableCell>
                <TableCell>Chief Scientist</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCruises.map((cruise, i) => (
                <Row key={`row${i}`} cruise={cruise}  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default CruiseList;

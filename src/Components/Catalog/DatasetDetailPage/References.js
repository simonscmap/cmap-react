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
import reactStringReplace from 'react-string-replace';

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
  const { reference } = props;
  const classes = useRowStyles();

  const httpRegx = /\b(https?:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|]|ftp:\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;()]*[\-A-Za-z0-9+&@#\/%=~_|])/g;

  const urlify = (text) =>
    reactStringReplace(text, httpRegx, (match, i) => (
      <Link
        key={i}
        href={match}
        target="_blank"
      >
        {match}
      </Link>
    ));

  return (
    <React.Fragment>
      <TableRow className={classes.root} >
        <TableCell>
          {urlify (reference)}
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const ReferencesList = () => {
  const cl = useStyles();

  const references = useSelector (safePathOr ([]) (Array.isArray) (['datasetDetailsPage', 'references']));


  return (
    <div className={cl.header}>
      <div className={cl.inner}>
        <TableContainer component={Paper} className={cl.container} >
          <Table aria-label="collapsible table" stickyHeader className={cl.root}>
            <TableHead>
              <TableRow>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {references.map((reference, i) => (
                <Row key={`row${i}`} reference={reference}  />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default ReferencesList;

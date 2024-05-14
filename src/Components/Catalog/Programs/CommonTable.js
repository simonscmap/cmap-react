import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';
import states from '../../../enums/asyncRequestStates';

import Proto from './Proto';

/*~~~~~~~~~~~~  Common Row  ~~~~~~~~~~~~~~~*/
const useRowStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
}));

export const CommonRow = (props) => {
  const classes = useRowStyles();
  const { cells } = props;
  return (
      <TableRow className={classes.root} >
        {cells}
      </TableRow>
  );
}


/*~~~~~~~~~~~~~~ Common Table ~~~~~~~~~~~~~~~~~~~~*/
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
  body: {
    '& a': {
      color: theme.palette.primary.main,
      '&:visited': {
        color: theme.palette.primary.main
      }
    },
  }
}));

export const CommonTable = (props) => {
  const cl = useStyles();
  const { columns, rows } = props;
  return (
      <div className={cl.header}>
        <div className={cl.inner}>
          <TableContainer component={Paper} className={cl.container} >
            <Table stickyHeader className={cl.root}>
              <TableHead>
                <TableRow>
                  {columns}
                </TableRow>
              </TableHead>
              <TableBody className={cl.body}>
                {rows}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    );
};

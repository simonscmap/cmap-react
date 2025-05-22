import React from 'react';

import { makeStyles, Typography, Tooltip } from '@material-ui/core';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles((theme) => ({
  row: {
    fontSize: '.9em',
  },
  labelCell: {
    verticalAlign: 'top',
    borderBottom: 'none',
    padding: '.1em .3em .1em 0',
    width: '200px',
    minWidth: '200px',
  },
  cell: {
    borderBottom: 'none',
    padding: '.1em .3em .5em 0em',
    '& p': {
      width: '100%',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },
  label: {
    color: 'rgb(135, 255, 244)', //theme.palette.secondary.light,
    whiteSpace: 'nowrap',
  },
  monoValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.primary.light,
  },
}));

const TableRowTextPair = ({ label, value, mono, customComponent }) => {
  const cl = useStyles();
  const textClass = mono ? cl.monoValue : '';

  const RenderValue =
    customComponent ||
    (() => (
      <Tooltip title={value} placement="bottom-start">
        <Typography className={textClass}>{value}</Typography>
      </Tooltip>
    ));

  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{label}</Typography>
      </TableCell>
      <TableCell className={cl.cell}>
        <RenderValue text={value} label={label} mono={mono} />
      </TableCell>
    </TableRow>
  );
};

export default TableRowTextPair;

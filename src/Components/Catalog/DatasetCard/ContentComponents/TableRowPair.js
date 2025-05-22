import React from 'react';

import { makeStyles, Typography } from '@material-ui/core';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import CopyButton from '../../../UI/CopyButton';

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
  },
  label: {
    color: 'rgb(135, 255, 244)',
    whiteSpace: 'nowrap',
  },
  monoValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.common.white,
  },
  inlineCopy: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    maxWidth: '100%',
  },
  textTruncate: {
    display: 'inline-block',
    maxWidth: '100%',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  copyButton: {
    flexShrink: 0,
  },
}));

const TableRowTextPair = ({
  label,
  value,
  mono,
  customComponent,
  copyable,
}) => {
  const cl = useStyles();
  const textClass = mono ? cl.monoValue : '';

  let RenderValue;
  if (customComponent) {
    RenderValue = customComponent;
  } else if (copyable) {
    RenderValue = function InlineCopyValue() {
      return (
        <span className={cl.inlineCopy}>
          <span className={`${cl.textTruncate} ${textClass}`}>{value}</span>
          <CopyButton text={value} />
        </span>
      );
    };
    RenderValue.displayName = 'InlineCopyValue';
  } else {
    RenderValue = function DefaultValue() {
      return <Typography className={textClass}>{value}</Typography>;
    };
    RenderValue.displayName = 'DefaultValue';
  }

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

TableRowTextPair.displayName = 'TableRowTextPair';

export default TableRowTextPair;

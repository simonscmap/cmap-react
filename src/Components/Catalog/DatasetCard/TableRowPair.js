import React, { useState } from 'react';

import { makeStyles, TableCell, TableRow, Typography } from '@material-ui/core';

import CopyButton from '../../UI/CopyButton';

const fontSize = '1em';
const useStyles = makeStyles((theme) => ({
  // Base styles shared by all components
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
    fontSize,
  },
  // Text styles
  text: {
    fontSize,
  },
  monoText: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.common.white,
    fontSize,
  },
  // Copy container styles
  copyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    maxWidth: '100%',
    fontSize,
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '100%',
  },
  copyButton: {
    flexShrink: 0,
  },
  // Long text specific styles
  textTruncate: {
    display: 'inline-block',
    maxWidth: '100%',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    verticalAlign: 'middle',
  },
  expandButton: {
    display: 'block',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontWeight: 500,
  },
}));

const useTableRowValue = (value) => {
  // Normalize empty values to "N/A" and warn on non-string inputs
  let normalizedValue = 'N/A';
  if (value !== null && value !== undefined) {
    if (typeof value !== 'string') {
      console.warn(`Component received non-string value:`, value);
      normalizedValue = 'N/A';
    } else {
      normalizedValue = value.trim() || 'N/A';
    }
  }

  return normalizedValue;
};

const TableRowBase = ({ label, children }) => {
  const cl = useStyles();
  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{label}</Typography>
      </TableCell>
      <TableCell className={cl.cell}>{children}</TableCell>
    </TableRow>
  );
};

const TableRowLongTextPair = ({ label, value, mono }) => {
  const [expanded, setExpanded] = useState(false);
  const cl = useStyles();
  const normalizedValue = useTableRowValue(value);
  const textClass = mono ? cl.monoText : cl.text;

  return (
    <TableRowBase label={label}>
      <Typography className={cl.copyContainer}>
        <span className={cl.flexContainer}>
          <span className={`${!expanded ? cl.textTruncate : ''} ${textClass}`}>
            {normalizedValue}
          </span>
          <CopyButton text={normalizedValue} className={cl.copyButton} />
        </span>
        {normalizedValue.length > 200 && (
          <div
            onClick={() => setExpanded(!expanded)}
            className={cl.expandButton}
          >
            {expanded ? '[Show Less]' : '[Show All]'}
          </div>
        )}
      </Typography>
    </TableRowBase>
  );
};

TableRowLongTextPair.displayName = 'TableRowLongTextPair';

const TableRowTextPair = ({ label, value, mono, copyable }) => {
  const cl = useStyles();
  const normalizedValue = useTableRowValue(value);
  const textClass = mono ? cl.monoText : cl.text;

  return (
    <TableRowBase label={label}>
      {copyable ? (
        <Typography className={cl.copyContainer}>
          <span className={cl.flexContainer}>
            <span className={textClass}>{normalizedValue}</span>
            <CopyButton text={normalizedValue} className={cl.copyButton} />
          </span>
        </Typography>
      ) : (
        <Typography className={textClass}>{normalizedValue}</Typography>
      )}
    </TableRowBase>
  );
};

TableRowTextPair.displayName = 'TableRowTextPair';

export { TableRowTextPair, TableRowLongTextPair };

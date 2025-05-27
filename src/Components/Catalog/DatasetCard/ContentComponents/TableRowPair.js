import React, { useState } from 'react';

import { makeStyles, TableCell, TableRow, Typography } from '@material-ui/core';

import CopyButton from '../../../UI/CopyButton';

const fontSize = '1em';
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
    fontSize: fontSize,
  },
  monoValue: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: theme.palette.common.white,
    fontSize: fontSize,
  },
  value: {
    fontSize: fontSize,
  },
  inlineCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    maxWidth: '100%',
    fontSize: fontSize,
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
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: '10px',
  },
}));

const TableRowTextPair = ({ label, value, mono, copyable }) => {
  const [expanded, setExpanded] = useState(false);

  const cl = useStyles();
  const textClass = mono ? cl.monoValue : cl.value;
  // Normalize empty values to empty string
  // Normalize empty values to "N/A" and warn on non-string inputs
  let normalizedValue = 'N/A';
  if (value !== null && value !== undefined) {
    if (typeof value !== 'string') {
      console.warn('TableRowTextPair received non-string value:', value);
      normalizedValue = 'N/A';
    } else {
      normalizedValue = value.trim() || 'N/A';
    }
  }

  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{label}</Typography>
      </TableCell>
      <TableCell className={cl.cell}>
        {copyable ? (
          <Typography className={cl.inlineCopy}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                maxWidth: '100%',
              }}
            >
              <span
                className={`${!expanded ? cl.textTruncate : ''} ${textClass}`}
              >
                {normalizedValue}
              </span>
              <CopyButton text={normalizedValue} className={cl.copyButton} />
            </span>
            {normalizedValue.length > 200 && (
              <div
                onClick={() => setExpanded(!expanded)}
                style={{
                  display: 'block',
                  cursor: 'pointer',
                  marginTop: 2,
                  color: 'rgb(135, 255, 244)',
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                {expanded ? '[Show Less]' : '[Show All]'}
              </div>
            )}
          </Typography>
        ) : (
          <Typography className={textClass}>{normalizedValue}</Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

TableRowTextPair.displayName = 'TableRowTextPair';

export { TableRowTextPair };

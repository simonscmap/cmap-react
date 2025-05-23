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
  previewImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    marginTop: '10px',
  },
}));

const TableRowTextPair = ({ label, value, mono, copyable }) => {
  const cl = useStyles();
  const textClass = mono ? cl.monoValue : '';
  // Normalize empty values to empty string
  const normalizedValue = value ?? '';

  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{label}</Typography>
      </TableCell>
      <TableCell className={cl.cell}>
        {copyable ? (
          <Typography className={cl.inlineCopy}>
            <span className={`${cl.textTruncate} ${textClass}`}>
              {normalizedValue}
            </span>
            <CopyButton text={normalizedValue} className={cl.copyButton} />
          </Typography>
        ) : (
          <Typography className={textClass}>{normalizedValue}</Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

TableRowTextPair.displayName = 'TableRowTextPair';

const TableRowImagePair = ({ label, imageUrl }) => {
  const cl = useStyles();

  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{label}</Typography>
      </TableCell>
      <TableCell className={cl.cell}>
        <img src={imageUrl} className={cl.previewImage} alt="Preview" />
      </TableCell>
    </TableRow>
  );
};

TableRowImagePair.displayName = 'TableRowImagePair';

export { TableRowTextPair, TableRowImagePair };

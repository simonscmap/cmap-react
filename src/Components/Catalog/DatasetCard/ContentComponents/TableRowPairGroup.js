import React from 'react';
import { makeStyles } from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
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
  valueCell: {
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
  [theme.breakpoints.down('sm')]: {
    labelCell: {
      width: '100%',
      minWidth: '100%',
    },
    valueCell: {
      width: '100%',
    },
  },
}));

const TableRowPairGroup = ({
  firstPair = {
    type: 'text',
    label: '',
    value: '',
    mono: false,
    copyable: false,
  },
  secondPair = {
    type: 'text',
    label: '',
    value: '',
    mono: false,
    copyable: false,
  },
}) => {
  const cl = useStyles();

  const renderValue = (pair) => {
    if (pair.type === 'image') {
      return <img src={pair.value} className={cl.previewImage} alt="Preview" />;
    }

    const normalizedValue = (pair.value && pair.value.trim()) || 'N/A';
    const textClass = pair.mono ? cl.monoValue : '';

    if (pair.copyable) {
      return (
        <Typography className={cl.inlineCopy}>
          <span className={`${cl.textTruncate} ${textClass}`}>
            {normalizedValue}
          </span>
          <CopyButton text={normalizedValue} className={cl.copyButton} />
        </Typography>
      );
    }

    return <Typography className={textClass}>{normalizedValue}</Typography>;
  };

  return (
    <TableRow className={cl.row}>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{firstPair.label}</Typography>
      </TableCell>
      <TableCell className={cl.valueCell}>{renderValue(firstPair)}</TableCell>
      <TableCell component="th" scope="row" className={cl.labelCell}>
        <Typography className={cl.label}>{secondPair.label}</Typography>
      </TableCell>
      <TableCell className={cl.valueCell}>{renderValue(secondPair)}</TableCell>
    </TableRow>
  );
};

export default TableRowPairGroup;

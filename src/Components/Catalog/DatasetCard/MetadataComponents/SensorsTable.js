import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles((theme) => ({
  row: {
    fontSize: '.9em',
  },
  label: {
    color: 'rgb(135, 255, 244)',
    whiteSpace: 'nowrap',
  },
  monoValue: {
    fontFamily: 'mono',
    fontWeight: 'bold',
    color: 'rgb(135, 255, 244)',
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
  labelCell: {
    verticalAlign: 'top',
    borderBottom: 'none',
    padding: '.1em .3em .1em 0',
    width: '200px',
    minWidth: '200px',
  },
  scrollable: {
    maxHeight: '112px',
    overflowY: 'scroll',
  },
  compactTable: {
    '& td': {
      fontSize: '.9em',
      padding: 0,
      textIndent: '.5em',
    },
  },
}));

const SensorsTable = ({ sensors }) => {
  const cl = useStyles();
  if (!sensors || sensors.length === 0) {
    return '';
  }
  return (
    <div className={cl.scrollable}>
      <TableContainer size="small" className={cl.compactTable}>
        <Table>
          <TableHead>
            <TableRow className={cl.row}>
              <TableCell className={cl.labelCell}>
                <Typography className={cl.label}>Sensors</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody className={cl.body}>
            {sensors.map((s, i) => (
              <TableRow className={cl.row} key={i}>
                <TableCell className={cl.cell}>
                  <Typography className={cl.textValue}>{s.trim()}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SensorsTable;

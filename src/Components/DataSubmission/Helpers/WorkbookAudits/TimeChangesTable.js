import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import renderText from '../../../Home/News/renderText';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    maxHeight: '400px',
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    backdropFilter: 'blur(20px)',
  },
  table: {
    '& th': {
      fontWeight: 'bold',
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: theme.palette.common.white,
    },
    '& td': {
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  description: {
    marginBottom: theme.spacing(1),
  },
  note: {
    marginBottom: theme.spacing(2),
    fontStyle: 'italic',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(30, 67, 113, 0.2)',
    },
  },
  cellBefore: {
    color: theme.palette.error.light,
    fontFamily: 'monospace',
  },
  cellAfter: {
    color: theme.palette.success.light,
    fontFamily: 'monospace',
  },
  noChanges: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
}));
const descriptions = {
  EXCEL_TO_UTC:
    'Excel numeric date format does not include timezone information, assumed to be UTC',
  STRING_NO_TZ_TO_UTC:
    'String time without timezone information assumed to be UTC',
  STRING_NON_UTC_TO_UTC:
    'String time with non-UTC timezone was converted to UTC',
};

const TimeChangesTable = (props) => {
  const { summary, note, changes } = props;
  const classes = useStyles();

  if (!changes || changes.length === 0) {
    return (
      <div>
        <Typography className={classes.description}>
          {renderText(summary)}
        </Typography>
        <Typography className={classes.noChanges}>
          No actual changes were made to time values
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography className={classes.description}>
        {renderText(summary)}
      </Typography>
      {note && (
        <Typography className={classes.note}>{renderText(note)}</Typography>
      )}

      <TableContainer component={Paper} className={classes.container}>
        <Table stickyHeader className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Original Value</TableCell>
              <TableCell>Converted Value</TableCell>
              <TableCell>Conversion Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map((row) => (
              <TableRow key={row.row} className={classes.row}>
                <TableCell>{row.row}</TableCell>
                <TableCell className={classes.cellBefore}>
                  {row.prevValue}
                </TableCell>
                <TableCell className={classes.cellAfter}>
                  {row.newValue}
                </TableCell>
                <TableCell>{descriptions[row.conversionType]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TimeChangesTable;

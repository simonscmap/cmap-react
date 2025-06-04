import React from 'react';
import {
  Typography,
  Paper,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { getChangeSummary } from './Helpers/changeLog';

const useStyles = makeStyles((theme) => ({
  changeSummaryHeader: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    textDecoration: 'underline',
    textDecorationColor: theme.palette.secondary.main,
  },
  tableRoot: {
    '& .MuiTableCell-stickyHeader': {
      backgroundColor: 'rgb(5, 27, 54)',
    },
  },
  changeTableContainer: {
    maxHeight: 440,
  },
  submittedTypography: {
    marginBottom: '12px',
  },
  needHelpLink: {
    letterSpacing: 'normal',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
}));

const ChangeRow = (props) => {
  const { data } = props;
  const { sheet, row, col, original, current } = data;
  return (
    <TableRow>
      <TableCell>{sheet}</TableCell>
      <TableCell>{row}</TableCell>
      <TableCell>{col}</TableCell>
      <TableCell>{original}</TableCell>
      <TableCell>{current}</TableCell>
    </TableRow>
  );
};

const ChangeTable = (props) => {
  const cl = useStyles();
  const { getChangeLog, handleDownloadWorkbook } = props;

  const changeLog = getChangeLog();

  if (!changeLog || !Array.isArray(changeLog)) {
    return '';
  }

  const summary = getChangeSummary(changeLog);

  if (summary.length === 0) {
    return (
      <div>
        <Typography className={cl.changeSummaryHeader}>
          Change Summary
        </Typography>
        <Typography className={cl.submittedTypography}>
          No changes to the uploaded submission file were made in the validation
          process.
        </Typography>
      </div>
    );
  }

  return (
    <div>
      <Typography className={cl.changeSummaryHeader}>Change Summary</Typography>
      <Typography className={cl.submittedTypography}>
        The changes you made to the uploaded file during the this validation
        process are listed below. You can download the edited workbook by
        clicking{' '}
        <Link
          style={{ display: 'inline-block' }}
          className={cl.needHelpLink}
          onClick={handleDownloadWorkbook}
          component="span"
        >
          here
        </Link>
        .
      </Typography>
      <TableContainer component={Paper} className={cl.changeTableContainer}>
        <Table
          aria-label="collapsible table"
          stickyHeader
          className={cl.tableRoot}
        >
          <TableHead>
            <TableRow>
              <TableCell>Sheet</TableCell>
              <TableCell>Row</TableCell>
              <TableCell>Column</TableCell>
              <TableCell>Original Value</TableCell>
              <TableCell>Changed Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.map((change, i) => (
              <ChangeRow data={change} key={`change_row_${i}`} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ChangeTable;

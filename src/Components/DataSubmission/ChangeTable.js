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
import TimeChangesTable from './Helpers/WorkbookAudits/TimeChangesTable';
import { groupTimeChangesByConversionType } from './Helpers/formatDataSheet';

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
  sectionHeader: {
    fontSize: '1em',
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '8px',
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
  const { getChangeLog, handleDownloadWorkbook, dataChanges } = props;
  const changeLog = getChangeLog();

  const hasUserChanges =
    changeLog && Array.isArray(changeLog) && changeLog.length > 0;
  const hasAutoChanges =
    dataChanges && Array.isArray(dataChanges) && dataChanges.length > 0;

  if (!hasUserChanges && !hasAutoChanges) {
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

  const userChangeSummary = hasUserChanges ? getChangeSummary(changeLog) : [];

  // Process automatic changes using the shared utility
  const processedAutoChanges = hasAutoChanges
    ? groupTimeChangesByConversionType(dataChanges)
    : [];

  return (
    <div>
      <Typography className={cl.changeSummaryHeader}>Change Summary</Typography>
      <Typography className={cl.submittedTypography}>
        The changes made to the uploaded file during the validation process are
        listed below. You can download the edited workbook by clicking{' '}
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

      {hasAutoChanges && (
        <>
          <Typography className={cl.sectionHeader}>
            Automatic Time Format Changes
          </Typography>
          <TimeChangesTable
            summary={`${dataChanges.length} rows had time format conversions applied during initial file processing.`}
            note="Showing one example of each conversion type:"
            changes={processedAutoChanges}
          />
        </>
      )}

      {hasUserChanges && (
        <>
          <Typography className={cl.sectionHeader}>Manual Changes</Typography>
          <TableContainer component={Paper} className={cl.changeTableContainer}>
            <Table
              aria-label="user changes table"
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
                {userChangeSummary.map((change, i) => (
                  <ChangeRow data={change} key={`user_change_row_${i}`} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default ChangeTable;

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TableVirtuoso } from 'react-virtuoso';
import { useDispatch } from 'react-redux';
import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import SelectAllDropdown from './SelectAllDropdown';
import MultiDatasetDownloadRow from './MultiDatasetDownloadRow';
import { snackbarOpen } from '../../../Redux/actions/ui';
import { RecalculateAllButton } from '../../rowCount';
import { transformConstraintsForRowCount } from '../utils/constraintTransformer';
import colors from '../../../enums/colors';
import logInit from '../../../Services/log-service';

let log = logInit('MultiDatasetDownloadTable');

let useStyles = makeStyles({
  hoverRow: {
    border: 0,
    '&:hover': {
      backgroundColor: colors.darkBlue,
    },
  },
});

let styles = {
  tableContainerStyle: {
    maxWidth: 1400,
    margin: '0 auto',
    backgroundColor: colors.darkBlueLight,
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  tableStyle: {
    width: '100%',
    minWidth: 900,
  },
  tableHeadStyle: {
    backgroundColor: colors.deepSlate,
  },
  headerCellStyle: {
    padding: '8px',
    border: 0,
    color: colors.lightGreen,
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: colors.deepSlate,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  rowCountHeaderCell: {
    padding: '8px',
    paddingRight: '16px',
    border: 0,
    color: colors.lightGreen,
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: colors.deepSlate,
    verticalAlign: 'middle',
  },
  twoLineHeaderCell: {
    padding: '8px',
    border: 0,
    color: colors.lightGreen,
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: colors.deepSlate,
    verticalAlign: 'middle',
    textAlign: 'right',
    lineHeight: 1.3,
  },
  bodyCellStyle: {
    padding: '12px 8px',
    border: 0,
    color: '#ffffff',
    lineHeight: 1.4,
    verticalAlign: 'middle',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

let MultiDatasetDownloadTable = function MultiDatasetDownloadTable(props) {
  let { datasetsMetadata, filterValues } = props;
  let dispatch = useDispatch();
  let classes = useStyles();

  let selectAll = useMultiDatasetDownloadStore(function (state) {
    return state.selectAll;
  });
  let clearSelections = useMultiDatasetDownloadStore(function (state) {
    return state.clearSelections;
  });
  let getSelectAllCheckboxState = useMultiDatasetDownloadStore(function (state) {
    return state.getSelectAllCheckboxState;
  });

  let checkboxState = getSelectAllCheckboxState(datasetsMetadata || []);
  let areAllSelected = checkboxState.checked;
  let areIndeterminate = checkboxState.indeterminate;

  let currentConstraints = React.useMemo(function () {
    return transformConstraintsForRowCount(filterValues);
  }, [filterValues]);

  let handleSelectAll = React.useCallback(function () {
    try {
      selectAll(datasetsMetadata);
    } catch (error) {
      log.error('Failed to select all datasets', error);
      dispatch(
        snackbarOpen('Failed to select datasets. Please try again.', {
          position: 'bottom',
          severity: 'error',
        }),
      );
    }
  }, [selectAll, datasetsMetadata, dispatch]);

  let handleClearAll = React.useCallback(function () {
    clearSelections(datasetsMetadata);
  }, [clearSelections, datasetsMetadata]);

  let handleProgramClick = React.useCallback(function (program) {
    return function (event) {
      event.stopPropagation();
      window.open('/programs/' + program, '_blank');
    };
  }, []);

  let hasData = datasetsMetadata && datasetsMetadata.length > 0;

  let MuiTableComponents = React.useMemo(function () {
    return {
      Table: function (tableProps) {
        return (
          <Table
            stickyHeader
            size="small"
            aria-label="dataset selection table"
            style={styles.tableStyle}
            {...tableProps}
          />
        );
      },
      TableHead: function (headProps) {
        return <TableHead style={styles.tableHeadStyle} {...headProps} />;
      },
      TableRow: function (rowProps) {
        return <TableRow className={classes.hoverRow} {...rowProps} />;
      },
      TableBody: React.forwardRef(function (bodyProps, ref) {
        return <TableBody ref={ref} {...bodyProps} />;
      }),
    };
  }, [classes.hoverRow]);

  let fixedHeaderContent = function () {
    return (
      <TableRow>
        <TableCell width={50} style={styles.headerCellStyle}>
          <SelectAllDropdown
            areAllSelected={areAllSelected}
            areIndeterminate={areIndeterminate}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
            disabled={!hasData}
          />
        </TableCell>
        <TableCell style={{ ...styles.headerCellStyle, minWidth: 150 }}>
          Dataset Name
        </TableCell>
        <TableCell align="right" style={styles.rowCountHeaderCell}>
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-end"
            style={{ gap: '4px' }}
          >
            <span>Row Count</span>
            <RecalculateAllButton constraints={currentConstraints} />
          </Box>
        </TableCell>
        <TableCell width={90} style={styles.headerCellStyle}>
          Start Date
        </TableCell>
        <TableCell width={90} style={styles.headerCellStyle}>
          End Date
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Lat<br />Min
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Lat<br />Max
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Lon<br />Min
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Lon<br />Max
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Depth<br />Min
        </TableCell>
        <TableCell width={50} align="right" style={styles.twoLineHeaderCell}>
          Depth<br />Max
        </TableCell>
        <TableCell width={80} style={styles.headerCellStyle}>
          Programs
        </TableCell>
      </TableRow>
    );
  };

  let itemContent = function (_index, datasetMetadata) {
    return (
      <MultiDatasetDownloadRow
        datasetMetadata={datasetMetadata}
        currentConstraints={currentConstraints}
        handleProgramClick={handleProgramClick}
      />
    );
  };

  if (!hasData || datasetsMetadata.length <= 5) {
    return (
      <Paper style={{ ...styles.tableContainerStyle, maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader size="small" style={styles.tableStyle}>
          <TableHead style={styles.tableHeadStyle}>
            {fixedHeaderContent()}
          </TableHead>
          <TableBody>
            {!hasData ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  style={{ ...styles.bodyCellStyle, textAlign: 'center' }}
                >
                  <Typography variant="body1" color="textSecondary">
                    No datasets available
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              datasetsMetadata.map(function (datasetMetadata) {
                return (
                  <TableRow key={datasetMetadata.shortName} className={classes.hoverRow}>
                    <MultiDatasetDownloadRow
                      datasetMetadata={datasetMetadata}
                      currentConstraints={currentConstraints}
                      handleProgramClick={handleProgramClick}
                    />
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Paper>
    );
  }

  return (
    <Paper style={styles.tableContainerStyle}>
      <TableVirtuoso
        style={{ height: 400 }}
        data={datasetsMetadata}
        components={MuiTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={itemContent}
      />
    </Paper>
  );
};

export default MultiDatasetDownloadTable;

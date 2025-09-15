import React, { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';

import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import { dateToDateString } from '../../../shared/filtering/utils/dateHelpers';
import SelectAllDropdown from './SelectAllDropdown';
import { snackbarOpen } from '../../../Redux/actions/ui';

const styles = {
  tableContainerStyle: {
    maxHeight: 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  tableHeadStyle: {
    backgroundColor: 'rgba(30, 67, 113, 1)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
  },
  headerCellStyle: {
    padding: '8px 5px',
    border: 0,
    color: '#8bc34a',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: 'rgba(30, 67, 113, 1)',
  },
  tableRowStyle: {
    border: 0,
  },
  tableRowHoverStyle: {
    border: 0,
    backgroundColor: 'rgba(16, 43, 60, 1)',
  },
  bodyCellStyle: {
    padding: '5px',
    border: 0,
    color: '#ffffff',
    lineHeight: '35px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

const MultiDatasetDownloadTable = ({ datasetsMetadata, filterValues }) => {
  const dispatch = useDispatch();
  const {
    isDatasetSelected,
    toggleDatasetSelection,
    selectAll,
    clearSelections,
    getSelectAllCheckboxState,
  } = useMultiDatasetDownloadStore();
  const {
    getEffectiveRowCount,
    isRowCountLoading,
    getRowCountError,
    initializeWithDatasets,
    resetStore: resetRowCountStore,
    getThresholdConfig,
    getTotalSelectedRows,
  } = useRowCountStore();
  const [hoveredRow, setHoveredRow] = React.useState(null);

  const handleToggle = (datasetName) => (event) => {
    event.stopPropagation();
    toggleDatasetSelection(
      datasetName,
      () => useRowCountStore.getState(),
      filterValues,
    );
  };

  const handleProgramClick = (program) => (event) => {
    event.stopPropagation();
    window.open(`/programs/${program}`, '_blank');
  };

  const rowCountStoreActions = useRowCountStore();

  const getRowCountStoreInstance = () => {
    return {
      ...rowCountStoreActions,
      getThresholdConfig: getThresholdConfig,
      getEffectiveRowCount: getEffectiveRowCount,
      getTotalSelectedRows: getTotalSelectedRows,
    };
  };

  const handleSelectAll = async () => {
    try {
      const result = await selectAll(
        getRowCountStoreInstance,
        datasetsMetadata,
        filterValues,
      );

      if (result.wasPartialSelection) {
        dispatch(
          snackbarOpen(
            `Not all datasets could be selected because they would exceed the ${result.formattedThreshold}M row limit.`,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to select all datasets:', error);
      dispatch(snackbarOpen('Failed to select datasets. Please try again.'));
    }
  };

  const handleClearAll = () => {
    clearSelections(datasetsMetadata);
  };

  const formatLatLon = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return Number(value).toFixed(1);
  };

  const formatDepth = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return Math.round(Number(value)).toString();
  };

  const formatTime = (value) => {
    if (value === null || value === undefined) return 'N/A';
    try {
      return dateToDateString(new Date(value));
    } catch (error) {
      return 'N/A';
    }
  };

  const getOriginalRowCount = (datasetName) => {
    const { originalRowCounts } = useRowCountStore.getState();
    return originalRowCounts[datasetName];
  };

  const renderRowCount = (datasetName, isSelected) => {
    const effectiveCount = getEffectiveRowCount(datasetName);
    const isLoading = isRowCountLoading(datasetName);
    const error = getRowCountError(datasetName);
    const originalCount = getOriginalRowCount(datasetName);

    // Only show loading indicators for selected datasets
    if (isSelected && isLoading) {
      return <CircularProgress size={16} color="primary" />;
    }

    // Only show errors for selected datasets
    if (isSelected && error) {
      return (
        <Typography variant="body2" color="error">
          Error
        </Typography>
      );
    }

    // Show "≤ [count]" for unselected datasets when filters are active
    if (!isSelected && filterValues?.isFiltered && originalCount) {
      return (
        <Typography variant="body2" noWrap>
          ≤ {originalCount.toLocaleString()}
        </Typography>
      );
    }

    // Default display logic
    return (
      <Typography variant="body2" noWrap>
        {effectiveCount !== null && effectiveCount !== undefined
          ? effectiveCount.toLocaleString()
          : 'N/A'}
      </Typography>
    );
  };

  useEffect(() => {
    if (datasetsMetadata?.length > 0) {
      const rowCountData = {};
      datasetsMetadata.forEach((dataset) => {
        if (dataset.Row_Count) {
          rowCountData[dataset.Dataset_Name] = dataset.Row_Count;
        }
      });
      initializeWithDatasets(rowCountData);
    }
  }, []);

  // Reset row count store when component unmounts
  useEffect(() => {
    return () => {
      resetRowCountStore();
    };
  }, [resetRowCountStore]);

  return (
    <TableContainer component={Paper} style={styles.tableContainerStyle}>
      <Table stickyHeader size="small" aria-label="dataset selection table">
        <TableHead style={styles.tableHeadStyle}>
          <TableRow>
            <TableCell width={50} style={styles.headerCellStyle}>
              <SelectAllDropdown
                areAllSelected={
                  getSelectAllCheckboxState(datasetsMetadata).checked
                }
                areIndeterminate={
                  getSelectAllCheckboxState(datasetsMetadata).indeterminate
                }
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                disabled={!datasetsMetadata || datasetsMetadata.length === 0}
              />
            </TableCell>
            <TableCell
              style={{ ...styles.headerCellStyle, width: 'fit-content' }}
            >
              Dataset Name
            </TableCell>
            <TableCell width={120} align="right" style={styles.headerCellStyle}>
              Row Count
            </TableCell>
            <TableCell width={90} style={styles.headerCellStyle}>
              Start Date
            </TableCell>
            <TableCell width={90} style={styles.headerCellStyle}>
              End Date
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Lat Min
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Lat Max
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Lon Min
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Lon Max
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Depth Min
            </TableCell>
            <TableCell width={80} style={styles.headerCellStyle}>
              Depth Max
            </TableCell>
            <TableCell width={120} style={styles.headerCellStyle}>
              Programs
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {!datasetsMetadata || datasetsMetadata.length === 0 ? (
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
            datasetsMetadata.map((datasetMetadata) => {
              const isSelected = isDatasetSelected(
                datasetMetadata.Dataset_Name,
              );
              const isHovered = hoveredRow === datasetMetadata.Dataset_Name;
              return (
                <TableRow
                  key={datasetMetadata.Dataset_Name}
                  selected={isSelected}
                  style={
                    isHovered ? styles.tableRowHoverStyle : styles.tableRowStyle
                  }
                  onMouseEnter={() =>
                    setHoveredRow(datasetMetadata.Dataset_Name)
                  }
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell style={styles.bodyCellStyle}>
                    <Checkbox
                      checked={isSelected}
                      onChange={handleToggle(datasetMetadata.Dataset_Name)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {datasetMetadata.Dataset_Name || ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    {renderRowCount(datasetMetadata.Dataset_Name, isSelected)}
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatTime(datasetMetadata.Time_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatTime(datasetMetadata.Time_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lat_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lat_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lon_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lon_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatDepth(datasetMetadata.Depth_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatDepth(datasetMetadata.Depth_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Box display="flex" flexWrap="wrap" style={{ gap: '3px' }}>
                      {datasetMetadata.Programs?.filter(
                        (program) => program !== 'NA',
                      ).map((program, index) => (
                        <Chip
                          key={index}
                          label={program}
                          size="small"
                          clickable
                          onClick={handleProgramClick(program)}
                          style={{
                            backgroundColor: '#8bc34a',
                            color: '#000000',
                            fontSize: '0.75rem',
                            height: '20px',
                            cursor: 'pointer',
                          }}
                        />
                      )) || (
                        <Typography variant="body2" noWrap>
                          N/A
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MultiDatasetDownloadTable;

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
} from '@material-ui/core';

import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import useRowCountStore from '../stores/useRowCountStore';
import { dateToDateString } from '../../../shared/filtering/dateHelpers';

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

const MultiDatasetDownloadTable = () => {
  const { datasetsMetadata, isDatasetSelected, toggleDatasetSelection } =
    useMultiDatasetDownloadStore();
  const {
    getEffectiveRowCount,
    isRowCountLoading,
    getRowCountError,
    initializeWithDatasets,
  } = useRowCountStore();

  const [hoveredRow, setHoveredRow] = React.useState(null);

  const handleToggle = (datasetName) => (event) => {
    event.stopPropagation();
    toggleDatasetSelection(datasetName);
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

  const renderRowCount = (datasetName) => {
    const effectiveCount = getEffectiveRowCount(datasetName);
    const isLoading = isRowCountLoading(datasetName);
    const error = getRowCountError(datasetName);

    if (isLoading) {
      return <CircularProgress size={16} color="primary" />;
    }
    if (error) {
      return (
        <Typography variant="body2" color="error">
          Error
        </Typography>
      );
    }
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

  if (!datasetsMetadata || datasetsMetadata.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          No datasets available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} style={styles.tableContainerStyle}>
      <Table stickyHeader size="small" aria-label="dataset selection table">
        <TableHead style={styles.tableHeadStyle}>
          <TableRow>
            <TableCell width={50} style={styles.headerCellStyle} />
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
          </TableRow>
        </TableHead>
        <TableBody>
          {datasetsMetadata.map((datasetMetadata) => {
            const isSelected = isDatasetSelected(datasetMetadata.Dataset_Name);
            const isHovered = hoveredRow === datasetMetadata.Dataset_Name;
            return (
              <TableRow
                key={datasetMetadata.Dataset_Name}
                selected={isSelected}
                style={
                  isHovered ? styles.tableRowHoverStyle : styles.tableRowStyle
                }
                onMouseEnter={() => setHoveredRow(datasetMetadata.Dataset_Name)}
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
                  {renderRowCount(datasetMetadata.Dataset_Name)}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MultiDatasetDownloadTable;

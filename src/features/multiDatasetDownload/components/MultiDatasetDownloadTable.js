import React from 'react';
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
  Chip,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';

import useMultiDatasetDownloadStore from '../stores/multiDatasetDownloadStore';
import { dateToUTCDateString } from '../../../shared/filtering/utils/dateHelpers';
import { DatasetNameLink } from '../../../shared/components';
import SelectAllDropdown from './SelectAllDropdown';
import { snackbarOpen } from '../../../Redux/actions/ui';
import temporalResolutions from '../../../enums/temporalResolutions';
import { RowCountCell, RecalculateAllButton } from '../../rowCount';
import { transformConstraintsForRowCount } from '../utils/constraintTransformer';

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
    verticalAlign: 'top',
  },
  rowCountHeaderCell: {
    padding: '8px 5px',
    border: 0,
    color: '#8bc34a',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: 'rgba(30, 67, 113, 1)',
    verticalAlign: 'top',
    height: 60, // Taller to accommodate button below text
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
  const [hoveredRow, setHoveredRow] = React.useState(null);

  const handleToggle = (datasetName) => (event) => {
    event.stopPropagation();
    toggleDatasetSelection(datasetName);
  };

  const handleProgramClick = (program) => (event) => {
    event.stopPropagation();
    window.open(`/programs/${program}`, '_blank');
  };

  const handleSelectAll = () => {
    try {
      selectAll(datasetsMetadata);
    } catch (error) {
      console.error('Failed to select all datasets:', error);
      dispatch(
        snackbarOpen('Failed to select datasets. Please try again.', {
          position: 'bottom',
          severity: 'error',
        }),
      );
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

  const formatTime = (value, datasetMetadata, isStartDate = true) => {
    // Monthly Climatology datasets have null Time_Min/Time_Max
    if (value === null || value === undefined) {
      // Check if this is a Monthly Climatology dataset
      // Either by explicit Temporal_Resolution field or by null Time_Min AND Time_Max
      const isMonthlyClimatology =
        datasetMetadata?.Temporal_Resolution ===
          temporalResolutions.monthlyClimatology ||
        (datasetMetadata?.Time_Min === null &&
          datasetMetadata?.Time_Max === null);

      if (isMonthlyClimatology) {
        return isStartDate ? 'Monthly' : 'Climatology';
      }
      return 'N/A';
    }
    return dateToUTCDateString(value) || 'N/A';
  };

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
            <TableCell width={120} align="right" style={styles.rowCountHeaderCell}>
              <Box display="flex" flexDirection="column" alignItems="flex-end" style={{ gap: '4px' }}>
                <span>Row Count</span>
                <RecalculateAllButton
                  constraints={transformConstraintsForRowCount(filterValues)}
                />
              </Box>
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
                    <DatasetNameLink
                      datasetShortName={datasetMetadata.Dataset_Name}
                      typographyProps={{ variant: 'body2', noWrap: true }}
                    />
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatTime(
                        datasetMetadata.Time_Min,
                        datasetMetadata,
                        true,
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatTime(
                        datasetMetadata.Time_Max,
                        datasetMetadata,
                        false,
                      )}
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
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <RowCountCell
                      shortName={datasetMetadata.Dataset_Name}
                      currentConstraints={transformConstraintsForRowCount(filterValues)}
                    />
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

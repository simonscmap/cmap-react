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
import colors from '../../../enums/colors';

const styles = {
  tableContainerStyle: {
    maxHeight: 400,
    maxWidth: 1400,
    margin: '0 auto',
    backgroundColor: colors.darkBlueLight,
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflow: 'auto',
    position: 'relative',
    zIndex: 1,
  },
  tableStyle: {
    width: '100%',
    minWidth: 900,
  },
  tableHeadStyle: {
    backgroundColor: colors.deepSlate,
    position: 'sticky',
    top: 0,
    zIndex: 2,
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
  tableRowStyle: {
    border: 0,
  },
  tableRowHoverStyle: {
    border: 0,
    backgroundColor: colors.darkBlue,
  },
  bodyCellStyle: {
    padding: '12px 8px',
    border: 0,
    color: '#ffffff',
    lineHeight: 1.4,
    verticalAlign: 'top',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  datasetNameCellStyle: {
    padding: '12px 8px',
    border: 0,
    color: '#ffffff',
    lineHeight: 1.4,
    verticalAlign: 'top',
    minWidth: 150,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
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
    return Math.round(Number(value)).toLocaleString();
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
      <Table stickyHeader size="small" aria-label="dataset selection table" style={styles.tableStyle}>
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
              style={{ ...styles.headerCellStyle, minWidth: 150 }}
            >
              Dataset Name
            </TableCell>
            <TableCell align="right" style={styles.rowCountHeaderCell}>
              <Box display="flex" flexDirection="row" flexWrap="wrap" alignItems="center" justifyContent="flex-end" style={{ gap: '4px' }}>
                <span>Row Count</span>
                <RecalculateAllButton
                  constraints={transformConstraintsForRowCount(filterValues)}
                />
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
                  <TableCell style={styles.datasetNameCellStyle}>
                    <DatasetNameLink
                      datasetShortName={datasetMetadata.Dataset_Name}
                      typographyProps={{ variant: 'body2' }}
                    />
                  </TableCell>
                  <TableCell align="right" style={{ ...styles.bodyCellStyle, paddingRight: '16px' }}>
                    <RowCountCell
                      shortName={datasetMetadata.Dataset_Name}
                      currentConstraints={transformConstraintsForRowCount(filterValues)}
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
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lat_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lat_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lon_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatLatLon(datasetMetadata.Lon_Max)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
                    <Typography variant="body2" noWrap>
                      {formatDepth(datasetMetadata.Depth_Min)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" style={styles.bodyCellStyle}>
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
                            backgroundColor: colors.lightGreen,
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

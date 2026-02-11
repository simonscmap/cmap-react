import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Checkbox,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  useRowStateStyles,
  InfoTooltip,
} from '../../../../../shared/components';
import SelectAllDropdown from '../../../../multiDatasetDownload/components/SelectAllDropdown';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import {
  RecalculateAllButton,
  RowCountCell,
  reEstimateWithConstraints,
} from '../../../../rowCount';
import { createColumnDefinitions } from '../utils/columnDefinitions';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: (props) => props.maxHeight || 400,
    backgroundColor: 'rgba(16, 43, 60, 0.6)',
    borderRadius: '6px',
    boxShadow:
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    overflowY: 'scroll',
    overflowX: 'scroll',
    position: 'relative',
    zIndex: 1,
    '& .MuiTableCell-head': {
      backgroundColor: 'rgba(30, 67, 113, 1)',
      color: '#8bc34a',
      fontWeight: 500,
      fontSize: '14px', // Consistent 14px font size
      position: 'sticky',
      top: 0,
      zIndex: 2,
      padding: '8px 8px',
      border: 0,
      verticalAlign: 'middle',
      lineHeight: 1.2,
    },
    '& .MuiTableCell-body': {
      verticalAlign: 'top',
    },
  },
  table: {
    width: '100%',
    // Apply first-child/last-child padding to ALL rows (header and body)
    '& .MuiTableCell-root:first-child': {
      paddingLeft: '16px',
    },
    '& .MuiTableCell-root:last-child': {
      paddingRight: '16px',
    },
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  alreadyPresentRow: {
    opacity: 0.6,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    boxShadow: 'inset 3px 0 0 rgba(128, 128, 128, 0.6)',
    '&:hover': {
      backgroundColor: 'rgba(128, 128, 128, 0.15)',
    },
  },
  tableCell: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.85rem',
    padding: '12px 8px',
    border: 0,
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: 1.4,
    backgroundColor: 'transparent !important',
  },
  checkboxCell: {
    width: '50px',
  },
  statusCell: {
    width: '60px',
    textAlign: 'center',
    textDecoration: 'none !important', // Prevent line-through on status in marked-for-removal rows
  },
  datasetNameCell: {
    minWidth: '200px',
    maxWidth: '350px',
  },
  datasetDescription: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: theme.spacing(0.5),
    lineHeight: 1.3,
  },
  typeCell: {
    width: '100px',
  },
  coverageCell: {
    width: '110px',
    textAlign: 'right',
  },
  // TEMPORARY: Dataset utilization column style - will be deleted later
  utilizationCell: {
    width: '120px',
    textAlign: 'right',
  },
  overlapCell: {
    width: '160px',
    fontSize: '0.8rem',
    verticalAlign: 'top',
  },
  rowsCell: {
    width: '120px',
    textAlign: 'right',
  },
  rowsHeaderCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: theme.spacing(0.5),
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  clickableHeader: {
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  sortableHeaderLabel: {
    fontSize: '14px',
    maxHeight: '2.8em', // ~2 lines at 1.4 line-height
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    lineHeight: 1.4,
  },
}));

/**
 * SpatialTemporalResultsTable Component
 *
 * Displays search results from spatial-temporal overlap search with custom columns
 * for overlap metrics. Extends the DatasetsTableSection pattern with:
 * - Spatial/Temporal/Depth Coverage % columns (grouped together)
 * - Date/Spatial/Depth Overlap range columns (grouped together)
 * - Conditional column visibility based on constraint enablement
 * - Universal sorting subsystem integration
 * - Selection management via addDatasetsStore
 *
 * Column Order:
 * 1. Checkbox, Status, Dataset Name, Type, Dataset Utilization
 * 2. Coverage Group: Spatial %, Temporal %, Depth %
 * 3. Overlap Group: Date Overlap, Spatial Overlap, Depth Overlap
 * 4. Rows
 *
 * @param {Object} props
 * @param {Array|null} props.results - Array of DatasetOverlapResult objects (null before search)
 * @param {Set} props.selectedDatasetIds - Set of selected dataset short names
 * @param {Set} props.currentCollectionDatasetIds - Dataset IDs already in collection (for de-duplication)
 * @param {Function} props.onToggleSelection - Callback when dataset checkbox is toggled
 * @param {boolean} props.temporalEnabled - Whether temporal constraints are active (shows temporal columns)
 * @param {boolean} props.depthEnabled - Whether depth constraints are active (shows depth columns)
 * @param {boolean} props.isLoading - Whether search is currently in progress
 * @param {number} props.maxHeight - Maximum height of table container in pixels (default: 400)
 */
const SpatialTemporalResultsTable = ({
  results,
  selectedDatasetIds,
  currentCollectionDatasetIds,
  onToggleSelection,
  temporalEnabled,
  depthEnabled,
  isLoading = false,
  maxHeight = 400,
}) => {
  const classes = useStyles({ maxHeight });
  const { getStatusIcon } = useRowStateStyles();

  // Get data type filter, sort mode, and sort direction from search store
  const selectedDataTypes = useSpatialTemporalSearchStore(
    (state) => state.selectedDataTypes,
  );
  const setSelectedDataTypes = useSpatialTemporalSearchStore(
    (state) => state.setSelectedDataTypes,
  );
  const sortMode = useSpatialTemporalSearchStore((state) => state.sortMode);
  const sortDirection = useSpatialTemporalSearchStore(
    (state) => state.sortDirection,
  );
  const setSortMode = useSpatialTemporalSearchStore(
    (state) => state.setSortMode,
  );
  const spatialBounds = useSpatialTemporalSearchStore(
    (state) => state.spatialBounds,
  );
  const temporalRange = useSpatialTemporalSearchStore(
    (state) => state.temporalRange,
  );
  const depthRange = useSpatialTemporalSearchStore((state) => state.depthRange);
  const includePartialOverlaps = useSpatialTemporalSearchStore(
    (state) => state.includePartialOverlaps,
  );
  // Handle null results (before first search)
  // SQL filtering now handles all type filtering (1, 2, or 3 types) via IN clause
  const safeResults = results || [];
  const currentConstraints = React.useMemo(
    () => ({
      spatialBounds,
      temporalRange,
      depthRange,
      temporalEnabled,
      depthEnabled,
      includePartialOverlaps,
    }),
    [
      spatialBounds,
      temporalRange,
      depthRange,
      temporalEnabled,
      depthEnabled,
      includePartialOverlaps,
    ],
  );

  const isFirstRender = useRef(true);
  const hasResults = results && results.length > 0;
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (hasResults) {
      reEstimateWithConstraints(currentConstraints);
    }
  }, [currentConstraints, hasResults]);

  // Handle header click to change sort mode
  const handleHeaderClick = useCallback(
    (field) => {
      let newMode = 'default';

      switch (field) {
        case 'spatialCoverage':
          newMode = 'spatial';
          break;
        case 'temporalCoverage':
          newMode = 'temporal';
          break;
        case 'depthCoverage':
          newMode = 'depth';
          break;
        case 'datasetUtilization':
          newMode = 'utilization';
          break;
        default:
          newMode = 'default';
      }

      setSortMode(newMode); // This will trigger search() via setSortMode action
    },
    [setSortMode],
  );

  // Use results directly from store (pre-sorted by SQL)
  const sortedResults = safeResults;

  // Define column configuration (single source of truth for headers and body cells)
  const columnConfig = useMemo(
    () =>
      createColumnDefinitions({
        classes,
        getStatusIcon,
        currentCollectionDatasetIds,
        sortMode,
        sortDirection,
        onSortChange: handleHeaderClick,
        selectedDataTypes,
        setSelectedDataTypes,
        resultsCount: safeResults.length,
      }),
    [
      classes,
      getStatusIcon,
      currentCollectionDatasetIds,
      sortMode,
      sortDirection,
      handleHeaderClick,
      selectedDataTypes,
      setSelectedDataTypes,
      safeResults.length,
    ],
  );

  // Build active columns array based on enabled constraints
  const activeColumns = useMemo(() => {
    const columns = [
      'status',
      'name',
      'type',
      'datasetUtilization',
      'spatialCoverage',
    ];

    if (temporalEnabled) {
      columns.push('temporalCoverage');
    }

    if (depthEnabled) {
      columns.push('depthCoverage');
    }

    if (temporalEnabled) {
      columns.push('dateOverlap');
    }

    columns.push('spatialOverlap');

    if (depthEnabled) {
      columns.push('depthOverlap');
    }

    return columns;
  }, [temporalEnabled, depthEnabled]);

  // Determine row class based on dataset state
  const getRowClass = (dataset) => {
    // Datasets already in collection are grayed out
    if (currentCollectionDatasetIds.has(dataset.shortName)) {
      return classes.alreadyPresentRow;
    }
    return classes.tableRow;
  };

  // Calculate selection state
  const selectedDatasetsArray = Array.from(selectedDatasetIds);
  const selectedCount = selectedDatasetIds.size;

  // Calculate selectable datasets (not already in collection)
  const selectableResults = safeResults.filter(
    (dataset) => !currentCollectionDatasetIds.has(dataset.shortName),
  );

  const areAllSelected =
    selectableResults.length > 0 &&
    selectableResults.length === selectedCount &&
    selectedCount > 0;

  const areIndeterminate =
    selectedCount > 0 && selectableResults.length !== selectedCount;

  // Handle select all
  const handleSelectAll = () => {
    selectableResults.forEach((dataset) => {
      if (!selectedDatasetIds.has(dataset.shortName)) {
        onToggleSelection(dataset.shortName);
      }
    });
  };

  // Handle clear all
  const handleClearAll = () => {
    selectedDatasetsArray.forEach((shortName) => {
      onToggleSelection(shortName);
    });
  };

  // Calculate total column count for empty state colspan
  const totalColumnCount = 1 + activeColumns.length + 1; // checkbox + data columns + rows

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {/* Selection checkbox */}
            <TableCell className={classes.checkboxCell}>
              <SelectAllDropdown
                areAllSelected={areAllSelected}
                areIndeterminate={areIndeterminate}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
                disabled={safeResults.length === 0}
              />
            </TableCell>

            {/* Data columns from config */}
            {activeColumns.map((columnKey) => {
              const column = columnConfig[columnKey];
              return (
                <TableCell
                  key={columnKey}
                  className={column.cellClass}
                  align={column.align}
                >
                  {column.header}
                </TableCell>
              );
            })}

            {/* Rows column */}
            <TableCell className={classes.rowsCell} align="right">
              <Box className={classes.rowsHeaderCell}>
                <span>Rows</span>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <RecalculateAllButton
                    results={results}
                    constraints={currentConstraints}
                  />
                  <InfoTooltip
                    title="Row counts show the number of rows in each dataset within your search constraints. Click 'Recalculate' to get accurate counts based on your specific region and time period."
                    fontSize="small"
                  />
                </Box>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeResults.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumnCount} align="center">
                <Box className={classes.emptyState}>
                  <Typography variant="body2" color="textSecondary">
                    {results === null
                      ? 'Enter constraints and click "Find Overlapping Datasets" to search'
                      : isLoading
                        ? 'Searching...'
                        : 'No datasets match the specified constraints'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            sortedResults.map((dataset) => {
              const isSelected = selectedDatasetIds.has(dataset.shortName);
              const isAlreadyPresent = currentCollectionDatasetIds.has(
                dataset.shortName,
              );
              const rowClass = getRowClass(dataset);

              return (
                <TableRow key={dataset.shortName} className={rowClass}>
                  {/* Selection checkbox */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.checkboxCell}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleSelection(dataset.shortName)}
                      color="primary"
                      size="small"
                      disabled={isAlreadyPresent}
                    />
                  </TableCell>

                  {/* Data columns from config */}
                  {activeColumns.map((columnKey) => {
                    const column = columnConfig[columnKey];
                    return (
                      <TableCell
                        key={columnKey}
                        className={`${classes.tableCell} ${column.cellClass}`}
                        align={column.align}
                      >
                        {column.render(dataset)}
                      </TableCell>
                    );
                  })}

                  {/* Rows column with calculated/original/failed/skipped states */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.rowsCell}`}
                    align="right"
                  >
                    <RowCountCell
                      shortName={dataset.shortName}
                      currentConstraints={currentConstraints}
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

SpatialTemporalResultsTable.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      shortName: PropTypes.string.isRequired,
      longName: PropTypes.string,
      type: PropTypes.string,
      rows: PropTypes.number,
      // NOTE: datasetUtilization not included in PropTypes (temporary field)
      overlap: PropTypes.shape({
        spatial: PropTypes.shape({
          coveragePercent: PropTypes.number.isRequired,
          extent: PropTypes.string.isRequired,
        }).isRequired,
        temporal: PropTypes.shape({
          coveragePercent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
          range: PropTypes.string,
          utilization: PropTypes.number, // NEW
        }),
        depth: PropTypes.shape({
          coveragePercent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
          range: PropTypes.string,
          utilization: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.oneOf([null]),
          ]), // NEW
        }),
      }).isRequired,
    }),
  ),
  selectedDatasetIds: PropTypes.instanceOf(Set).isRequired,
  currentCollectionDatasetIds: PropTypes.instanceOf(Set).isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  temporalEnabled: PropTypes.bool.isRequired,
  depthEnabled: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  maxHeight: PropTypes.number,
};

export default SpatialTemporalResultsTable;

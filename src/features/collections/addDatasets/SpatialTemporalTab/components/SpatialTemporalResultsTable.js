import React, { useMemo, useCallback } from 'react';
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
import { CheckCircle as CheckCircleIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { DatasetNameLink } from '../../../../../shared/components';
import SelectAllDropdown from '../../../../multiDatasetDownload/components/SelectAllDropdown';
import { SortableHeader } from '../../../../../shared/sorting';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';
import { useAddDatasetsStore } from '../../state/addDatasetsStore';
import DataTypeFilterDropdown from './DataTypeFilterDropdown';

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
      verticalAlign: 'top',
    },
  },
  table: {
    width: '100%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    '& .MuiTableCell-root:first-child': {
      paddingLeft: '16px',
    },
    '& .MuiTableCell-root:last-child': {
      paddingRight: '16px',
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
  },
  statusIcon: {
    fontSize: '1.25rem',
    verticalAlign: 'middle',
    color: '#8bc34a',
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
  overlapCell: {
    width: '160px',
    fontSize: '0.8rem',
  },
  rowsCell: {
    width: '100px',
    textAlign: 'right',
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
 * 1. Checkbox, Status, Dataset Name, Type
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

  // Get data type filter, sort mode, and sort direction from store
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

  // Handle null results (before first search)
  // SQL filtering now handles all type filtering (1, 2, or 3 types) via IN clause
  const safeResults = results || [];

  // Handle header click to change sort mode
  const handleHeaderClick = useCallback(
    (field) => {
      const newMode =
        field === 'spatialCoverage'
          ? 'spatial'
          : field === 'temporalCoverage'
            ? 'temporal'
            : field === 'depthCoverage'
              ? 'depth'
              : 'default';
      setSortMode(newMode); // This will trigger search() via setSortMode action
    },
    [setSortMode],
  );

  // Use results directly from store (pre-sorted by SQL)
  const sortedResults = safeResults;

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
  const totalColumnCount =
    5 + // Base columns: checkbox, status, name, type, rows
    1 + // Spatial coverage (always shown)
    (temporalEnabled ? 1 : 0) + // Temporal coverage
    (depthEnabled ? 1 : 0) + // Depth coverage
    2 + // Diagnostic: Spatial ratio + Spatial %
    (temporalEnabled ? 2 : 0) + // Diagnostic: Temporal ratio + Temporal %
    (depthEnabled ? 2 : 0) + // Diagnostic: Depth ratio + Depth %
    1 + // Spatial overlap (always shown)
    (temporalEnabled ? 1 : 0) + // Date overlap
    (depthEnabled ? 1 : 0); // Depth overlap

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

            {/* Status column */}
            <TableCell className={classes.statusCell} align="center">
              Status
            </TableCell>

            {/* Dataset Name column - not sortable in SQL mode */}
            <TableCell className={classes.datasetNameCell}>
              Dataset Name
            </TableCell>

            {/* Type column with filter dropdown */}
            <TableCell className={classes.typeCell}>
              <Box display="flex" alignItems="center">
                Type
                <DataTypeFilterDropdown
                  selectedTypes={selectedDataTypes}
                  onSelectionChange={setSelectedDataTypes}
                  disabled={safeResults.length === 0}
                />
              </Box>
            </TableCell>

            {/* === COVERAGE PERCENTAGES GROUP === */}

            {/* Spatial Coverage - sortable */}
            <TableCell className={classes.coverageCell} align="right">
              <SortableHeader
                field="spatialCoverage"
                label="Spatial Coverage"
                isActive={sortMode === 'spatial'}
                direction={sortMode === 'spatial' ? sortDirection : 'desc'}
                uiPattern="headers-only"
                onClick={handleHeaderClick}
                className={classes.clickableHeader}
              />
            </TableCell>

            {/* Temporal Coverage - conditionally visible */}
            {temporalEnabled && (
              <TableCell className={classes.coverageCell} align="right">
                <SortableHeader
                  field="temporalCoverage"
                  label="Temporal Coverage"
                  isActive={sortMode === 'temporal'}
                  direction={sortMode === 'temporal' ? sortDirection : 'desc'}
                  uiPattern="headers-only"
                  onClick={handleHeaderClick}
                  className={classes.clickableHeader}
                />
              </TableCell>
            )}

            {/* Depth Coverage - conditionally visible */}
            {depthEnabled && (
              <TableCell className={classes.coverageCell} align="right">
                <SortableHeader
                  field="depthCoverage"
                  label="Depth Coverage"
                  isActive={sortMode === 'depth'}
                  direction={sortMode === 'depth' ? sortDirection : 'desc'}
                  uiPattern="headers-only"
                  onClick={handleHeaderClick}
                  className={classes.clickableHeader}
                />
              </TableCell>
            )}

            {/* === OVERLAP VALUES GROUP === */}

            {/* Date Overlap - conditionally visible */}
            {temporalEnabled && (
              <TableCell className={classes.overlapCell}>
                Date Overlap
              </TableCell>
            )}

            {/* Spatial Overlap */}
            <TableCell className={classes.overlapCell}>
              Spatial Overlap
            </TableCell>

            {/* Depth Overlap - conditionally visible */}
            {depthEnabled && (
              <TableCell className={classes.overlapCell}>
                Depth Overlap
              </TableCell>
            )}

            {/* Rows column */}
            <TableCell className={classes.rowsCell} align="right">
              Rows
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
            sortedResults.map((dataset, index) => {
              const isSelected = selectedDatasetIds.has(dataset.shortName);
              const isAlreadyPresent = currentCollectionDatasetIds.has(
                dataset.shortName,
              );
              const rowClass = getRowClass(dataset);

              return (
                <TableRow key={index} className={rowClass}>
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

                  {/* Status icon */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.statusCell}`}
                    align="center"
                  >
                    <CheckCircleIcon className={classes.statusIcon} />
                  </TableCell>

                  {/* Dataset Name with description */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.datasetNameCell}`}
                  >
                    <Box>
                      <DatasetNameLink
                        datasetShortName={dataset.shortName}
                        typographyProps={{
                          variant: 'body2',
                          noWrap: true,
                        }}
                      />
                      {dataset.longName && (
                        <Typography className={classes.datasetDescription}>
                          {dataset.longName}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  {/* Type */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.typeCell}`}
                  >
                    {dataset.type || 'N/A'}
                  </TableCell>

                  {/* === COVERAGE PERCENTAGES GROUP === */}

                  {/* Spatial Coverage % */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.coverageCell}`}
                    align="right"
                  >
                    {typeof dataset.overlap.spatial.coveragePercent === 'number'
                      ? `${Math.round(dataset.overlap.spatial.coveragePercent * 100)}%`
                      : dataset.overlap.spatial.coveragePercent}
                  </TableCell>

                  {/* Temporal Coverage % - conditionally visible */}
                  {temporalEnabled && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.coverageCell}`}
                      align="right"
                    >
                      {dataset.overlap.temporal
                        ? typeof dataset.overlap.temporal.coveragePercent ===
                          'number'
                          ? `${Math.round(dataset.overlap.temporal.coveragePercent * 100)}%`
                          : dataset.overlap.temporal.coveragePercent
                        : 'N/A'}
                    </TableCell>
                  )}

                  {/* Depth Coverage % - conditionally visible */}
                  {depthEnabled && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.coverageCell}`}
                      align="right"
                    >
                      {dataset.overlap.depth
                        ? typeof dataset.overlap.depth.coveragePercent ===
                          'number'
                          ? `${Math.round(dataset.overlap.depth.coveragePercent * 100)}%`
                          : dataset.overlap.depth.coveragePercent
                        : 'N/A'}
                    </TableCell>
                  )}

                  {/* === OVERLAP VALUES GROUP === */}

                  {/* Date Overlap - conditionally visible */}
                  {temporalEnabled && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.overlapCell}`}
                    >
                      {dataset.overlap.temporal
                        ? dataset.overlap.temporal.range
                        : 'N/A'}
                    </TableCell>
                  )}

                  {/* Spatial Overlap */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.overlapCell}`}
                  >
                    {dataset.overlap.spatial.extent}
                  </TableCell>

                  {/* Depth Overlap - conditionally visible */}
                  {depthEnabled && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.overlapCell}`}
                    >
                      {dataset.overlap.depth
                        ? dataset.overlap.depth.range
                        : 'N/A'}
                    </TableCell>
                  )}

                  {/* Rows */}
                  <TableCell
                    className={`${classes.tableCell} ${classes.rowsCell}`}
                    align="right"
                  >
                    {typeof dataset.rows === 'number'
                      ? dataset.rows.toLocaleString()
                      : 'N/A'}
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
        }),
        depth: PropTypes.shape({
          coveragePercent: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
          ]),
          range: PropTypes.string,
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

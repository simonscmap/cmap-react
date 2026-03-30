import React, { useEffect, useState, useRef } from 'react';
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
  CircularProgress,
  Typography,
  Checkbox,
} from '@material-ui/core';
import { RemoveCircleOutline as RemoveCircleOutlineIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import {
  DatasetNameLink,
  useRowStateStyles,
  ROW_STATES,
  InfoTooltip,
} from '../../../shared/components';
import { dateToUTCDateString } from '../../../shared/filtering/utils/dateHelpers';
import SelectAllDropdown from '../../multiDatasetDownload/components/SelectAllDropdown';
import UniversalButton from '../../../shared/components/UniversalButton';
import useCollectionsStore from '../state/collectionsStore';

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
      fontSize: '0.875rem',
      position: 'sticky',
      top: 0,
      zIndex: 2,
      padding: '8px 8px',
      border: 0,
      verticalAlign: 'middle',
      lineHeight: 1.2,
    },
    '& .MuiTableCell-body': {
      verticalAlign: 'middle',
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
    transition: 'opacity 300ms ease-out, height 300ms ease-out',
    overflow: 'hidden',
    '&.removing': {
      opacity: 0,
      height: '0px',
      '& td': {
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
        borderBottom: 'none',
      },
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
    minWidth: '150px',
    maxWidth: '350px',
    wordBreak: 'break-word',
  },
  datasetDescription: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: theme.spacing(0.5),
    lineHeight: 1.3,
  },
  regionCell: {
    width: '180px',
  },
  dateRangeCell: {
    width: '140px',
  },
  actionsCell: {
    width: '100px',
    textAlign: 'center',
    paddingRight: '24px !important',
  },
  actionsCellContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
}));

/**
 * CollectionDatasetsTable
 *
 * Shared component that displays datasets in a collection.
 * Can auto-fetch data or accept pre-loaded data.
 * Can be configured for read-only or interactive use cases.
 *
 * @param {number} collectionId - Collection ID for fetching data
 * @param {string[]} datasetShortNames - Array of dataset short names to fetch
 * @param {Array} data - Pre-loaded dataset objects (optional, bypasses auto-fetch)
 * @param {string} emptyMessage - Message to show when no data (optional)
 * @param {string[]} selectedDatasets - Selected dataset short names (optional)
 * @param {function} onToggleSelection - Handler for checkbox toggle (optional)
 * @param {function} onSelectAll - Handler for select all (optional)
 * @param {function} onClearAll - Handler for clear all (optional)
 * @param {boolean} areAllSelected - Whether all datasets are selected (optional)
 * @param {boolean} areIndeterminate - Whether some datasets are selected (optional)
 * @param {Array} actions - Array of action configurations (optional)
 * @param {function} rowClassGetter - Function to get row class based on dataset (optional)
 * @param {string[]} columns - Array of column keys to display (optional)
 * @param {function} onDataLoaded - Callback when data is loaded: (data, totalRows) => void (optional)
 * @param {number} maxHeight - Max height for table container (optional)
 * @param {string} className - Additional CSS class (optional)
 * @param {function} onError - Error callback (optional)
 */
const CollectionDatasetsTable = ({
  collectionId,
  datasetShortNames,
  datasetShortNamesWithStates,
  data: preLoadedData,
  emptyMessage,
  selectedDatasets = [],
  onToggleSelection,
  onSelectAll,
  onClearAll,
  areAllSelected = false,
  areIndeterminate = false,
  actions = [],
  rowClassGetter,
  columns = ['status', 'name', 'type', 'region', 'dateRange'],
  onDataLoaded,
  maxHeight,
  className,
  onError,
  skipViewTracking = false,
}) => {
  const classes = useStyles({ maxHeight });
  const { getRowClassName, getStatusIcon } = useRowStateStyles();

  // Zustand store selectors
  const fetchPreviewData = useCollectionsStore(
    (state) => state.fetchPreviewData,
  );
  const clearPreviewData = useCollectionsStore(
    (state) => state.clearPreviewData,
  );

  // Local state
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingDatasets, setRemovingDatasets] = useState(new Set());
  const [rowHeights, setRowHeights] = useState({});

  // Track previous dataset short names to detect additions vs removals
  const prevShortNamesRef = useRef(null);

  // Track timeout for cleanup
  const removalTimeoutRef = useRef(null);

  // Refs for measuring row heights
  const rowRefs = useRef({});

  // Determine which format we received and extract short names + state map
  const shortNamesInput = datasetShortNamesWithStates || datasetShortNames;
  const rowStateMap = {};

  // If we received the new format, build a map of shortName -> rowState
  let shortNamesForFetch;
  if (datasetShortNamesWithStates) {
    shortNamesForFetch = datasetShortNamesWithStates.map((item) => {
      rowStateMap[item.shortName] = item.rowState;
      return item.shortName;
    });
  } else {
    shortNamesForFetch = datasetShortNames;
  }

  // Stringify datasetShortNames to use as stable dependency
  const datasetShortNamesKey = JSON.stringify(shortNamesForFetch);

  // Helper to calculate total rows from dataset array
  const calculateTotalRows = (datasets) => {
    if (!datasets || datasets.length === 0) return 0;
    return datasets.reduce((sum, dataset) => {
      const rowCount = dataset.rowCount || 0;
      return sum + rowCount;
    }, 0);
  };

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    // If pre-loaded data is provided, use it directly (no fetch)
    if (preLoadedData !== undefined && preLoadedData !== null) {
      setData(preLoadedData);
      setIsLoading(false);

      // Call onDataLoaded callback if provided
      if (preLoadedData.length > 0 && onDataLoaded) {
        onDataLoaded(preLoadedData, calculateTotalRows(preLoadedData));
      }

      return;
    }

    // Auto-fetch mode: fetch data if shortNamesForFetch provided
    if (!shortNamesForFetch || shortNamesForFetch.length === 0) {
      setData([]);
      setIsLoading(false);
      prevShortNamesRef.current = [];
      return;
    }

    // Optimize for removals: detect if this is a removal-only operation
    const prevShortNames = prevShortNamesRef.current;
    if (prevShortNames && prevShortNames.length > 0) {
      const currentSet = new Set(shortNamesForFetch);
      const prevSet = new Set(prevShortNames);

      // Find added and removed datasets
      const addedDatasets = shortNamesForFetch.filter(
        (name) => !prevSet.has(name),
      );
      const removedDatasets = prevShortNames.filter(
        (name) => !currentSet.has(name),
      );

      // If only removals (no additions), filter existing data with animation
      if (addedDatasets.length === 0 && removedDatasets.length > 0) {
        // Clear any existing timeout
        if (removalTimeoutRef.current) {
          clearTimeout(removalTimeoutRef.current);
        }

        // Measure heights of rows being removed
        const heights = {};
        removedDatasets.forEach((shortName) => {
          const rowElement = rowRefs.current[shortName];
          if (rowElement) {
            heights[shortName] = rowElement.offsetHeight;
          }
        });

        // Set explicit heights first
        setRowHeights(heights);

        // Use requestAnimationFrame to ensure heights are applied before animation starts
        requestAnimationFrame(() => {
          // Mark datasets as removing to trigger animation
          setRemovingDatasets(new Set(removedDatasets));

          // Delay actual removal to allow animation to complete
          removalTimeoutRef.current = setTimeout(() => {
            const filteredData = data.filter((dataset) =>
              currentSet.has(dataset.shortName),
            );
            setData(filteredData);
            setRemovingDatasets(new Set());
            setRowHeights({});
            prevShortNamesRef.current = shortNamesForFetch;
            removalTimeoutRef.current = null;

            // Notify parent of updated data
            if (onDataLoaded) {
              onDataLoaded(filteredData, calculateTotalRows(filteredData));
            }
          }, 300); // Match animation duration
        });

        return;
      }

      // If mixed (both additions and removals), fetch only new datasets and merge
      if (addedDatasets.length > 0 && removedDatasets.length > 0) {
        const loadMixedData = async () => {
          setIsLoading(true);
          try {
            // Fetch only the new datasets
            const newPreviewData = await fetchPreviewData(
              addedDatasets,
              collectionId,
              skipViewTracking,
            );

            // Merge: filter existing data + add new data
            const filteredExisting = data.filter((dataset) =>
              currentSet.has(dataset.shortName),
            );
            const mergedData = [...filteredExisting, ...newPreviewData];

            setData(mergedData);
            prevShortNamesRef.current = shortNamesForFetch;

            // Notify parent of loaded data
            if (onDataLoaded) {
              onDataLoaded(mergedData, calculateTotalRows(mergedData));
            }
          } catch (error) {
            console.error('Error loading dataset data:', error);
            if (onError) {
              onError(error.message || 'Failed to load dataset data', 'error');
            }
          } finally {
            setIsLoading(false);
          }
        };

        loadMixedData();
        return;
      }
    }

    // Default behavior: fetch all datasets (for initial load or additions-only)
    const loadData = async () => {
      setIsLoading(true);
      try {
        const previewData = await fetchPreviewData(
          shortNamesForFetch,
          collectionId,
          skipViewTracking,
        );

        setData(previewData);
        prevShortNamesRef.current = shortNamesForFetch;

        // Notify parent of loaded data
        if (onDataLoaded) {
          onDataLoaded(previewData, calculateTotalRows(previewData));
        }
      } catch (error) {
        console.error('Error loading dataset data:', error);
        if (onError) {
          onError(error.message || 'Failed to load dataset data', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Cleanup
    return () => {
      clearPreviewData();
      if (removalTimeoutRef.current) {
        clearTimeout(removalTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preLoadedData, collectionId, datasetShortNamesKey]);

  // Format helpers
  const formatDateRange = (timeStart, timeEnd) => {
    const start = timeStart ? dateToUTCDateString(timeStart) : 'N/A';
    const end = timeEnd ? dateToUTCDateString(timeEnd) : 'N/A';
    return { start: start || 'N/A', end: end || 'N/A' };
  };

  const formatRegions = (regions) => {
    if (!regions || regions.length === 0) {
      return 'N/A';
    }
    return regions.join(', ');
  };

  // Column configuration
  const columnConfig = {
    status: {
      header: 'Status',
      cellClass: classes.statusCell,
      align: 'center',
      render: (dataset, rowState) => {
        return getStatusIcon(rowState || 'normal');
      },
    },
    name: {
      header: 'Dataset Name',
      cellClass: classes.datasetNameCell,
      render: (dataset) => (
        <Box>
          {dataset.isInvalid ? (
            <Typography variant="body2" noWrap>
              {dataset.shortName}
            </Typography>
          ) : (
            <DatasetNameLink
              datasetShortName={dataset.shortName}
              typographyProps={{
                variant: 'body2',
              }}
            />
          )}
          {dataset.isInvalid ? (
            <Typography className={classes.datasetDescription}>
              Dataset no longer available
            </Typography>
          ) : (
            dataset.longName && (
              <Typography className={classes.datasetDescription}>
                {dataset.longName}
              </Typography>
            )
          )}
        </Box>
      ),
    },
    type: {
      header: 'Type',
      cellClass: '',
      render: (dataset) =>
        dataset.isInvalid ? 'Legacy' : dataset.type || 'N/A',
    },
    region: {
      header: 'Region',
      cellClass: classes.regionCell,
      render: (dataset) =>
        dataset.isInvalid ? 'N/A' : formatRegions(dataset.regions),
    },
    dateRange: {
      header: 'Date Range',
      cellClass: classes.dateRangeCell,
      render: (dataset) => {
        if (dataset.isInvalid) {
          return <>N/A</>;
        }
        if (
          dataset.temporalResolution &&
          dataset.temporalResolution.toLowerCase().indexOf('climatology') !== -1
        ) {
          return <>Monthly<br />Climatology</>;
        }
        const dateRange = formatDateRange(dataset.timeStart, dataset.timeEnd);
        return (
          <>
            {dateRange.start} to
            <br />
            {dateRange.end}
          </>
        );
      },
    },
    // rows: {
    //   header: 'Dataset Total Rows',
    //   cellClass: '',
    //   align: 'right',
    //   render: (dataset) =>
    //     dataset.isInvalid ? 'N/A' : (dataset.rowCount || 0).toLocaleString(),
    // },
  };

  // Determine if we should show selection
  const hasSelection =
    onToggleSelection && onSelectAll && onClearAll !== undefined;

  // Determine if we should show actions
  const hasActions = actions && actions.length > 0;

  // Calculate total column count for colSpan in empty state
  const totalColumnCount =
    columns.length + (hasSelection ? 1 : 0) + (hasActions ? 1 : 0);

  return (
    <TableContainer
      component={Paper}
      className={`${classes.tableContainer} ${className || ''}`}
    >
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            {/* Selection column */}
            {hasSelection && (
              <TableCell className={classes.checkboxCell}>
                <SelectAllDropdown
                  areAllSelected={areAllSelected}
                  areIndeterminate={areIndeterminate}
                  onSelectAll={onSelectAll}
                  onClearAll={onClearAll}
                  disabled={data.length === 0}
                />
              </TableCell>
            )}

            {/* Data columns */}
            {columns.map((columnKey) => {
              const column = columnConfig[columnKey];
              if (!column) return null;
              return (
                <TableCell
                  key={columnKey}
                  align={column.align}
                  className={column.cellClass}
                >
                  {column.tooltip ? (
                    <Box display="flex" alignItems="center">
                      {column.header}
                      <InfoTooltip title={column.tooltip} fontSize="small" />
                    </Box>
                  ) : (
                    column.header
                  )}
                </TableCell>
              );
            })}

            {/* Actions column */}
            {hasActions && (
              <TableCell className={classes.actionsCell}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={totalColumnCount} align="center">
                <Box className={classes.loadingContainer}>
                  <CircularProgress />
                </Box>
              </TableCell>
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumnCount} align="center">
                <Box className={classes.emptyState}>
                  <Typography variant="body2" color="textSecondary">
                    {emptyMessage != null ? emptyMessage : ''}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((dataset, index) => {
              const isSelected = selectedDatasets.includes(dataset.shortName);

              // Determine row state - use pre-calculated state from rowStateMap if available,
              // otherwise fall back to rowClassGetter (legacy), or dataset.isInvalid
              let rowState = 'normal';
              let isAlreadyPresent = false;

              if (rowStateMap[dataset.shortName]) {
                // NEW: Use pre-calculated row state from parent
                rowState = rowStateMap[dataset.shortName];
              } else if (rowClassGetter) {
                // LEGACY: Support old rowClassGetter pattern for backward compatibility
                const customClass = rowClassGetter(dataset);
                if (
                  customClass &&
                  customClass.includes &&
                  customClass.includes('markedForRemoval')
                ) {
                  rowState = 'markedForRemoval';
                } else if (customClass === 'invalidRow' || dataset.isInvalid) {
                  rowState = 'invalid';
                } else if (
                  customClass &&
                  customClass.includes &&
                  customClass.includes('newlyAdded')
                ) {
                  rowState = 'newlyAdded';
                } else if (customClass === 'alreadyPresentRow') {
                  rowState = 'alreadyPresent';
                }
              } else if (dataset.isInvalid) {
                rowState = 'invalid';
              }

              // Set flag for checkbox disabling
              if (rowState === 'alreadyPresent') {
                isAlreadyPresent = true;
              }

              // Get row class from shared hook
              const rowClass = getRowClassName(rowState);

              // Check if this row is being removed (for animation)
              const isRemoving = removingDatasets.has(dataset.shortName);
              const removingClass = isRemoving ? 'removing' : '';

              // Get explicit height if set (for smooth animation)
              const explicitHeight = rowHeights[dataset.shortName];
              const rowStyle = explicitHeight
                ? { height: `${explicitHeight}px` }
                : {};

              return (
                <TableRow
                  key={dataset.shortName}
                  ref={(el) => {
                    if (el) {
                      rowRefs.current[dataset.shortName] = el;
                    }
                  }}
                  className={`${classes.tableRow} ${rowClass} ${removingClass}`}
                  style={rowStyle}
                >
                  {/* Selection checkbox */}
                  {hasSelection && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.checkboxCell}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelection(dataset.shortName)}
                        color="primary"
                        size="small"
                        disabled={dataset.isInvalid || isAlreadyPresent}
                      />
                    </TableCell>
                  )}

                  {/* Data cells */}
                  {columns.map((columnKey) => {
                    const column = columnConfig[columnKey];
                    if (!column) return null;
                    return (
                      <TableCell
                        key={columnKey}
                        className={`${classes.tableCell} ${column.cellClass}`}
                        align={column.align}
                      >
                        {column.render(dataset, rowState)}
                      </TableCell>
                    );
                  })}

                  {/* Actions cell */}
                  {hasActions && (
                    <TableCell
                      className={`${classes.tableCell} ${classes.actionsCell}`}
                    >
                      <div className={classes.actionsCellContent}>
                        {actions.map((action, actionIndex) => {
                          // Check if action should be shown based on condition
                          if (action.condition && !action.condition(dataset)) {
                            return null;
                          }

                          return (
                            <UniversalButton
                              key={actionIndex}
                              onClick={() => action.onClick(dataset)}
                              variant={action.variant || 'secondary'}
                              size="small"
                            >
                              {action.label}
                            </UniversalButton>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CollectionDatasetsTable.propTypes = {
  collectionId: PropTypes.number,
  datasetShortNames: PropTypes.arrayOf(PropTypes.string), // Optional since datasetShortNamesWithStates can be used instead
  datasetShortNamesWithStates: PropTypes.arrayOf(
    PropTypes.shape({
      shortName: PropTypes.string.isRequired,
      rowState: PropTypes.string,
    }),
  ),
  data: PropTypes.array,
  emptyMessage: PropTypes.string,
  selectedDatasets: PropTypes.arrayOf(PropTypes.string),
  onToggleSelection: PropTypes.func,
  onSelectAll: PropTypes.func,
  onClearAll: PropTypes.func,
  areAllSelected: PropTypes.bool,
  areIndeterminate: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      condition: PropTypes.func,
    }),
  ),
  rowClassGetter: PropTypes.func,
  columns: PropTypes.arrayOf(
    PropTypes.oneOf(['status', 'name', 'type', 'region', 'dateRange', 'rows']),
  ),
  onDataLoaded: PropTypes.func,
  maxHeight: PropTypes.number,
  className: PropTypes.string,
  onError: PropTypes.func,
  skipViewTracking: PropTypes.bool,
};

export default CollectionDatasetsTable;

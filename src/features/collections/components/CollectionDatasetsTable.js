import React, { useEffect, useState } from 'react';
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
import { makeStyles } from '@material-ui/core/styles';
import { format, parseISO } from 'date-fns';
import { DatasetNameLink } from '../../../shared/components';
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
      padding: '8px 5px',
      border: 0,
      '&:first-child': {
        padding: '8px 5px 8px 16px',
      },
    },
  },
  table: {
    width: '100%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    '&:first-child': {
      paddingLeft: '16px',
    },
    '&:last-child': {
      paddingRight: '16px',
    },
  },
  checkboxCell: {
    width: '50px',
  },
  datasetNameCell: {
    minWidth: '200px',
    maxWidth: '350px',
  },
  regionCell: {
    width: '180px',
  },
  dateRangeCell: {
    width: '140px',
    lineHeight: 1.3,
  },
  rowsCell: {
    width: '80px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
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
 * Shared, self-contained component that displays datasets in a collection.
 * Fetches its own data and manages loading states.
 * Can be configured for read-only or interactive use cases.
 *
 * @param {number} collectionId - Collection ID for fetching data
 * @param {string[]} datasetShortNames - Array of dataset short names to fetch
 * @param {string[]} selectedDatasets - Selected dataset short names (optional)
 * @param {function} onToggleSelection - Handler for checkbox toggle (optional)
 * @param {function} onSelectAll - Handler for select all (optional)
 * @param {function} onClearAll - Handler for clear all (optional)
 * @param {boolean} areAllSelected - Whether all datasets are selected (optional)
 * @param {boolean} areIndeterminate - Whether some datasets are selected (optional)
 * @param {Array} actions - Array of action configurations (optional)
 * @param {function} rowClassGetter - Function to get row class based on dataset (optional)
 * @param {string[]} columns - Array of column keys to display (optional)
 * @param {function} onDataLoaded - Callback when data is loaded (optional)
 * @param {number} maxHeight - Max height for table container (optional)
 * @param {string} className - Additional CSS class (optional)
 * @param {function} onError - Error callback (optional)
 */
const CollectionDatasetsTable = ({
  collectionId,
  datasetShortNames,
  selectedDatasets = [],
  onToggleSelection,
  onSelectAll,
  onClearAll,
  areAllSelected = false,
  areIndeterminate = false,
  actions = [],
  rowClassGetter,
  columns = ['name', 'type', 'region', 'dateRange', 'rows'],
  onDataLoaded,
  maxHeight,
  className,
  onError,
}) => {
  const classes = useStyles({ maxHeight });

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

  // Stringify datasetShortNames to use as stable dependency
  const datasetShortNamesKey = JSON.stringify(datasetShortNames);

  // Fetch data when component mounts or dependencies change
  useEffect(() => {
    if (!datasetShortNames || datasetShortNames.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: previewData, missingDatasets } = await fetchPreviewData(
          datasetShortNames,
          collectionId,
        );

        setData(previewData);

        // Calculate total rows
        const totalRows = previewData.reduce((sum, dataset) => {
          return sum + (dataset.rowCount || 0);
        }, 0);

        // Notify parent of loaded data
        if (onDataLoaded) {
          onDataLoaded(previewData, totalRows);
        }

        // Notify parent of missing datasets
        if (missingDatasets.length > 0 && onError) {
          onError(
            `The following datasets did not return data or are unavailable: ${missingDatasets.join(', ')}`,
            'warning',
          );
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, datasetShortNamesKey]);

  // Format helpers
  const formatDateRange = (timeStart, timeEnd) => {
    try {
      const start = timeStart
        ? format(parseISO(timeStart), 'yyyy-MM-dd')
        : 'N/A';
      const end = timeEnd ? format(parseISO(timeEnd), 'yyyy-MM-dd') : 'N/A';
      return { start, end };
    } catch (error) {
      return { start: 'N/A', end: 'N/A' };
    }
  };

  const formatRegions = (regions) => {
    if (!regions || regions.length === 0) {
      return 'N/A';
    }
    return regions.join(', ');
  };

  // Column configuration
  const columnConfig = {
    name: {
      header: 'Dataset Name',
      cellClass: classes.datasetNameCell,
      render: (dataset) => (
        <DatasetNameLink
          datasetShortName={dataset.shortName}
          typographyProps={{
            variant: 'body2',
            noWrap: true,
          }}
        />
      ),
    },
    type: {
      header: 'Type',
      cellClass: '',
      render: (dataset) => dataset.type || 'N/A',
    },
    region: {
      header: 'Region',
      cellClass: classes.regionCell,
      render: (dataset) => formatRegions(dataset.regions),
    },
    dateRange: {
      header: 'Date Range',
      cellClass: classes.dateRangeCell,
      render: (dataset) => {
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
    rows: {
      header: 'Rows',
      cellClass: classes.rowsCell,
      align: 'right',
      render: (dataset) => dataset.rowCount?.toLocaleString() ?? 'N/A',
    },
  };

  // Determine if we should show selection
  const hasSelection =
    onToggleSelection && onSelectAll && onClearAll !== undefined;

  // Determine if we should show actions
  const hasActions = actions && actions.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Paper className={classes.emptyState}>
        <Typography variant="body2" color="textSecondary">
          No dataset data available
        </Typography>
      </Paper>
    );
  }

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
                  {column.header}
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
          {data.map((dataset, index) => {
            const isSelected = selectedDatasets.includes(dataset.shortName);
            const rowClass = rowClassGetter
              ? rowClassGetter(dataset)
              : classes.tableRow;

            return (
              <TableRow key={index} className={rowClass}>
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
                      {column.render(dataset)}
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
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CollectionDatasetsTable.propTypes = {
  collectionId: PropTypes.number,
  datasetShortNames: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    PropTypes.oneOf(['name', 'type', 'region', 'dateRange', 'rows']),
  ),
  onDataLoaded: PropTypes.func,
  maxHeight: PropTypes.number,
  className: PropTypes.string,
  onError: PropTypes.func,
};

export default CollectionDatasetsTable;

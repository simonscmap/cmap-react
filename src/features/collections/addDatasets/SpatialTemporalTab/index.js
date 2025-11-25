/**
 * SpatialTemporalTab - Main container for spatial-temporal overlap dataset search
 *
 * This component orchestrates the spatial-temporal overlap search feature by:
 * - Initializing catalog search on mount
 * - Rendering all constraint input components (spatial, temporal, depth, overlap mode)
 * - Managing search execution and state
 * - Displaying results in SpatialTemporalResultsTable
 * - Integrating with addDatasetsStore for dataset selection
 *
 * @module SpatialTemporalTab
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Collapse,
  IconButton,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useSpatialTemporalSearchStore from './store/spatialTemporalSearchStore';
import SpatialBoundsInput from './components/SpatialBoundsInput';
import TemporalConstraintsInput from './components/TemporalConstraintsInput';
import DepthConstraintsInput from './components/DepthConstraintsInput';
import OverlapModeCheckbox from './components/OverlapModeCheckbox';
import SpatialTemporalResultsTable from './components/SpatialTemporalResultsTable';
import ConstraintsSummary from './components/ConstraintsSummary';
import UniversalButton from '../../../../shared/components/UniversalButton';
import DiagnosticQuery from './DiagnosticQuery';
import { snackbarOpen } from '../../../../Redux/actions/ui';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  constraintsWrapper: {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: theme.spacing(0.5),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  constraintsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
  constraintsHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
  },
  constraintsTitle: {
    fontWeight: 500,
    fontSize: '0.95rem',
  },
  expandIcon: {
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandIconRotated: {
    transform: 'rotate(180deg)',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  mainConstraintsRow: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'flex-start',
    [theme.breakpoints.down(960)]: {
      flexDirection: 'column',
    },
  },
  spatialSection: {
    flex: '1 1 400px',
    minWidth: '400px',
    [theme.breakpoints.down(960)]: {
      flex: '1 1 auto',
      minWidth: 'unset',
    },
  },
  temporalDepthColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    flex: '1 1 400px',
    minWidth: '400px',
    [theme.breakpoints.down(960)]: {
      flex: '1 1 auto',
      minWidth: 'unset',
    },
  },
  searchButtonRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(2),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchButtonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  errorMessage: {
    padding: theme.spacing(2),
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: '4px',
    color: theme.palette.error.main,
    textAlign: 'center',
  },
  initErrorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
  },
  searchButton: {
    minWidth: '242px', // Fixed width to accommodate "Find Overlapping Datasets" and spinner
    '& .MuiButton-label': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  rowCountButton: {
    minWidth: '180px',
  },
  warningMessage: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    maxWidth: '400px',
  },
  rowCountSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  rowCountButtonRow: {
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    flexWrap: 'wrap',
  },
}));

/**
 * SpatialTemporalTab Component
 *
 * Main container for the spatial-temporal overlap search feature within AddDatasetsModal.
 * Connects all input components to the spatialTemporalSearchStore and manages search workflow.
 *
 * @param {Object} props
 * @param {Set<string>} props.selectedDatasetIds - Currently selected dataset short names (from addDatasetsStore)
 * @param {Set<string>} props.currentCollectionDatasetIds - Datasets already in target collection (for de-duplication)
 * @param {Function} props.onToggleSelection - Callback when user toggles dataset selection checkbox
 * @param {Function} props.onResultsChange - Optional callback when results count changes
 * @param {Function} props.onConstraintsChange - Optional callback when constraint states change (temporalEnabled, depthEnabled)
 * @returns {JSX.Element}
 */
const SpatialTemporalTab = ({
  selectedDatasetIds = new Set(),
  currentCollectionDatasetIds = new Set(),
  onToggleSelection,
  onResultsChange,
  onConstraintsChange,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Connect to spatialTemporalSearchStore
  const {
    initialize,
    search,
    isInitialized,
    isInitializing,
    initError,
    canSearch,
    isSearching,
    results,
    searchError,
    temporalEnabled,
    depthEnabled,
    getResultCount,
    selectedDataTypes,
    isConstraintsExpanded,
    toggleConstraintsExpanded,
  } = useSpatialTemporalSearchStore();

  // Track previous constraint values to avoid unnecessary callbacks
  const prevConstraintsRef = useRef({
    temporalEnabled: false,
    depthEnabled: false,
  });

  // Calculate "already in collection" count (before any early returns)
  // Apply data type filtering to match what's shown in the results table
  const alreadyInCollectionCount = React.useMemo(() => {
    if (!results || results.length === 0) return 0;

    return results.filter((dataset) => {
      // Must be in current collection
      const isInCollection = currentCollectionDatasetIds.has(dataset.shortName);

      // Must match selected data types (if any types are selected)
      const datasetType = dataset.type || 'N/A';
      const matchesDataType =
        selectedDataTypes.size === 0 || selectedDataTypes.has(datasetType);

      return isInCollection && matchesDataType;
    }).length;
  }, [results, currentCollectionDatasetIds, selectedDataTypes]);

  // Check if results contain satellite or model datasets
  const hasSatelliteOrModelDatasets = React.useMemo(() => {
    if (!results || results.length === 0) return false;

    return results.some(
      (dataset) => dataset.type === 'Satellite' || dataset.type === 'Model',
    );
  }, [results]);

  // Initialize catalog search on mount
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [initialize, isInitialized, isInitializing]);

  // Show error snackbar when search fails
  useEffect(() => {
    if (searchError) {
      dispatch(
        snackbarOpen({
          message: `Search failed: ${searchError}. Please try again.`,
          severity: 'error',
        }),
      );
    }
  }, [searchError, dispatch]);

  // Notify parent component when results count changes
  useEffect(() => {
    if (onResultsChange) {
      const count = getResultCount();
      onResultsChange(count);
    }
  }, [results, onResultsChange, getResultCount]);

  // Notify parent component when constraint states change (only when values actually change)
  useEffect(() => {
    if (onConstraintsChange) {
      const prev = prevConstraintsRef.current;
      if (
        prev.temporalEnabled !== temporalEnabled ||
        prev.depthEnabled !== depthEnabled
      ) {
        prevConstraintsRef.current = { temporalEnabled, depthEnabled };
        onConstraintsChange({ temporalEnabled, depthEnabled });
      }
    }
  }, [temporalEnabled, depthEnabled, onConstraintsChange]);

  /**
   * Handle search button click
   * Validates constraints and executes search
   */
  const handleSearch = () => {
    if (canSearch()) {
      search();
    }
  };

  // Show initialization loading state
  if (isInitializing) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
        <Typography>Initializing catalog search...</Typography>
      </Box>
    );
  }

  // Show initialization error state
  if (initError) {
    return (
      <Box className={classes.initErrorContainer}>
        <Typography className={classes.errorMessage}>{initError}</Typography>
        <UniversalButton variant="primary" onClick={initialize}>
          Retry Initialization
        </UniversalButton>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      {/* Diagnostic Component - Temporary for investigation */}
      {/* <DiagnosticQuery /> */}

      {/* Collapsible Constraints Section */}
      <Box className={classes.constraintsWrapper}>
        {/* Collapsible Header */}
        <Box
          className={classes.constraintsHeader}
          onClick={toggleConstraintsExpanded}
        >
          <Box className={classes.constraintsHeaderLeft}>
            <Typography className={classes.constraintsTitle}>
              Search Constraints
            </Typography>
            {!isConstraintsExpanded && <ConstraintsSummary />}
          </Box>
          <IconButton size="small" aria-label="toggle constraints">
            <ExpandMoreIcon
              className={`${classes.expandIcon} ${isConstraintsExpanded ? classes.expandIconRotated : ''}`}
            />
          </IconButton>
        </Box>

        {/* Collapsible Input Section */}
        <Collapse in={isConstraintsExpanded} timeout="auto">
          <Box className={classes.inputSection}>
            {/* Main Constraints Row: Spatial on left, Temporal+Depth on right */}
            <Box className={classes.mainConstraintsRow}>
              {/* Spatial Bounds Section */}
              <Box className={classes.spatialSection}>
                <SpatialBoundsInput />
              </Box>

              {/* Temporal and Depth Column */}
              <Box className={classes.temporalDepthColumn}>
                <TemporalConstraintsInput />
                <DepthConstraintsInput />
              </Box>
            </Box>

            {/* Search Button Row */}
            <Box className={classes.searchButtonRow}>
              <Box className={classes.searchButtonGroup}>
                <UniversalButton
                  variant="primary"
                  size="large"
                  onClick={handleSearch}
                  disabled={!canSearch() || isSearching}
                  className={classes.searchButton}
                  startIcon={
                    isSearching ? (
                      <CircularProgress
                        size={16}
                        style={{ color: 'inherit' }}
                      />
                    ) : null
                  }
                >
                  {isSearching ? 'Searching...' : 'Find Overlapping Datasets'}
                </UniversalButton>
                <OverlapModeCheckbox />
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Search Error Display */}
      {searchError && (
        <Typography className={classes.errorMessage}>{searchError}</Typography>
      )}

      {/* Results Section - Always shown, matching FromCollectionsTab and CatalogSearchTab pattern */}
      <Box className={classes.resultsSection}>
        {/* Results Table - Always shown, handles empty/loading states internally */}
        <SpatialTemporalResultsTable
          results={results && results.length > 0 ? results : null}
          selectedDatasetIds={selectedDatasetIds}
          currentCollectionDatasetIds={currentCollectionDatasetIds}
          onToggleSelection={onToggleSelection}
          temporalEnabled={temporalEnabled}
          depthEnabled={depthEnabled}
          isLoading={isSearching}
          maxHeight={isConstraintsExpanded ? 400 : 700}
        />
      </Box>
    </Box>
  );
};

SpatialTemporalTab.propTypes = {
  selectedDatasetIds: PropTypes.instanceOf(Set),
  currentCollectionDatasetIds: PropTypes.instanceOf(Set),
  onToggleSelection: PropTypes.func.isRequired,
  onResultsChange: PropTypes.func,
  onConstraintsChange: PropTypes.func,
};

export default SpatialTemporalTab;

/**
 * CatalogSearchSection - Reusable catalog search with filters and results table
 *
 * Integrated into AddDatasetsModal Tab 1 ("Catalog Filtering")
 *
 * Props:
 * - selectedDatasetIds: Set<string> - Currently selected dataset short names (for checkbox state)
 * - currentCollectionDatasetIds: Set<string> - Datasets already in target collection (for de-duplication highlighting)
 * - onToggleSelection: (shortName: string) => void - Callback when user toggles dataset selection
 * - onSelectionChange: (datasets: Dataset[]) => void - Optional callback with full selected dataset objects
 * - onResultsChange: (count: number) => void - Optional callback when results count changes
 * - maxHeight: number - Optional max height for results table (default: 400)
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  InputAdornment,
  Checkbox,
  ListItemText,
} from '@material-ui/core';
import { Search } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useCatalogSearchStore from '../../../catalogSearch/state/catalogSearchStore';
import DatasetsTableSection from '../components/DatasetsTableSection';
import UniversalButton from '../../../../shared/components/UniversalButton';
import SingleStatistic from '../../components/SingleStatistic';
import DateInput from '../../../../shared/components/DateInput';
import zIndex from '../../../../enums/zIndex';

const useStyles = makeStyles((theme) => ({
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignItems: 'center',
  },
  searchRow: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    alignItems: 'flex-start',
  },
  searchField: {
    flex: 1,
  },
  filterControl: {
    maxWidth: 180,
    minWidth: 140,
  },
  dateInputGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    flexShrink: 0,
  },
  statisticsWrapper: {
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
}));

const CatalogSearchSection = ({
  selectedDatasetIds = new Set(),
  currentCollectionDatasetIds = new Set(),
  onToggleSelection,
  onSelectionChange,
  onResultsChange,
  maxHeight = 400,
}) => {
  const classes = useStyles();

  const {
    initialize,
    setSearchText,
    setSelectedDataTypes,
    setRegion,
    setDateRangePreset,
    setCustomDateRange,
    search,
    results,
    isInitialized,
    isInitializing,
    isSearching,
    searchQuery,
    selectedDataTypes,
    regions,
    isLoadingRegions,
  } = useCatalogSearchStore();

  const [inputText, setInputText] = useState('');

  // Define available data types
  const dataTypes = ['Model', 'Satellite', 'In-Situ'];

  // Calculate "already in collection" count
  const alreadyInCollectionCount = React.useMemo(() => {
    if (results.length === 0) return 0;
    return results.filter((dataset) =>
      currentCollectionDatasetIds.has(dataset.shortName),
    ).length;
  }, [results, currentCollectionDatasetIds]);

  // Sync local input text with store when store is reset
  useEffect(() => {
    setInputText(searchQuery.text);
  }, [searchQuery.text]);

  // Notify parent of results count changes
  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(results.length);
    }
  }, [results.length, onResultsChange]);

  // Build regions list with "All Regions" as first option, excluding "unknown"
  const regionOptions = React.useMemo(() => {
    const filteredRegions = regions.filter(
      (r) => r.toLowerCase() !== 'unknown',
    );
    return ['All Regions', ...filteredRegions];
  }, [regions]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSearch = () => {
    setSearchText(inputText);
    search();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDatasetTypeChange = (e) => {
    const value = e.target.value;
    const newSelection = new Set(value);
    setSelectedDataTypes(newSelection);
    handleSearch();
  };

  // Calculate display label for data type dropdown
  const getDataTypeLabel = () => {
    if (selectedDataTypes.size === 0) {
      return '-';
    }
    if (selectedDataTypes.size === dataTypes.length) {
      return 'All Types';
    }
    return Array.from(selectedDataTypes).join(', ');
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    handleSearch();
  };

  const handleDateRangeChange = (e) => {
    setDateRangePreset(e.target.value);
    handleSearch();
  };

  // Convert Date object to YYYY-MM-DD string
  const dateToString = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD string to Date object
  const stringToDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleCustomDateChange = (field, dateValue) => {
    const dateString = dateToString(dateValue);
    if (field === 'start') {
      setCustomDateRange(dateString, searchQuery.customDateEnd);
    } else {
      setCustomDateRange(searchQuery.customDateStart, dateString);
    }
    // Auto-search when both dates are set
    if (
      (field === 'start' && dateString && searchQuery.customDateEnd) ||
      (field === 'end' && dateString && searchQuery.customDateStart)
    ) {
      setTimeout(() => handleSearch(), 100);
    }
  };

  if (isInitializing) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
        <Typography style={{ marginLeft: 16 }}>
          Initializing catalog search...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Keyword Search */}
      <Box className={classes.searchRow}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search datasets by name, keywords, or description..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!isInitialized}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
        <UniversalButton
          variant="primary"
          size="large"
          onClick={handleSearch}
          disabled={!isInitialized}
        >
          SEARCH
        </UniversalButton>
      </Box>

      {/* Filter Dropdowns */}
      <Box className={classes.filterRow}>
        <FormControl
          variant="outlined"
          className={classes.filterControl}
          disabled={!isInitialized}
        >
          <InputLabel>Data Type</InputLabel>
          <Select
            multiple
            value={Array.from(selectedDataTypes)}
            onChange={handleDatasetTypeChange}
            label="Data Type"
            renderValue={getDataTypeLabel}
            MenuProps={{
              style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
            }}
          >
            {dataTypes.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox
                  checked={selectedDataTypes.has(type)}
                  color="primary"
                  size="small"
                />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          className={classes.filterControl}
          disabled={!isInitialized}
        >
          <InputLabel>Region</InputLabel>
          <Select
            value={searchQuery.region}
            onChange={handleRegionChange}
            label="Region"
            disabled={isLoadingRegions}
            MenuProps={{
              style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
            }}
          >
            {regionOptions.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          className={classes.filterControl}
          disabled={!isInitialized}
        >
          <InputLabel>Date Range</InputLabel>
          <Select
            value={searchQuery.dateRangePreset}
            onChange={handleDateRangeChange}
            label="Date Range"
            MenuProps={{
              style: { zIndex: zIndex.MODAL_LAYER_2_POPPER },
            }}
          >
            <MenuItem value="Any Date">Any Date</MenuItem>
            <MenuItem value="Last Year">Last Year</MenuItem>
            <MenuItem value="Last 5 Years">Last 5 Years</MenuItem>
            <MenuItem value="Custom Range">Custom Range</MenuItem>
          </Select>
        </FormControl>

        {/* Custom Date Pickers - shown inline when Custom Range is selected */}
        {searchQuery.dateRangePreset === 'Custom Range' && (
          <Box className={classes.dateInputGroup}>
            <DateInput
              label="Start Date"
              value={stringToDate(searchQuery.customDateStart)}
              onChange={(date) => handleCustomDateChange('start', date)}
              width={140}
            />
            <DateInput
              label="End Date"
              value={stringToDate(searchQuery.customDateEnd)}
              onChange={(date) => handleCustomDateChange('end', date)}
              width={140}
            />
          </Box>
        )}
      </Box>

      {/* Statistics - Show when there are results */}
      {results.length > 0 && alreadyInCollectionCount > 0 && (
        <Box className={classes.statisticsWrapper}>
          <SingleStatistic
            value={alreadyInCollectionCount}
            label="Already in Collection"
            borderColor="rgba(128, 128, 128, 0.6)"
            compact
            maxWidth="280px"
            noEllipsis
          />
        </Box>
      )}

      {/* Results Table - Always shown, matching FromCollectionsTab pattern */}
      <DatasetsTableSection
        datasets={results.length > 0 ? results : null}
        selectedDatasetIds={selectedDatasetIds}
        currentCollectionDatasetIds={currentCollectionDatasetIds}
        onToggleSelection={onToggleSelection}
        isLoading={isSearching}
      />
    </Box>
  );
};

export default CatalogSearchSection;

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Search, Clear } from '@material-ui/icons';
import {
  setSearchQuery,
  setSearchResults,
  setSearchActive,
  clearSearch,
  setFuzzySearchEnabled,
} from '../../state/actions';
import {
  selectCurrentFolderSearchState,
  selectCurrentTab,
  selectMainFolder,
  selectSearchableFiles,
  selectFuzzySearchEnabled,
} from '../../state/selectors';
import {
  createSearchInstance,
  performSearch,
  SearchPerformanceMonitor,
} from '../../utils/searchUtils';
import {
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_DELAY,
} from '../../constants/searchConstants';
import InfoTooltip from '../../../../shared/components/InfoTooltip';

const useStyles = makeStyles((theme) => ({
  resultCount: {
    minHeight: '24px', // Reserve space to prevent layout shift
    marginBottom: 8,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

const SearchInput = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const currentTabFromSelector = useSelector(selectCurrentTab);
  const mainFolder = useSelector(selectMainFolder);
  const currentTab = currentTabFromSelector || mainFolder || 'rep';
  const searchState = useSelector(selectCurrentFolderSearchState);
  const searchableFiles = useSelector((state) =>
    selectSearchableFiles(state, currentTab),
  );
  const useFuzzySearch = useSelector((state) =>
    selectFuzzySearchEnabled(state, currentTab),
  );

  // Local input state for immediate UI response
  const [inputValue, setInputValue] = useState(searchState.query || '');

  // Refs for managing debounced search
  const debounceTimeoutRef = useRef(null);
  const searchInstanceRef = useRef(null);
  const performanceMonitorRef = useRef(new SearchPerformanceMonitor());

  // Update search instance when files or config type changes
  useEffect(() => {
    if (searchableFiles && searchableFiles.length > 0) {
      const configType = useFuzzySearch ? 'fuzzy' : 'default';
      searchInstanceRef.current = createSearchInstance(
        searchableFiles,
        configType,
      );
    }
  }, [searchableFiles, useFuzzySearch]);

  // Sync local input state with Redux when search state changes externally
  useEffect(() => {
    setInputValue(searchState.query || '');
  }, [searchState.query]);

  // Handle input change with immediate UI update
  const handleInputChange = useCallback(
    (event) => {
      const value = event.target.value;

      // Immediate state update for UI responsiveness
      setInputValue(value);

      // Clear any pending debounced search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Update Redux search query immediately for state consistency
      dispatch(setSearchQuery(value, currentTab));

      // Handle search logic asynchronously
      Promise.resolve().then(() => {
        if (value.length === 0) {
          // Clear search immediately when input is empty
          dispatch(clearSearch(currentTab));
          dispatch(setSearchActive(false, currentTab));
          return;
        }

        if (value.length < MIN_SEARCH_LENGTH) {
          // Deactivate search but don't clear query
          dispatch(setSearchActive(false, currentTab));
          return;
        }

        // Activate search and schedule debounced execution
        dispatch(setSearchActive(true, currentTab));

        debounceTimeoutRef.current = setTimeout(() => {
          if (searchInstanceRef.current) {
            const searchResult = performSearch(
              searchInstanceRef.current,
              value,
              performanceMonitorRef.current,
            );

            dispatch(
              setSearchResults(
                searchResult.results,
                searchResult.matches,
                searchResult.performance
                  ? searchResult.performance.duration
                  : 0,
                currentTab,
              ),
            );
          }
        }, SEARCH_DEBOUNCE_DELAY);
      });
    },
    [dispatch, currentTab],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    setInputValue('');
    dispatch(clearSearch(currentTab));
    dispatch(setSearchActive(false, currentTab));

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [dispatch, currentTab]);

  // Handle fuzzy search toggle
  const handleFuzzySearchToggle = useCallback(
    (event) => {
      const enabled = event.target.checked;
      dispatch(setFuzzySearchEnabled(enabled, currentTab));
    },
    [dispatch, currentTab],
  );

  // Simple placeholder instructions
  const placeholderText =
    'Type part of a filename to filter. Use * for wildcard.';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Calculate search result count
  const resultCount = searchState.isActive
    ? searchState.filteredFiles.length
    : 0;
  const totalFiles = searchableFiles ? searchableFiles.length : 0;

  return (
    <Box>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholderText}
        style={{ marginBottom: 8 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {inputValue && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  aria-label="Clear filter"
                  edge="end"
                >
                  <Clear />
                </IconButton>
              )}
              {/* <Tooltip title={tooltipContent} placement="top-end">
                <IconButton size="small" edge="end" aria-label="Search help">
                  <Info color="action" />
                </IconButton>
              </Tooltip> */}
            </InputAdornment>
          ),
        }}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography className={classes.resultCount}>
          {searchState.isActive && inputValue.length >= MIN_SEARCH_LENGTH ? (
            <>
              {resultCount} {resultCount === 1 ? 'file' : 'files'} found
              {totalFiles > 0 && ` out of ${totalFiles.toLocaleString()}`}
            </>
          ) : (
            // Empty space to prevent layout shift
            <span>&nbsp;</span>
          )}
        </Typography>
        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                checked={useFuzzySearch}
                onChange={handleFuzzySearchToggle}
                size="small"
              />
            }
            label="Fuzzy Search"
          />
          <InfoTooltip
            title="Fuzzy search finds approximate matches allowing for typos and variations. Default search requires more exact matching."
            fontSize="small"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SearchInput;

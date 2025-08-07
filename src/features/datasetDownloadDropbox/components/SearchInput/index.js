import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@material-ui/core';
import { Search, Clear } from '@material-ui/icons';
import {
  setSearchQuery,
  setSearchResults,
  setSearchActive,
  clearSearch,
} from '../../state/actions';
import {
  selectCurrentFolderSearchState,
  selectCurrentTab,
  selectMainFolder,
  selectSearchableFiles,
} from '../../state/selectors';
import {
  createSearchInstance,
  performSearch,
  SearchPerformanceMonitor,
} from '../../utils/searchUtils';
import FileExampleBasic from './FileExampleBasic';

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;

const SearchInput = () => {
  const dispatch = useDispatch();
  const currentTabFromSelector = useSelector(selectCurrentTab);
  const mainFolder = useSelector(selectMainFolder);
  const currentTab = currentTabFromSelector || mainFolder || 'rep';
  const searchState = useSelector(selectCurrentFolderSearchState);
  const searchableFiles = useSelector((state) =>
    selectSearchableFiles(state, currentTab),
  );

  // Local input state for immediate UI response
  const [inputValue, setInputValue] = useState(searchState.query || '');


  // Refs for managing debounced search
  const debounceTimeoutRef = useRef(null);
  const searchInstanceRef = useRef(null);
  const performanceMonitorRef = useRef(new SearchPerformanceMonitor());

  // Update search instance when files change
  useEffect(() => {
    if (searchableFiles && searchableFiles.length > 0) {
      searchInstanceRef.current = createSearchInstance(searchableFiles);
    }
  }, [searchableFiles]);

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
        }, DEBOUNCE_DELAY);
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


  // Simple placeholder instructions
  const placeholderText = 'Type part of a filename to search (minimum 3 characters)';

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholderText}
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
                  aria-label="Clear search"
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
        style={{ marginBottom: 8 }}
      />

      {/* File examples from dataset */}
      <FileExampleBasic searchableFiles={searchableFiles} />
    </Box>
  );
};

export default SearchInput;

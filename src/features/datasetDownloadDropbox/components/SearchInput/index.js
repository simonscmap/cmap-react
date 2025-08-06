import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Paper,
  Typography,
  ClickAwayListener,
  Checkbox,
} from '@material-ui/core';
import { Search, Clear, Info } from '@material-ui/icons';
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
  selectSearchResults,
  selectIsSearchActive,
} from '../../state/selectors';
import {
  createSearchInstance,
  performSearch,
  getPatternHints,
  SearchPerformanceMonitor,
} from '../../utils/searchUtils';
import { formatBytes } from '../../utils/fileUtils';

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;

const SearchInput = ({ selectedFiles = [], onToggleFile }) => {
  const dispatch = useDispatch();
  const currentTabFromSelector = useSelector(selectCurrentTab);
  const mainFolder = useSelector(selectMainFolder);
  const currentTab = currentTabFromSelector || mainFolder || 'rep';
  const searchState = useSelector(selectCurrentFolderSearchState);
  const searchableFiles = useSelector((state) => selectSearchableFiles(state, currentTab));

  // Local input state for immediate UI response
  const [inputValue, setInputValue] = useState(searchState.query || '');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get search results for dropdown
  const searchResults = useSelector((state) => selectSearchResults(state, currentTab));
  const isSearchActive = useSelector((state) => selectIsSearchActive(state, currentTab));
  
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
  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    
    // Immediate state update for UI responsiveness
    setInputValue(value);

    // Show dropdown when user starts typing
    if (value.length >= MIN_SEARCH_LENGTH) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }

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
        setShowDropdown(false);
        return;
      }

      if (value.length < MIN_SEARCH_LENGTH) {
        // Deactivate search but don't clear query
        dispatch(setSearchActive(false, currentTab));
        setShowDropdown(false);
        return;
      }

      // Activate search and schedule debounced execution
      dispatch(setSearchActive(true, currentTab));
      
      debounceTimeoutRef.current = setTimeout(() => {
        if (searchInstanceRef.current) {
          const searchResult = performSearch(
            searchInstanceRef.current,
            value,
            performanceMonitorRef.current
          );
          
          dispatch(
            setSearchResults(
              searchResult.results,
              searchResult.matches,
              searchResult.performance ? searchResult.performance.duration : 0,
              currentTab
            )
          );
        }
      }, DEBOUNCE_DELAY);
    });
  }, [dispatch, currentTab]);

  // Handle clear button click
  const handleClear = useCallback(() => {
    setInputValue('');
    dispatch(clearSearch(currentTab));
    dispatch(setSearchActive(false, currentTab));
    setShowDropdown(false);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [dispatch, currentTab]);

  // Handle click away from dropdown
  const handleClickAway = useCallback(() => {
    setShowDropdown(false);
    // Keep selections - user might have spent time selecting files
  }, []);

  // Clear all dropdown selections
  const handleClearDropdownSelections = useCallback(() => {
    if (onToggleFile) {
      // Remove all currently selected files that are visible in the dropdown
      const searchResultPaths = new Set(searchResults.map(file => file.path));
      selectedFiles.forEach(file => {
        if (searchResultPaths.has(file.path)) {
          onToggleFile(file);
        }
      });
    }
  }, [selectedFiles, searchResults, onToggleFile]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (inputValue.length >= MIN_SEARCH_LENGTH && isSearchActive) {
      setShowDropdown(true);
    }
  }, [inputValue.length, isSearchActive]);

  // Handle file selection in dropdown
  const handleFileSelect = useCallback((file) => {
    if (onToggleFile) {
      onToggleFile(file);
    }
    // Don't close dropdown on selection - user may select multiple files
  }, [onToggleFile]);

  // Generate placeholder text from file patterns
  const placeholderText = React.useMemo(() => {
    const patterns = getPatternHints(searchableFiles);
    if (patterns.first && patterns.last) {
      return `Search files (e.g., ${patterns.first.split('.')[0]}...)`;
    }
    return 'Search files...';
  }, [searchableFiles]);

  // Generate tooltip content
  const tooltipContent = React.useMemo(() => (
    <Box>
      <Box component="div" style={{ marginBottom: 4 }}>
        <strong>Fuzzy Search Tips:</strong>
      </Box>
      <Box component="div">• Type any part of filename</Box>
      <Box component="div">• No need for exact matches</Box>
      <Box component="div">• Minimum 3 characters</Box>
      <Box component="div">• Results auto-update as you type</Box>
    </Box>
  ), []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box position="relative">
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
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
                <Tooltip title={tooltipContent} placement="top-end">
                  <IconButton size="small" edge="end" aria-label="Search help">
                    <Info color="action" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          style={{ marginBottom: 16 }}
        />
        
        {/* Google-style search dropdown */}
        {showDropdown && isSearchActive && searchResults && searchResults.length > 0 && (
          <Paper
            elevation={8}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1300,
              maxHeight: 300,
              overflow: 'auto',
              marginTop: 1,
              backgroundColor: '#184562', // Use solidPaper color for better opacity
              borderRadius: 4,
              border: '1px solid #2c6b8f',
            }}
          >
            {/* Header with file count */}
            <Box 
              px={2} 
              py={1} 
              style={{ 
                borderBottom: '1px solid #2c6b8f',
                backgroundColor: '#154052', // Slightly darker header
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" style={{ color: '#9dd162', fontWeight: 500 }}>
                {searchResults.length} files found
                {selectedFiles.length > 0 && (
                  <Typography component="span" style={{ color: '#ffffff', marginLeft: 8 }}>
                    ({selectedFiles.length} selected)
                  </Typography>
                )}
              </Typography>
              {selectedFiles.length > 0 && (
                <Typography 
                  variant="caption" 
                  style={{ 
                    color: '#9dd162', 
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.75rem'
                  }}
                  onClick={handleClearDropdownSelections}
                >
                  Clear all
                </Typography>
              )}
            </Box>
            
            {/* File list */}
            {searchResults.slice(0, 8).map((file, index) => {
              const isSelected = selectedFiles.some(f => f.path === file.path);
              return (
                <Box
                  key={`dropdown-${file.path}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: index < Math.min(searchResults.length, 8) - 1 ? '1px solid #2c6b8f' : 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#22547a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileSelect(file);
                  }}
                >
                  {/* Checkbox */}
                  <Box px={1} py={1}>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent parent onClick from firing
                        handleFileSelect(file);
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent onClick from firing
                      }}
                      size="small"
                      style={{
                        color: '#9dd162',
                        padding: '4px',
                      }}
                    />
                  </Box>
                  
                  {/* File info */}
                  <Box 
                    py={1} 
                    pr={2}
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minWidth: 0, // For text truncation
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      style={{ 
                        color: '#ffffff', 
                        fontWeight: 500,
                        flex: 1,
                        marginRight: 16,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      style={{ 
                        color: '#9dd162',
                        flexShrink: 0,
                        fontSize: '0.75rem'
                      }}
                    >
                      {file.sizeFormatted || formatBytes(file.size)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            
            {/* Show more indicator */}
            {searchResults.length > 8 && (
              <Box px={2} py={1} textAlign="center" style={{ borderTop: '1px solid #2c6b8f' }}>
                <Typography variant="caption" style={{ color: '#9dd162', fontStyle: 'italic' }}>
                  and {searchResults.length - 8} more files...
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchInput;
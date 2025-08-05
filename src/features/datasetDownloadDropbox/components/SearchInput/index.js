import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
} from '@material-ui/core';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import {
  setSearchQuery,
  setSearchResults,
  setSearchActive,
  clearSearch,
} from '../../state/actions';
import { selectFolderSearchState } from '../../state/selectors';
import {
  createSearchInstance,
  performSearch,
  SearchPerformanceMonitor,
  getPatternHints,
} from '../../utils/searchUtils';
import { SEARCH_DEBOUNCE_DELAY } from '../../constants/searchConstants';

const debounce = (func, delay) => {
  let timeoutId;
  const debounced = (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
};

const useStyles = makeStyles((theme) => ({
  searchInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  searchField: {
    flexGrow: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.divider,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
  searchIcon: {
    color: theme.palette.action.active,
  },
  clearButton: {
    padding: theme.spacing(0.5),
    color: theme.palette.action.active,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  infoButton: {
    padding: theme.spacing(0.5),
    color: theme.palette.action.active,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const SearchInput = ({ files, folderType }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Local state for input value (for immediate UI response)
  const [inputValue, setInputValue] = useState('');

  // Get search state from Redux
  const searchState = useSelector((state) =>
    selectFolderSearchState(state, folderType),
  );

  // Create performance monitor instance
  const performanceMonitor = useMemo(() => new SearchPerformanceMonitor(), []);

  // Create search instance when files change
  const searchInstance = useMemo(() => {
    if (!files || files.length === 0) return null;
    return createSearchInstance(files);
  }, [files]);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((query, searchInst, monitor) => {
      if (!searchInst) return;

      // Dispatch search query to Redux
      dispatch(setSearchQuery(query, folderType));

      if (!query || !query.trim()) {
        // Clear search results
        dispatch(clearSearch(folderType));
        dispatch(setSearchActive(false, folderType));
        return;
      }

      // Activate search mode
      dispatch(setSearchActive(true, folderType));

      // Perform the search
      const searchResult = performSearch(searchInst, query, monitor);

      // Dispatch results to Redux
      dispatch(
        setSearchResults(
          searchResult.results,
          searchResult.matches,
          searchResult.performance ? searchResult.performance.duration : 0,
          folderType,
        ),
      );
    }, SEARCH_DEBOUNCE_DELAY),
    [dispatch, folderType],
  );

  // Handle input change - immediate UI update, debounced search
  const handleInputChange = (event) => {
    const value = event.target.value;
    
    // IMMEDIATELY update local state - this should be instant with no dependencies
    setInputValue(value);

    // Trigger search in a separate microtask to not block input rendering
    Promise.resolve().then(() => {
      if (searchInstance) {
        debouncedSearch(value, searchInstance, performanceMonitor);
      }
    });
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue('');
    dispatch(clearSearch(folderType));
    dispatch(setSearchActive(false, folderType));
    debouncedSearch.cancel(); // Cancel any pending debounced calls
  };

  // Sync input value with Redux state when search is cleared externally
  useEffect(() => {
    if (!searchState.isActive && !searchState.query && inputValue) {
      setInputValue('');
    }
  }, [searchState.isActive, searchState.query, inputValue]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Generate placeholder text from filename patterns
  const placeholderText = useMemo(() => {
    if (!files || files.length === 0) {
      return 'Search files...';
    }
    
    const patternHints = getPatternHints(files);
    if (patternHints.first && patternHints.last && patternHints.first !== patternHints.last) {
      return `"${patternHints.first}" to "${patternHints.last}"`;
    } else if (patternHints.first) {
      return `"${patternHints.first}"`;
    }
    
    return 'Search files...';
  }, [files]);

  const tooltipContent = (
    <div>
      <div>
        <strong>Fuzzy Search Tips:</strong>
      </div>
      <div>• Type partial filenames to find matches</div>
      <div>• Search is case-insensitive</div>
      <div>• Use spaces to search multiple terms</div>
      <div>• Results update automatically as you type</div>
    </div>
  );

  return (
    <Box className={classes.searchInputContainer}>
      <TextField
        className={classes.searchField}
        variant="outlined"
        size="small"
        placeholder={placeholderText}
        value={inputValue}
        onChange={handleInputChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className={classes.searchIcon} />
            </InputAdornment>
          ),
          endAdornment: inputValue && (
            <InputAdornment position="end">
              <IconButton
                className={classes.clearButton}
                onClick={handleClear}
                size="small"
                aria-label="Clear search"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Tooltip
        title={tooltipContent}
        arrow
        placement="top"
        classes={{ tooltip: classes.tooltip }}
      >
        <IconButton
          className={classes.infoButton}
          size="small"
          aria-label="Search help"
        >
          <InfoIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SearchInput;

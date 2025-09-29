import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { Search } from '@material-ui/icons';
import InfoTooltip from '../../../shared/components/InfoTooltip';

import {
  useSearchQuery,
  useSearchEngine,
  useSearchActions,
  useIsSearchActive,
  useResultCount,
  useTotalCount,
  useFilteredItems,
} from '../state/useSearch';
import { SEARCH_ENGINES, SEARCH_CONFIG } from '../constants/searchConstants';

const useStyles = makeStyles((theme) => ({
  resultCount: {
    minHeight: '24px', // Reserve space to prevent layout shift
    marginBottom: 8,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  autocompleteListbox: {
    backgroundColor: '#1B4156',
    '& .MuiAutocomplete-option': {
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'rgba(157, 209, 98, 0.2)',
      },
      '&[data-focus="true"]': {
        backgroundColor: 'rgba(157, 209, 98, 0.15)',
      },
    },
  },
  autocompletePaper: {
    backgroundColor: '#1B4156',
    border: '1px solid rgba(157, 209, 98, 0.3)',
    minHeight: '48px',
  },
  dropdownResultCount: {
    padding: '8px 16px 12px 16px',
    marginTop: '4px',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.6)',
    pointerEvents: 'none',
  },
}));

const SearchInput = ({
  placeholder,
  size = 'small',
  fullWidth = true,
  showResultCount = true,
  showEngineToggle = true,
  enableAutocomplete = false,
  onSelect = null,
  getOptionLabel = null,
}) => {
  const classes = useStyles();

  // Zustand state hooks
  const searchQuery = useSearchQuery();
  const searchEngine = useSearchEngine();
  const isSearchActive = useIsSearchActive();
  const resultCount = useResultCount();
  const totalCount = useTotalCount();
  const filteredItems = useFilteredItems();
  const { setSearchQuery, clearSearch, setSearchEngine } = useSearchActions();

  // Local input state for immediate UI response
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Refs for managing debounced search
  const debounceTimeoutRef = useRef(null);

  // Sync local input state with Zustand when search state changes externally
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  // Open dropdown when search becomes active and results are available
  useEffect(() => {
    if (enableAutocomplete && isSearchActive && filteredItems.length > 0) {
      setDropdownOpen(true);
    }
  }, [enableAutocomplete, isSearchActive, filteredItems.length]);

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

      // Debounced search update - let Zustand state management handle the search logic
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value); // Debouncing handled by state management
      }, SEARCH_CONFIG.DEBOUNCE_MS);
    },
    [setSearchQuery],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
    setDropdownOpen(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [clearSearch]);

  // Handle dropdown close (click outside, escape key, etc.)
  const handleClose = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Handle input focus - reopen dropdown if there are results
  const handleFocus = useCallback(() => {
    if (isSearchActive && filteredItems.length > 0) {
      setDropdownOpen(true);
    }
  }, [isSearchActive, filteredItems.length]);

  // Handle search engine toggle
  const handleEngineToggle = useCallback(
    (event) => {
      const enabled = event.target.checked;
      const engine = enabled ? SEARCH_ENGINES.FUZZY : SEARCH_ENGINES.WILDCARD;
      setSearchEngine(engine);
    },
    [setSearchEngine],
  );

  // Dynamic placeholder text based on selected search engine
  const placeholderText =
    placeholder ||
    (searchEngine === SEARCH_ENGINES.WILDCARD
      ? 'Search with wildcards: *.txt, fd*, *10*.txt'
      : 'Search with fuzzy matching: approximate and typo-tolerant');

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
      <Autocomplete
        freeSolo
        open={dropdownOpen}
        onClose={handleClose}
        options={enableAutocomplete ? filteredItems : []}
        getOptionLabel={
          getOptionLabel ||
          ((option) => (typeof option === 'string' ? option : String(option)))
        }
        onInputChange={(_event, _value, reason) => {
          if (reason === 'clear') {
            handleClear();
          }
        }}
        onChange={(_event, value) => {
          if (onSelect && value) {
            onSelect(value);
          }
        }}
        classes={{
          listbox: classes.autocompleteListbox,
          paper: classes.autocompletePaper,
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size={size}
            fullWidth={fullWidth}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholderText}
            style={{ marginBottom: 8 }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {params.InputProps.startAdornment}
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                </>
              ),
            }}
          />
        )}
        ListboxComponent={React.forwardRef(({ children, ...other }, ref) => (
          <ul {...other} ref={ref}>
            {children}
            {enableAutocomplete &&
              isSearchActive &&
              inputValue.length >= SEARCH_CONFIG.ACTIVATION_THRESHOLD && (
                <li className={classes.dropdownResultCount}>
                  {resultCount} {resultCount === 1 ? 'result' : 'results'} found
                  {totalCount > 0 && ` out of ${totalCount.toLocaleString()}`}
                </li>
              )}
          </ul>
        ))}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {showResultCount && (
          <Typography className={classes.resultCount}>
            {isSearchActive &&
            inputValue.length >= SEARCH_CONFIG.ACTIVATION_THRESHOLD ? (
              <>
                {resultCount} {resultCount === 1 ? 'result' : 'results'} found
                {totalCount > 0 && ` out of ${totalCount.toLocaleString()}`}
              </>
            ) : (
              // Empty space to prevent layout shift
              <span>&nbsp;</span>
            )}
          </Typography>
        )}
        {showEngineToggle && (
          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={searchEngine === SEARCH_ENGINES.FUZZY}
                  onChange={handleEngineToggle}
                  size="small"
                />
              }
              label="Fuzzy Search"
            />
            <InfoTooltip
              title="Toggle between Wildcard search (supports patterns like *.txt, fd*) and Fuzzy search (typo-tolerant approximate matching)."
              fontSize="small"
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchInput;

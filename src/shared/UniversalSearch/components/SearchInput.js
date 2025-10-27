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
import InfoTooltip from '../../components/InfoTooltip';

import {
  useSearchQuery,
  useSearchEngine,
  useSearchActions,
  useIsSearchActive,
  useResultCount,
  useTotalCount,
  useFilteredItems,
  useAllItems,
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
    maxHeight: '400px', // Fixed max height to prevent modal resizing
    overflowY: 'auto',
    paddingBottom: '44px', // Space for fixed footer
    paddingRight: '8px', // Space for scrollbar to prevent overlap
    '& .MuiAutocomplete-option': {
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'rgba(157, 209, 98, 0.2)',
      },
      '&[data-focus="true"]': {
        backgroundColor: 'rgba(157, 209, 98, 0.15)',
      },
    },
    // For grid layouts, make options use display: contents so their children become grid items
    '&[style*="display: grid"]': {
      paddingRight: 0, // Remove padding for grid, handle it differently
      '& .MuiAutocomplete-option': {
        display: 'contents',
        '&:hover > *': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
        '&[data-focus="true"] > *': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
  autocompletePaper: {
    backgroundColor: '#1B4156',
    border: '1px solid rgba(157, 209, 98, 0.3)',
    minHeight: '48px',
    maxHeight: '444px', // listbox height + footer height
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownResultCount: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '8px 16px 12px 16px',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: '#1B4156',
    borderTop: '1px solid rgba(255, 255, 255, 0.12)',
    pointerEvents: 'none',
    zIndex: 2,
    flexShrink: 0,
  },
  listboxWrapper: {
    position: 'relative',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#1B4156',
    zIndex: 3,
    flexShrink: 0,
    display: 'contents',
  },
  stickyHeaderCell: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#1B4156',
    zIndex: 3,
  },
  scrollableContent: {
    overflowY: 'auto',
    flexGrow: 1,
    backgroundColor: '#1B4156',
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
  renderOption = null,
  popperZIndex = null,
  controlsAlign = 'right', // 'left' | 'right'
  loadAllOnFocus = false, // New: when true, shows all items on focus before threshold is met
  disablePortal = false, // When true, Popper renders inside parent instead of document body
  prependOptions = [], // Array of options to prepend to the results (e.g., headers, group headers)
  processItems = null, // Optional function to process/group items: (items) => processedItems
  getOptionDisabled = null, // Optional function to determine if option should be disabled: (option) => boolean
  listboxGridColumns = null, // Optional grid-template-columns value for grid-based layouts
}) => {
  const classes = useStyles();

  // Zustand state hooks
  const searchQuery = useSearchQuery();
  const searchEngine = useSearchEngine();
  const isSearchActive = useIsSearchActive();
  const resultCount = useResultCount();
  const totalCount = useTotalCount();
  const filteredItems = useFilteredItems();
  const allItems = useAllItems();
  const { setSearchQuery, clearSearch, setSearchEngine } = useSearchActions();

  // Local input state for immediate UI response
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllOnFocus, setShowAllOnFocus] = useState(false); // Track if we should show all items

  // Refs for managing debounced search
  const debounceTimeoutRef = useRef(null);

  // Sync local input state with Zustand when search state changes externally
  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  // Open dropdown when search becomes active (show even with zero results)
  useEffect(() => {
    if (enableAutocomplete && isSearchActive) {
      setDropdownOpen(true);
    }
  }, [enableAutocomplete, isSearchActive, filteredItems.length]);

  // Handle input change with immediate UI update
  const handleInputChange = useCallback(
    (event) => {
      const value = event.target.value;

      // Immediate state update for UI responsiveness
      setInputValue(value);

      // Disable showAllOnFocus mode once user starts typing
      if (showAllOnFocus && value) {
        setShowAllOnFocus(false);
      }

      // Clear any pending debounced search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounced search update - let Zustand state management handle the search logic
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value); // Debouncing handled by state management
      }, SEARCH_CONFIG.DEBOUNCE_MS);
    },
    [setSearchQuery, showAllOnFocus],
  );

  // Handle clear button click
  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
    setDropdownOpen(false);
    setShowAllOnFocus(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [clearSearch]);

  // Handle dropdown close (click outside, escape key, etc.)
  const handleClose = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Handle input focus - reopen dropdown if search is active or loadAllOnFocus is enabled
  const handleFocus = useCallback(() => {
    if (loadAllOnFocus && !inputValue) {
      // Enable showing all items when focused with empty input
      setShowAllOnFocus(true);
      setDropdownOpen(true);
    } else if (isSearchActive) {
      setDropdownOpen(true);
    }
  }, [isSearchActive, loadAllOnFocus, inputValue]);

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

  // Consolidated search activation logic
  const shouldShowResults =
    isSearchActive && inputValue.length >= SEARCH_CONFIG.ACTIVATION_THRESHOLD;

  // Determine which items to show: all items on focus (before threshold), or filtered items (after threshold)
  // Prepend any custom options (headers, group headers, etc.) to the items
  const baseItems = enableAutocomplete
    ? showAllOnFocus
      ? allItems
      : filteredItems
    : [];

  // Process items if a processing function is provided (e.g., for grouping)
  const processedItems = processItems ? processItems(baseItems) : baseItems;

  const displayItems = [...prependOptions, ...processedItems];

  return (
    <Box>
      <Autocomplete
        freeSolo
        open={dropdownOpen}
        onClose={handleClose}
        options={displayItems}
        noOptionsText=""
        filterOptions={(x) => x}
        getOptionLabel={
          getOptionLabel ||
          ((option) => (typeof option === 'string' ? option : String(option)))
        }
        getOptionDisabled={getOptionDisabled || undefined}
        renderOption={renderOption || undefined}
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
        PaperComponent={({ children, ...props }) => (
          <div {...props} className={classes.autocompletePaper}>
            {children}
            {enableAutocomplete && (showAllOnFocus || shouldShowResults) && (
              <div className={classes.dropdownResultCount}>
                {showAllOnFocus
                  ? `${totalCount.toLocaleString()} ${totalCount === 1 ? 'collection' : 'collections'} available`
                  : `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found${totalCount > 0 ? ` out of ${totalCount.toLocaleString()}` : ''}`}
              </div>
            )}
          </div>
        )}
        disablePortal={disablePortal}
        PopperComponent={(props) => (
          <div
            {...props}
            style={{
              ...props.style,
              ...(popperZIndex && { zIndex: popperZIndex }),
            }}
          >
            {props.children}
          </div>
        )}
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
        ListboxComponent={React.forwardRef(({ children, ...other }, ref) => {
          // Extract header and content items
          const childArray = React.Children.toArray(children);
          const headerItem = prependOptions.length > 0 ? childArray[0] : null;
          const contentItems =
            prependOptions.length > 0 ? childArray.slice(1) : childArray;

          // Build style object with optional grid layout
          const listStyle = {
            ...other.style,
            padding: 0,
          };

          if (listboxGridColumns) {
            // Grid-based layout for table-like structure
            listStyle.display = 'grid';
            listStyle.gridTemplateColumns = listboxGridColumns;
            listStyle.alignItems = 'stretch';
          } else {
            // Default flex layout
            listStyle.display = 'flex';
            listStyle.flexDirection = 'column';
          }

          return (
            <ul {...other} ref={ref} style={listStyle}>
              {headerItem && (
                <li
                  className={classes.stickyHeader}
                  style={{
                    listStyle: 'none',
                    ...(listboxGridColumns ? { display: 'contents' } : {}),
                  }}
                >
                  {headerItem}
                </li>
              )}
              {contentItems}
            </ul>
          );
        })}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={controlsAlign === 'left' ? 'row-reverse' : 'row'}
      >
        {showResultCount && (
          <Typography className={classes.resultCount}>
            {showAllOnFocus ? (
              <>
                {totalCount.toLocaleString()}{' '}
                {totalCount === 1 ? 'collection' : 'collections'} available
              </>
            ) : shouldShowResults ? (
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

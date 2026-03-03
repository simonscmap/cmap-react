import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Popper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, ToggleButton } from '@material-ui/lab';
import { Search, ExpandMore, ExpandLess } from '@material-ui/icons';
import InfoTooltip from '../../components/InfoTooltip';
import colors from '../../../enums/colors';

import {
  useSearchQuery,
  useSearchEngine,
  useSearchActions,
  useIsSearchActive,
  useResultCount,
  useTotalCount,
  useFilteredItems,
  useAllItems,
  useActivationThreshold,
} from '../state/useSearch';
import { SEARCH_ENGINES, SEARCH_CONFIG } from '../constants/searchConstants';

const useStyles = makeStyles((theme) => ({
  resultCount: {
    minHeight: '24px',
    marginBottom: 8,
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  autocompleteListbox: {
    backgroundColor: '#1B4156',
    maxHeight: '400px',
    overflowY: 'auto',
    paddingBottom: '44px',
    paddingRight: '8px',
    '& .MuiAutocomplete-option': {
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'rgba(157, 209, 98, 0.2)',
      },
      '&[data-focus="true"]': {
        backgroundColor: 'rgba(157, 209, 98, 0.15)',
      },
    },
    '&[style*="display: grid"]': {
      paddingRight: 0,
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
    maxHeight: '444px',
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
  textFieldRoot: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: colors.primary,
      },
      '&:hover fieldset': {
        borderColor: colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      },
    },
  },
  autocompleteRootWithText: {
    '& .MuiAutocomplete-clearIndicator': {
      visibility: 'visible !important',
    },
  },
  searchIcon: {
    color: colors.primary,
  },
  toggleButton: {
    color: colors.secondary,
    borderColor: colors.secondary,
    borderRadius: 4,
    minWidth: 40,
    height: 40,
    marginLeft: 8,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: colors.blueHover,
    },
    '&.Mui-selected': {
      backgroundColor: 'transparent',
      color: colors.secondary,
      '&:hover': {
        backgroundColor: colors.blueHover,
      },
    },
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
  controlsAlign = 'right',
  loadAllOnFocus = false,
  disablePortal = false,
  prependOptions = [],
  processItems = null,
  getOptionDisabled = null,
  listboxGridColumns = null,
  showDropdownToggle = true,
  activationThreshold: propThreshold = null,
}) => {
  const classes = useStyles();

  const searchQuery = useSearchQuery();
  const searchEngine = useSearchEngine();
  const isSearchActive = useIsSearchActive();
  const resultCount = useResultCount();
  const totalCount = useTotalCount();
  const filteredItems = useFilteredItems();
  const contextThreshold = useActivationThreshold();
  const activationThreshold = propThreshold !== null ? propThreshold : contextThreshold;
  const allItems = useAllItems();
  const { setSearchQuery, clearSearch, setSearchEngine } = useSearchActions();

  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAllOnFocus, setShowAllOnFocus] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    setInputValue(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (enableAutocomplete && isSearchActive) {
      setDropdownOpen(true);
    }
  }, [enableAutocomplete, isSearchActive, filteredItems.length]);

  const handleInputChange = useCallback(
    (event) => {
      let value = event.target.value;

      setInputValue(value);

      if (showAllOnFocus && value) {
        setShowAllOnFocus(false);
      }

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (value === '') {
        clearSearch();
        setShowAllOnFocus(false);
        return;
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setSearchQuery(value);
      }, SEARCH_CONFIG.DEBOUNCE_MS);
    },
    [setSearchQuery, clearSearch, showAllOnFocus],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    clearSearch();
    setDropdownOpen(false);
    setShowAllOnFocus(false);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, [clearSearch]);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'escape' || reason === 'blur' || reason === 'selectOption') {
      setDropdownOpen(false);
    }
  }, []);

  const handleToggleButtonClick = useCallback(
    () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      } else {
        if (loadAllOnFocus && !inputValue) {
          setShowAllOnFocus(true);
        }
        setDropdownOpen(true);
      }
    },
    [dropdownOpen, loadAllOnFocus, inputValue],
  );

  const handleFocus = useCallback(() => {
    if (!enableAutocomplete) {
      return;
    }
    if (loadAllOnFocus && !inputValue) {
      setShowAllOnFocus(true);
      setDropdownOpen(true);
    } else if (isSearchActive) {
      setDropdownOpen(true);
    }
  }, [enableAutocomplete, isSearchActive, loadAllOnFocus, inputValue]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !enableAutocomplete) {
      event.defaultMuiPrevented = true;
      setDropdownOpen(false);
      event.target.blur();
    }
  }, [enableAutocomplete]);

  const handleEngineToggle = useCallback(
    (event) => {
      let enabled = event.target.checked;
      let engine = enabled ? SEARCH_ENGINES.FUZZY : SEARCH_ENGINES.WILDCARD;
      setSearchEngine(engine);
    },
    [setSearchEngine],
  );

  const placeholderText =
    placeholder ||
    (searchEngine === SEARCH_ENGINES.WILDCARD
      ? 'Search with wildcards: *.txt, fd*, *10*.txt'
      : 'Search with fuzzy matching: approximate and typo-tolerant');

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowResults =
    isSearchActive && inputValue.length >= activationThreshold;

  const baseItems = enableAutocomplete
    ? showAllOnFocus
      ? allItems
      : filteredItems
    : [];

  const processedItems = processItems ? processItems(baseItems) : baseItems;

  const displayItems = [...prependOptions, ...processedItems];

  return (
    <Box>
      <Box display="flex" alignItems="flex-start">
        <div ref={autocompleteRef} style={{ flex: 1 }}>
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
              root: inputValue ? classes.autocompleteRootWithText : undefined,
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
              <Popper
                {...props}
                style={{
                  ...props.style,
                  width: autocompleteRef.current ? autocompleteRef.current.offsetWidth : props.style.width,
                  ...(popperZIndex && { zIndex: popperZIndex }),
                }}
              />
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
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                style={{ marginBottom: 8 }}
                className={classes.textFieldRoot}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      {params.InputProps.startAdornment}
                      <InputAdornment position="start">
                        <Search className={classes.searchIcon} />
                      </InputAdornment>
                    </>
                  ),
                  endAdornment: params.InputProps.endAdornment,
                }}
              />
            )}
            ListboxComponent={React.forwardRef(({ children, ...other }, ref) => {
              const childArray = React.Children.toArray(children);
              const headerItem = prependOptions.length > 0 ? childArray[0] : null;
              const contentItems =
                prependOptions.length > 0 ? childArray.slice(1) : childArray;

              const listStyle = {
                ...other.style,
                padding: 0,
              };

              if (listboxGridColumns) {
                listStyle.display = 'grid';
                listStyle.gridTemplateColumns = listboxGridColumns;
                listStyle.alignItems = 'stretch';
              } else {
                listStyle.display = 'flex';
                listStyle.flexDirection = 'column';
              }

              return (
                <ul {...other} ref={ref} style={listStyle}>
                  {headerItem}
                  {contentItems}
                </ul>
              );
            })}
          />
        </div>
        {showDropdownToggle && enableAutocomplete && (
          <ToggleButton
            value="dropdown"
            selected={dropdownOpen}
            onChange={handleToggleButtonClick}
            size="small"
            className={classes.toggleButton}
          >
            {dropdownOpen ? <ExpandLess /> : <ExpandMore />}
          </ToggleButton>
        )}
      </Box>
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

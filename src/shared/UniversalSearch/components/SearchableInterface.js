import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  SearchProvider,
  useFilteredItems,
  useTotalCount,
  useIsSearchActive,
} from '../state/useSearch';
import SearchInput from './SearchInput';

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    // Removed visible background and border for cleaner look
    // backgroundColor: '#184562',
    // border: `1px solid #2c6b8f`,
    // borderRadius: theme.shape.borderRadius,
  },
  searchHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  searchTitle: {
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
  fileCountBadge: {
    fontSize: '0.8em',
    padding: theme.spacing(0.5, 1),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
  },
  resultsContainer: {
    marginTop: theme.spacing(1),
  },
  emptyState: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.spacing(2),
  },
}));

// Internal SearchableInterface implementation (wrapped by SearchProvider)
const SearchableInterfaceInner = ({
  items,
  searchKeys,
  renderItem,
  displayName = 'Items',
  threshold = 25,
  emptyStateMessage = 'No items found matching your search criteria.',
  className,
}) => {
  const classes = useStyles();

  const filteredItems = useFilteredItems();
  const totalCount = useTotalCount();
  const isSearchActive = useIsSearchActive();

  // Check if search should be active based on total count threshold
  const shouldShowSearch = totalCount > threshold;

  if (!shouldShowSearch) {
    return null;
  }

  return (
    <Box className={`${classes.searchContainer} ${className || ''}`}>
      <div className={classes.searchHeader}>
        <Typography variant="h6" className={classes.searchTitle}>
          Filter {displayName}
        </Typography>
      </div>
      <SearchInput />

      <Box className={classes.resultsContainer}>
        {isSearchActive && filteredItems.length === 0 ? (
          <Typography className={classes.emptyState}>
            {emptyStateMessage}
          </Typography>
        ) : (
          filteredItems.map((item, index) => renderItem(item, index))
        )}
      </Box>
    </Box>
  );
};

// Main SearchableInterface component with SearchProvider wrapper
const SearchableInterface = ({
  items,
  searchKeys,
  renderItem,
  displayName = 'Items',
  threshold = 25,
  emptyStateMessage = 'No items found matching your search criteria.',
  className,
}) => {
  return (
    <SearchProvider items={items} searchKeys={searchKeys}>
      <SearchableInterfaceInner
        items={items}
        searchKeys={searchKeys}
        renderItem={renderItem}
        displayName={displayName}
        threshold={threshold}
        emptyStateMessage={emptyStateMessage}
        className={className}
      />
    </SearchProvider>
  );
};

export default SearchableInterface;

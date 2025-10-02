import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { showLoginDialog } from '../../../Redux/actions/ui';
import useCollectionsStore from '../state/collectionsStore';
import CollectionCard from './CollectionCard';
import CollectionStatistics from './CollectionStatistics';
import { PaginationController } from '../../../shared/pagination';
import {
  SearchProvider,
  SearchInput,
  useFilteredItems,
} from '../../../shared/UniversalSearch';
import { useSorting } from '../../../shared/sorting/state/useSorting';
import SortDropdown from '../../../shared/sorting/components/SortDropdown';
import FilterDropdown from '../components/FilterDropdown';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  statisticsSection: {
    marginBottom: theme.spacing(4),
  },
  searchSection: {
    marginBottom: theme.spacing(3),
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'flex-start',
  },
  searchInput: {
    flex: 1,
  },
  sortDropdown: {
    display: 'flex',
    alignItems: 'center',
    height: '40px', // Match TextField height for 'small' size
  },
  filterDropdown: {
    display: 'flex',
    alignItems: 'center',
    height: '40px', // Match TextField height for 'small' size
  },
  collectionsGrid: {
    marginTop: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing(3),
    gridAutoRows: '1fr',
    [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    },
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
      maxWidth: '100%',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  loginPrompt: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  loginButton: {
    marginTop: theme.spacing(2),
  },
}));

// Sort configuration
const sortConfig = {
  fields: [
    { key: 'name', type: 'string', label: 'Sort by Name', path: 'name' },
    {
      key: 'modified',
      type: 'date',
      label: 'Sort by Modified Date',
      path: 'modifiedDate',
    },
  ],
  defaultSort: {
    field: 'name',
    direction: 'asc',
  },
  uiPattern: 'dropdown-headers',
};

// Visibility filter options
const VISIBILITY_FILTERS = [
  { value: 'all', label: 'All Collections' },
  { value: 'public', label: 'Public Only' },
  { value: 'private', label: 'Private Only' },
];

// Inner component that uses filtered items from UniversalSearch
const MyCollectionsContent = ({ visibilityFilter, setVisibilityFilter }) => {
  const classes = useStyles();
  const filteredCollections = useFilteredItems();
  const { activeSort, comparator, setSort } = useSorting(sortConfig);

  // Sort the filtered collections
  const sortedCollections = [...filteredCollections].sort(comparator);

  return (
    <>
      <Box className={classes.searchSection}>
        <Box className={classes.searchInput}>
          <SearchInput
            placeholder="Search collections by name, description, or creator..."
            enableAutocomplete={true}
            getOptionLabel={(collection) => collection.name || ''}
            onSelect={(collection) => {
              // Optional: handle collection selection from dropdown
              console.log('Selected collection:', collection);
            }}
            controlsAlign="left"
          />
        </Box>
        <Box className={classes.filterDropdown}>
          <FilterDropdown
            options={VISIBILITY_FILTERS}
            selectedValue={visibilityFilter}
            onChange={setVisibilityFilter}
            label=""
          />
        </Box>
        <Box className={classes.sortDropdown}>
          <SortDropdown
            fields={sortConfig.fields}
            activeField={activeSort.field}
            onFieldChange={setSort}
            label=""
          />
        </Box>
      </Box>

      <PaginationController
        data={sortedCollections}
        itemsPerPage={9}
        renderItem={(collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        )}
        renderContainer={(children, pagination) => (
          <>
            <Box className={classes.collectionsGrid}>{children}</Box>
            {pagination}
          </>
        )}
        emptyComponent={
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>
              No Collections Found
            </Typography>
            <Typography variant="body1" color="textSecondary">
              You haven't created any collections yet. Start by creating your
              first collection to organize your datasets.
            </Typography>
          </Box>
        }
      />
    </>
  );
};

const MyCollectionsTab = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const {
    statistics,
    isLoading,
    error,
    filteredUserCollections,
    visibilityFilter,
    setVisibilityFilter,
  } = useCollectionsStore();

  const handleLoginClick = () => {
    dispatch(showLoginDialog());
  };

  if (!user) {
    return (
      <Box className={classes.container}>
        <Box className={classes.loginPrompt}>
          <Typography variant="h6" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Please sign in to view and manage your personal collections.
          </Typography>
          <Box>
            <button
              className={classes.loginButton}
              onClick={handleLoginClick}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Sign In
            </button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <Typography variant="body1">Loading your collections...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Typography variant="body1" color="error">
          Error loading collections: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        {/* <Typography variant="h5" gutterBottom>
          My Collections
        </Typography> */}
        {/* <Typography variant="body1" color="textSecondary">
          Manage your personal dataset collections
        </Typography> */}
      </Box>

      <Box className={classes.statisticsSection}>
        <CollectionStatistics statistics={statistics} />
      </Box>

      <SearchProvider
        // Force remount when visibility filter changes to sync with new filtered items
        // SearchProvider creates its store on mount and doesn't react to item prop changes
        key={`search-${visibilityFilter}`}
        items={filteredUserCollections}
        searchKeys={['name', 'description', 'creatorName']}
      >
        <MyCollectionsContent
          visibilityFilter={visibilityFilter}
          setVisibilityFilter={setVisibilityFilter}
        />
      </SearchProvider>
    </Box>
  );
};

export default MyCollectionsTab;

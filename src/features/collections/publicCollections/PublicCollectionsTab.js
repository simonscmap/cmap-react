import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useCollectionsStore from '../state/collectionsStore';
import CollectionsTable from './CollectionsTable';
import { PaginationController } from '../../../shared/pagination';
import {
  SearchProvider,
  SearchInput,
  useFilteredItems,
} from '../../../shared/UniversalSearch';
import { useSorting } from '../../../shared/sorting/state/useSorting';
import SortDropdown from '../../../shared/sorting/components/SortDropdown';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  errorContainer: {
    margin: theme.spacing(2, 0),
  },
}));

// Sort configuration
const sortConfig = {
  fields: [
    {
      key: 'popularity',
      type: 'number',
      label: 'Sort by Popularity',
      path: 'downloads',
    },
    {
      key: 'date',
      type: 'date',
      label: 'Sort by Date',
      path: 'createdDate',
    },
    {
      key: 'datasetCount',
      type: 'number',
      label: 'Sort by Dataset Count',
      path: 'datasetCount',
    },
    {
      key: 'name',
      type: 'string',
      label: 'Sort by Name',
      path: 'name',
    },
  ],
  defaultSort: {
    field: 'name',
    direction: 'asc',
  },
  uiPattern: 'dropdown-headers',
};

// Inner component that uses filtered items from UniversalSearch
const PublicCollectionsContent = () => {
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
        itemsPerPage={6}
        renderItem={(collection) => collection}
        renderContainer={(items, pagination) => (
          <>
            <CollectionsTable collections={items} />
            {pagination}
          </>
        )}
        emptyComponent={
          <Box className={classes.emptyState}>
            <Typography variant="body1" color="textSecondary">
              No public collections found
            </Typography>
          </Box>
        }
      />
    </>
  );
};

const PublicCollectionsTab = () => {
  const classes = useStyles();

  const { publicCollections, isLoading, error } = useCollectionsStore();

  if (isLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Alert severity="error" className={classes.errorContainer}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <SearchProvider
        items={publicCollections}
        searchKeys={['name', 'description', 'creatorName']}
      >
        <PublicCollectionsContent />
      </SearchProvider>
    </Box>
  );
};

export default PublicCollectionsTab;

import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AccountCircle } from '@material-ui/icons';
import { showLoginDialog } from '../../../Redux/actions/ui';
import useCollectionsStore from '../state/collectionsStore';
import CollectionCard from './CollectionCard';
import FollowedCollectionCard from './FollowedCollectionCard';
import CollectionStatistics from '../components/CollectionStatistics';
import { PaginationController } from '../../../shared/pagination';
import {
  SearchProvider,
  SearchInput,
  useFilteredItems,
} from '../../../shared/UniversalSearch';
import { useSorting } from '../../../shared/sorting/state/useSorting';
import SortDropdown from '../../../shared/sorting/components/SortDropdown';
import FilterDropdown from '../components/FilterDropdown';
import UniversalButton from '../../../shared/components/UniversalButton';
import { createPriorityComparator } from '../../../shared/sorting/utils/priorityComparator';

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
    '& .MuiFormControl-root': {
      minWidth: 130,
      maxWidth: 130,
    },
  },
  filterDropdown: {
    display: 'flex',
    alignItems: 'center',
    '& .MuiFormControl-root': {
      minWidth: 180,
      maxWidth: 180,
    },
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
}));

// Sort configuration
const sortConfig = {
  fields: [
    { key: 'name', type: 'string', label: 'Name', path: 'name', defaultDirection: 'asc' },
    {
      key: 'modified',
      type: 'date',
      label: 'Date',
      path: 'sortDate',
      defaultDirection: 'desc',
    },
  ],
  defaultSort: {
    field: 'modified',
    direction: 'desc',
  },
  uiPattern: 'dropdown-headers',
};

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'following', label: 'Following' },
];

// Inner component that uses filtered items from UniversalSearch
const MyCollectionsContent = ({ visibilityFilter, setVisibilityFilter }) => {
  const classes = useStyles();
  const filteredCollections = useFilteredItems();
  const { activeSort, comparator, setSort, toggleDirection } = useSorting(sortConfig);
  const pendingDeletions = useCollectionsStore(
    (state) => state.pendingDeletions,
  );
  const followPendingIds = useCollectionsStore(
    (state) => state.followPendingIds,
  );
  const justCreatedId = useCollectionsStore((state) => state.justCreatedId);
  const clearJustCreated = useCollectionsStore(
    (state) => state.clearJustCreated,
  );

  // Clear justCreatedId on unmount
  useEffect(() => {
    return () => {
      clearJustCreated();
    };
  }, [clearJustCreated]);

  // Wrap comparator with priority comparator if justCreatedId exists
  const finalComparator = createPriorityComparator(comparator, justCreatedId);

  // Sort the filtered collections with priority
  const sortedCollections = [...filteredCollections].sort(finalComparator);

  // Handle sort change - clear justCreatedId when user explicitly changes sort
  const handleSortChange = (field) => {
    setSort(field);
    clearJustCreated();
  };

  const renderCollectionCard = (collection) => {
    if (collection.isFollowed) {
      return (
        <FollowedCollectionCard
          key={`followed-${collection.id}`}
          collection={collection}
          isPending={followPendingIds.has(collection.id)}
        />
      );
    }
    return (
      <CollectionCard
        key={collection.id}
        collection={collection}
        isPending={pendingDeletions.has(collection.id)}
      />
    );
  };

  return (
    <>
      <Box className={classes.searchSection}>
        <Box className={classes.searchInput}>
          <SearchInput
            placeholder="Search collections by name, description, or creator (use * for wildcards)..."
            controlsAlign="left"
            showEngineToggle={false}
          />
        </Box>
        <Box className={classes.filterDropdown}>
          <FilterDropdown
            options={VISIBILITY_OPTIONS}
            selectedValues={visibilityFilter}
            onChange={setVisibilityFilter}
            allLabel="All Collections"
            label="Filter By"
          />
        </Box>
        <Box className={classes.sortDropdown}>
          <SortDropdown
            fields={sortConfig.fields}
            activeField={activeSort.field}
            onFieldChange={handleSortChange}
            direction={activeSort.direction}
            onToggleDirection={toggleDirection}
          />
        </Box>
      </Box>

      <PaginationController
        data={sortedCollections}
        itemsPerPage={9}
        renderItem={renderCollectionCard}
        renderContainer={(children, pagination) => (
          <>
            <Box className={classes.collectionsGrid}>{children}</Box>
            {pagination}
          </>
        )}
        emptyComponent={
          <Box className={classes.emptyState}>
            <Typography variant="h6" gutterBottom>
              {visibilityFilter.size === 1 && visibilityFilter.has('following')
                ? 'No Followed Collections'
                : 'No Collections Found'}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {visibilityFilter.size === 1 && visibilityFilter.has('following')
                ? 'You are not following any collections yet. Browse public collections to find ones to follow.'
                : "You haven't created any collections yet. Start by creating your first collection to organize your datasets."}
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

  const statistics = useCollectionsStore((state) => state.statistics);
  const isLoading = useCollectionsStore((state) => state.isLoading);
  const error = useCollectionsStore((state) => state.error);
  const filteredUserCollections = useCollectionsStore(
    (state) => state.filteredUserCollections,
  );
  const followedCollections = useCollectionsStore(
    (state) => state.followedCollections,
  );
  const visibilityFilter = useCollectionsStore(
    (state) => state.visibilityFilter,
  );
  const setVisibilityFilter = useCollectionsStore(
    (state) => state.setVisibilityFilter,
  );

  const mergedCollections = useMemo(() => {
    let userCollectionsWithSortDate = filteredUserCollections.map((c) => ({
      ...c,
      sortDate: c.modifiedDate,
    }));

    let markedFollowed = followedCollections.map((c) => ({
      ...c,
      isFollowed: true,
      isPublic: true,
      sortDate: c.followDate || c.modifiedDate,
    }));

    let showOwned = visibilityFilter.has('public') || visibilityFilter.has('private');
    let showFollowing = visibilityFilter.has('following');

    if (showOwned && showFollowing) {
      return [...userCollectionsWithSortDate, ...markedFollowed];
    }
    if (showFollowing) {
      return markedFollowed;
    }
    if (showOwned) {
      return userCollectionsWithSortDate;
    }
    return [];
  }, [filteredUserCollections, followedCollections, visibilityFilter]);

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
            <UniversalButton
              variant="primary"
              size="medium"
              onClick={handleLoginClick}
              startIcon={<AccountCircle />}
            >
              Sign In
            </UniversalButton>
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
        <CollectionStatistics
          stats={[
            {
              value: statistics.totalCollections,
              label: 'Total Collections',
            },
            {
              value: statistics.publicCollections,
              label: 'Public Collections',
            },
            {
              value: statistics.privateCollections,
              label: 'Private Collections',
            },
            {
              value: statistics.totalDatasets,
              label: 'Total Datasets',
            },
          ]}
        />
      </Box>

      <SearchProvider
        items={mergedCollections}
        searchKeys={['name', 'description', 'ownerName', 'ownerAffiliation']}
        activationThreshold={2}
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

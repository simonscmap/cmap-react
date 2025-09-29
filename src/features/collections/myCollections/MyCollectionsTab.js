import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { showLoginDialog } from '../../../Redux/actions/ui';
import useCollectionsStore from '../state/collectionsStore';
import CollectionCard from './CollectionCard';
import CollectionStatistics from './CollectionStatistics';
import { PaginationController } from '../../../shared/pagination';

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

const MyCollectionsTab = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const { statistics, isLoading, error, filteredUserCollections } =
    useCollectionsStore();

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

      <PaginationController
        data={filteredUserCollections}
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
    </Box>
  );
};

export default MyCollectionsTab;

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { showLoginDialog } from '../../../Redux/actions/ui';
import useCollectionsStore from '../state/collectionsStore';
import CollectionCard from './CollectionCard';
import CollectionStatistics from './CollectionStatistics';

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

  const {
    getPaginatedUserCollections,
    statistics,
    isLoading,
    error,
    userCollectionsPagination,
    setLoading,
    setUserCollections,
    setError,
  } = useCollectionsStore();

  const paginatedCollections = getPaginatedUserCollections();

  useEffect(() => {
    if (user) {
      loadUserCollections();
    }
  }, [user]);

  const loadUserCollections = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call once collectionsApi is implemented
      // const response = await collectionsApi.getUserCollections(user.id);
      // setUserCollections(response.data);

      // Mock data for now
      const mockCollections = [
        {
          id: '1',
          name: 'Ocean Temperature Data',
          description:
            'Collection of temperature measurements from various oceanic regions',
          createdAt: '2025-09-20T10:30:00Z',
          lastModified: '2025-09-22T14:15:00Z',
          isPublic: true,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          creatorAffiliation: user.affiliation || 'Research Institution',
          datasetIds: ['dataset1', 'dataset2', 'dataset3'],
          datasets: [],
          previewCount: 15,
          copyCount: 3,
          hasInvalidDatasets: false,
        },
        {
          id: '2',
          name: 'Chlorophyll Studies',
          description: 'Private collection for ongoing chlorophyll research',
          createdAt: '2025-09-18T08:45:00Z',
          lastModified: '2025-09-23T16:20:00Z',
          isPublic: false,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          creatorAffiliation: user.affiliation || 'Research Institution',
          datasetIds: ['dataset4', 'dataset5'],
          datasets: [],
          previewCount: 8,
          copyCount: 1,
          hasInvalidDatasets: true,
        },
      ];

      setUserCollections(mockCollections);
    } catch (err) {
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

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

  if (paginatedCollections.length === 0) {
    return (
      <Box className={classes.container}>
        <Box className={classes.statisticsSection}>
          <CollectionStatistics statistics={statistics} />
        </Box>
        <Box className={classes.emptyState}>
          <Typography variant="h6" gutterBottom>
            No Collections Found
          </Typography>
          <Typography variant="body1" color="textSecondary">
            You haven't created any collections yet. Start by creating your
            first collection to organize your datasets.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography variant="h5" gutterBottom>
          My Collections
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage your personal dataset collections
        </Typography>
      </Box>

      <Box className={classes.statisticsSection}>
        <CollectionStatistics statistics={statistics} />
      </Box>

      <Grid container spacing={3} className={classes.collectionsGrid}>
        {paginatedCollections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <CollectionCard collection={collection} />
          </Grid>
        ))}
      </Grid>

      {/* TODO: Add pagination controls in future phase */}
    </Box>
  );
};

export default MyCollectionsTab;

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
          datasetIds: ['dataset1', 'dataset2', 'dataset3'],
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
          datasetIds: ['dataset4', 'dataset5'],
          hasInvalidDatasets: true,
        },
        {
          id: '3',
          name: 'Pacific Salinity Profiles',
          description:
            'Comprehensive salinity measurements across Pacific Ocean regions',
          createdAt: '2025-09-15T12:00:00Z',
          lastModified: '2025-09-21T09:30:00Z',
          isPublic: true,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: ['dataset6', 'dataset7', 'dataset8', 'dataset9'],
          hasInvalidDatasets: false,
        },
        {
          id: '4',
          name: 'Marine Biodiversity Index',
          description: 'Species diversity data from multiple marine ecosystems',
          createdAt: '2025-09-12T15:45:00Z',
          lastModified: '2025-09-20T11:00:00Z',
          isPublic: false,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: ['dataset10', 'dataset11'],
          hasInvalidDatasets: false,
        },
        {
          id: '5',
          name: 'Arctic Ice Coverage',
          description:
            'Historical and current Arctic sea ice extent measurements',
          createdAt: '2025-09-10T09:15:00Z',
          lastModified: '2025-09-24T13:45:00Z',
          isPublic: true,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: [
            'dataset12',
            'dataset13',
            'dataset14',
            'dataset15',
            'dataset16',
          ],
          hasInvalidDatasets: true,
        },
        {
          id: '6',
          name: 'Phytoplankton Distribution',
          description: 'Global phytoplankton biomass and distribution patterns',
          createdAt: '2025-09-08T14:20:00Z',
          lastModified: '2025-09-19T10:30:00Z',
          isPublic: false,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: ['dataset17'],
          hasInvalidDatasets: false,
        },
        {
          id: '7',
          name: 'Deep Ocean Currents',
          description:
            'Current velocity and direction measurements from deep ocean monitoring stations',
          createdAt: '2025-09-05T16:30:00Z',
          lastModified: '2025-09-18T08:15:00Z',
          isPublic: true,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: ['dataset18', 'dataset19', 'dataset20'],
          hasInvalidDatasets: false,
        },
        {
          id: '8',
          name: 'Coral Reef Health Monitoring',
          description:
            'Long-term monitoring data of coral reef ecosystems and health indicators',
          createdAt: '2025-09-03T11:00:00Z',
          lastModified: '2025-09-17T15:45:00Z',
          isPublic: false,
          creatorId: user.id,
          creatorName: user.name || 'Current User',
          datasetIds: ['dataset21', 'dataset22', 'dataset23', 'dataset24'],
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
        {/* <Typography variant="body1" color="textSecondary">
          Manage your personal dataset collections
        </Typography> */}
      </Box>

      <Box className={classes.statisticsSection}>
        <CollectionStatistics statistics={statistics} />
      </Box>

      <Box className={classes.collectionsGrid}>
        {paginatedCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </Box>

      {/* TODO: Add pagination controls in future phase */}
    </Box>
  );
};

export default MyCollectionsTab;

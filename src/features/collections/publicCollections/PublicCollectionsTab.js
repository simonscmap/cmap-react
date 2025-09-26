import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useCollectionsStore from '../state/collectionsStore';
import CollectionsTable from './CollectionsTable';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  searchField: {
    minWidth: 300,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.primary.light,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
    },
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

const PublicCollectionsTab = () => {
  const classes = useStyles();
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  const {
    publicCollections,
    filteredPublicCollections,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
  } = useCollectionsStore();

  // Initialize local search with store value
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  const handleSearchChange = (event) => {
    setLocalSearchQuery(event.target.value);
  };

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
      <Box className={classes.header}>
        {/* <Typography variant="h6" component="h2">
          Public Collections
        </Typography> */}
        {/* <TextField
          label="Search collections"
          variant="outlined"
          size="small"
          value={localSearchQuery}
          onChange={handleSearchChange}
          className={classes.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        /> */}
      </Box>

      {filteredPublicCollections.length === 0 && !isLoading ? (
        <Box className={classes.emptyState}>
          <Typography variant="body1" color="textSecondary">
            {searchQuery
              ? `No collections found matching "${searchQuery}"`
              : 'No public collections available'}
          </Typography>
        </Box>
      ) : (
        <CollectionsTable collections={filteredPublicCollections} />
      )}
    </Box>
  );
};

export default PublicCollectionsTab;

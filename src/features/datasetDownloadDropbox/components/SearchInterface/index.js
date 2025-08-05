import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SEARCH_ACTIVATION_THRESHOLD } from '../../constants/searchConstants';

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

const SearchInterface = ({ files }) => {
  const classes = useStyles();

  // Check if search should be active based on file count threshold
  const shouldShowSearch = files.length > SEARCH_ACTIVATION_THRESHOLD;

  if (!shouldShowSearch) {
    return null;
  }

  return (
    <Box className={classes.searchContainer}>
      {/* SearchInput component will be added in Task 4 */}
      <div>Search Interface Placeholder - Files: {files.length}</div>
      {/* PatternDisplay component will be added in Task 4 */}
    </Box>
  );
};

export default SearchInterface;
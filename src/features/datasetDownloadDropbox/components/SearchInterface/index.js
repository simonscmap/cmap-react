import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import {
  selectCurrentTab,
  selectMainFolder,
} from '../../state/selectors';
import { SEARCH_ACTIVATION_THRESHOLD } from '../../constants/searchConstants';
import SearchInput from '../SearchInput';

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
}));

const SearchInterface = ({ files, folderType, selectedFiles, onToggleFile }) => {
  const classes = useStyles();

  // Get current folder type
  const currentTab = useSelector(selectCurrentTab);
  const mainFolder = useSelector(selectMainFolder);
  const activeFolder = folderType || currentTab || mainFolder || 'rep';


  // Check if search should be active based on file count threshold
  const shouldShowSearch = files.length > SEARCH_ACTIVATION_THRESHOLD;

  if (!shouldShowSearch) {
    return null;
  }

  const folderDisplayName = activeFolder === 'rep' ? 'Main Files' : 'Raw Files';

  return (
    <Box className={classes.searchContainer}>
      <div className={classes.searchHeader}>
        <Typography variant="h6" className={classes.searchTitle}>
          Search {folderDisplayName}
        </Typography>
      </div>
      <SearchInput 
        files={files} 
        folderType={activeFolder} 
        selectedFiles={selectedFiles}
        onToggleFile={onToggleFile}
      />
    </Box>
  );
};

export default SearchInterface;

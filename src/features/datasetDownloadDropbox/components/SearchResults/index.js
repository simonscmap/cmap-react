import React from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import {
  selectSearchResults,
  selectSearchHighlightMatches,
  selectSearchQuery,
} from '../../state/selectors';
import { applyHighlights } from '../../utils/highlightUtils';
import { formatBytes } from '../../utils/fileUtils';
import SelectAllDropdown from '../SelectAllDropdown';

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
    maxHeight: 400,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper, // Use app's dark theme
    color: theme.palette.text.primary,
  },
  header: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper, // Remove grey background
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  table: {
    '& .MuiTableCell-head': {
      backgroundColor: theme.palette.background.paper, // Use app's dark theme
      color: theme.palette.text.primary,
      fontWeight: 600,
    },
    '& .MuiTableCell-root': {
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  row: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    cursor: 'pointer',
  },
  disabledRow: {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  highlight: {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    fontWeight: 600,
    padding: '0 2px',
    borderRadius: 2,
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  errorState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.error.main,
  },
  resultCount: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
}));

const HighlightedFilename = ({ filename, highlights }) => {
  const classes = useStyles();
  
  if (!highlights || highlights.length === 0) {
    return <span>{filename}</span>;
  }

  const parts = applyHighlights(filename, highlights);
  
  return (
    <span>
      {parts.map((part, index) => (
        part.highlighted ? (
          <span key={index} className={classes.highlight}>
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </span>
  );
};

const SearchResults = ({
  folderType,
  selectedFiles = [],
  onToggleFile,
  onSelectAll,
  onSelectAllInFolder,
  onClearPageSelections,
  onClearAll,
  areAllSelected = false,
  areIndeterminate = false,
  canSelectFile = () => true,
  isCurrentTabFileLimitReached = false,
  isCurrentTabSizeLimitReached = false,
  searchError = null,
}) => {
  const classes = useStyles();
  
  const searchResults = useSelector((state) => selectSearchResults(state, folderType));
  const highlightMatches = useSelector((state) => selectSearchHighlightMatches(state, folderType));
  const searchQuery = useSelector((state) => selectSearchQuery(state, folderType));

  // Create a lookup map for highlight data
  const highlightMap = React.useMemo(() => {
    const map = new Map();
    if (highlightMatches && highlightMatches.length > 0) {
      highlightMatches.forEach(match => {
        if (match.item && match.item.path) {
          map.set(match.item.path, match.highlights);
        }
      });
    }
    return map;
  }, [highlightMatches]);

  // Handle error state
  if (searchError) {
    return (
      <Paper className={classes.container}>
        <div className={classes.errorState}>
          <Typography variant="h6" color="error">
            Search Error
          </Typography>
          <Typography variant="body2">
            An error occurred while searching. Please try again.
          </Typography>
        </div>
      </Paper>
    );
  }

  // Handle empty results
  if (!searchResults || searchResults.length === 0) {
    // Only show empty state if there's an active query
    if (searchQuery && searchQuery.trim().length > 0) {
      return (
        <Paper className={classes.container}>
          <div className={classes.emptyState}>
            <Typography variant="h6">
              Nothing was found
            </Typography>
            <Typography variant="body2">
              No files match your search query &quot;{searchQuery}&quot;. Try a different search term.
            </Typography>
          </div>
        </Paper>
      );
    }
    return null; // Don't render anything if no query
  }

  return (
    <Paper className={classes.container}>
      <div className={classes.header}>
        <Typography variant="subtitle1" component="div">
          Search Results
          <Typography component="span" variant="body2" className={classes.resultCount} style={{ marginLeft: 8 }}>
            {searchResults.length} files
          </Typography>
        </Typography>
        {searchQuery && (
          <Typography variant="body2" className={classes.resultCount}>
            Matching &quot;{searchQuery}&quot;
          </Typography>
        )}
      </div>
      
      <TableContainer>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <SelectAllDropdown
                  areAllSelected={areAllSelected}
                  areIndeterminate={areIndeterminate}
                  onSelectPage={onSelectAll}
                  onSelectAll={onSelectAllInFolder}
                  onClearPage={onClearPageSelections}
                  onClearAll={onClearAll}
                  isCurrentTabFileLimitReached={isCurrentTabFileLimitReached}
                  isCurrentTabSizeLimitReached={isCurrentTabSizeLimitReached}
                />
              </TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {searchResults.map((file, index) => {
              const isSelected = selectedFiles.some((f) => f.path === file.path);
              const canSelect = canSelectFile(file);
              const highlights = highlightMap.get(file.path) || [];
              
              return (
                <TableRow
                  key={`search-result-${file.path}-${index}`}
                  className={canSelect ? classes.row : classes.disabledRow}
                  onClick={() => canSelect && onToggleFile(file)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={!canSelect}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <HighlightedFilename 
                      filename={file.name} 
                      highlights={highlights}
                    />
                  </TableCell>
                  <TableCell>
                    {file.sizeFormatted || formatBytes(file.size)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SearchResults;
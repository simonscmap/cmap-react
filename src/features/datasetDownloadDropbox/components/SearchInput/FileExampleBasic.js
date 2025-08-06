import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { getPatternHints } from '../../utils/searchUtils';

const FileExampleBasic = ({ searchableFiles }) => {
  if (!searchableFiles || searchableFiles.length === 0) {
    return null;
  }

  const patterns = getPatternHints(searchableFiles);
  const examples = [patterns.first, patterns.middle, patterns.last].filter(Boolean);

  return (
    <Box style={{ marginBottom: 16 }}>
      <Typography 
        variant="body2" 
        style={{ color: '#9dd162', marginBottom: 4 }}
      >
        Example files from this dataset: {examples.join(', ')}
      </Typography>
    </Box>
  );
};

export default FileExampleBasic;
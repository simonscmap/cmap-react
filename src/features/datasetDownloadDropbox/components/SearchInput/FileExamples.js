import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { getPatternHints } from '../../utils/searchUtils';

const FileExamples = ({ searchableFiles }) => {
  if (!searchableFiles || searchableFiles.length === 0) {
    return null;
  }

  const patterns = getPatternHints(searchableFiles);
  const examples = [patterns.first, patterns.middle, patterns.last].filter(Boolean);

  return (
    <Box 
      style={{ 
        marginBottom: 16, 
        padding: '8px 12px', 
        backgroundColor: '#154052',
        border: '1px solid #2c6b8f',
        borderRadius: 4,
      }}
    >
      <Typography 
        variant="caption" 
        style={{ 
          color: '#9dd162', 
          fontWeight: 500, 
          marginBottom: 4,
          display: 'block'
        }}
      >
        Example files from this dataset:
      </Typography>
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {examples.map((filename, index) => (
          <Typography
            key={index}
            variant="caption"
            style={{
              color: '#ffffff',
              backgroundColor: '#22547a',
              padding: '2px 6px',
              borderRadius: 3,
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}
          >
            {filename}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default FileExamples;
import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Box } from '@material-ui/core';
import {
  useRowCountsLoading,
  useStaleDatasets,
  queryRowCounts,
} from '../state/rowCountCalculationStore';

const baseStyle = {
  fontSize: '0.62rem',
  height: 'auto',
  minHeight: 32,
  fontWeight: 700,
  borderRadius: '6px',
  minWidth: 56,
  maxWidth: 110,
  padding: '4px 8px',
  textTransform: 'none',
  whiteSpace: 'normal',
  lineHeight: 1.2,
  overflowWrap: 'break-word',
};

const RecalculateAllButton = ({ constraints, className, style }) => {
  const rowCountsLoading = useRowCountsLoading();
  const staleDatasets = useStaleDatasets();

  if (staleDatasets.length === 0) {
    return null;
  }

  const handleClick = () => {
    queryRowCounts(constraints);
  };

  const mergedStyle = {
    ...baseStyle,
    backgroundColor: rowCountsLoading ? 'rgba(255, 255, 255, 0.2)' : '#bbdefb',
    color: rowCountsLoading ? 'rgba(255, 255, 255, 0.5)' : '#1565c0',
    ...style,
  };

  return (
    <Button
      variant="text"
      size="small"
      onClick={handleClick}
      disabled={rowCountsLoading}
      className={className}
      aria-label="Recalculate row counts for all stale datasets"
      style={mergedStyle}
    >
      {rowCountsLoading ? (
        <Box display="flex" alignItems="center" justifyContent="center">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            style={{ width: 16, height: 16, marginRight: 6, flexShrink: 0 }}
          >
            <CircularProgress size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} thickness={4} />
          </Box>
          <span>{staleDatasets.length} datasets remaining...</span>
        </Box>
      ) : (
        'Recalculate All'
      )}
    </Button>
  );
};

RecalculateAllButton.propTypes = {
  constraints: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default RecalculateAllButton;

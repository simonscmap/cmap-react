import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
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
  maxWidth: 80,
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
      {rowCountsLoading ? 'Calculating...' : 'Recalculate All'}
    </Button>
  );
};

RecalculateAllButton.propTypes = {
  constraints: PropTypes.object,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default RecalculateAllButton;

import React from 'react';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import useSpatialTemporalSearchStore from '../store/spatialTemporalSearchStore';

/**
 * OverlapModeCheckbox Component
 *
 * A single checkbox control for toggling between partial overlap and full containment modes
 * in spatial-temporal dataset searches. When checked, the search includes datasets with
 * any overlap; when unchecked, only datasets fully contained within the specified bounds
 * are included.
 *
 * @component
 * @returns {React.Element} A Material-UI FormControlLabel wrapping a Checkbox
 *
 * @example
 * <OverlapModeCheckbox />
 */
const OverlapModeCheckbox = () => {
  const includePartialOverlaps = useSpatialTemporalSearchStore(
    (state) => state.includePartialOverlaps,
  );
  const setIncludePartialOverlaps = useSpatialTemporalSearchStore(
    (state) => state.setIncludePartialOverlaps,
  );

  /**
   * Handle checkbox toggle
   * @param {React.ChangeEvent<HTMLInputElement>} event - Checkbox change event
   */
  const handleChange = (event) => {
    setIncludePartialOverlaps(event.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={includePartialOverlaps}
          onChange={handleChange}
          color="primary"
        />
      }
      label="Include partial overlaps"
    />
  );
};

export default OverlapModeCheckbox;

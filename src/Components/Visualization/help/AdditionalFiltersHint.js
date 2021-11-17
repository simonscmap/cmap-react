import React from 'react';
import HintContent from '../../Help/HintContent';

const AdditionalFiltersHint = () => {
  return (
    <HintContent>
      <h3>Additional Filters</h3>
      <p>
        Additional filters restrict the listed datasets to show only those that
        include data within specified time and space boundaries, by temporal and
        spatial resolution, and by data source and distributor. Datasets that
        include data within the specified time and space boundaries will be
        returned, including those datasets that contain data inside and outside
        of those parameters.
      </p>
    </HintContent>
  );
};

export default AdditionalFiltersHint;

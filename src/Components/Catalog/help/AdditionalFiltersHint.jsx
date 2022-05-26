import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

export default () => (
  <HintContent>
    <h3>Additional Filters</h3>
    <p>
      ‘Additional Filters’ restricts the list of datasets to include only those
      within the specified time and space boundaries. Datasets that include data
      within these boundaries will be returned, including those datasets that
      contain data inside and outside of those parameters.
    </p>
  </HintContent>
);

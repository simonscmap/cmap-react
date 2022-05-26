import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const ObservationDataHint = () => {
  return (
    <HintContent>
      <h3>Observation Datasets</h3>
      <p>
        Shows the number of observation datasets matching the search and filters
        specified. These datasets are listed directly below. ‘Hidden datasets’
        indicates the number of datasets that match the search and filters
        specified but are excluded from the list because they cannot be
        visualized on a chart. Hidden datasets can be accessed via the Simons
        CMAP Catalog page. Click on a dataset to reveal the variables contained
        in the dataset, and select a variable to plot.
      </p>
    </HintContent>
  );
};

export default ObservationDataHint;

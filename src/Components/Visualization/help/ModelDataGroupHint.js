import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const ModelDataGroupHint = () => {
  return (
    <HintContent>
      <h3>Model Datasets</h3>
      <p>
        Shows the number of model datasets matching the search and filters
        specified. These datasets are listed directly below. Click on a dataset
        to reveal the variables contained in the dataset, and select a variable
        to plot.
      </p>
    </HintContent>
  );
};

export default ModelDataGroupHint;

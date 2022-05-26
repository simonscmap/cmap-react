import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const SelectChartTypeHint = () => {
  return (
    <HintContent>
      <h3>Select Chart Type</h3>
      <p>
        Select the type of chart to use from a dropdown list of plots. Different
        chart types are listed for different variables to best represent the
        type of data being plotted.
      </p>
    </HintContent>
  );
};

export default SelectChartTypeHint;

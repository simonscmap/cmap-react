import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const PlotControlsHint = () => {
  return (
    <HintContent>
      <h3>Controls and Plot Options</h3>
      <p>
        Plot display options provide the ability to adjust plot details such as
        marker shape, size, color, colorscale, or palette. Available options
        vary by plot type. Hover over a button to learn its function. A button
        to download the included data as a csv file is present on all plot
        types.
      </p>
    </HintContent>
  );
};

export default PlotControlsHint;

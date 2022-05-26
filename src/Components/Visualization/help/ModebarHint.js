import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const ModeBarHint = () => {
  return (
    <HintContent>
      <h3>View Controls</h3>
      <p>
        Plot view controls adjust the view of the plot and are specific to chart
        type. Hover over a control to learn it’s function
      </p>
      <p>
        Click the camera to take a snapshot of the rendered plot, which will
        download to your computer as an SVG file.
      </p>
      <p>Most chart types include controls that:</p>
      <ul>
        <li>Zoom in/out</li>
        <li>Pan</li>
        <li>Select a section of the plot</li>
        <li>Adjust scale</li>
        <li>Select what is displayed when hovering over a data point</li>
      </ul>
    </HintContent>
  );
};

export default ModeBarHint;

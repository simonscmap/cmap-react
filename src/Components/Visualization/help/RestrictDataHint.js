import React from 'react';
import HintContent from '../../Help/HintContent';

const RestrictDataHint = () => {
  return (
    <HintContent>
      <h3>Restrict Data Plotted</h3>
      <p>
        Use the time and space boundary fields to restrict the data included in
        the plot. Alternatively, click on the pen icon to restrict the data
        included by drawing a region on the globe.
      </p>
    </HintContent>
  );
};

export default RestrictDataHint;

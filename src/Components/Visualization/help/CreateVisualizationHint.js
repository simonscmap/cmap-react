import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const CreateVisualizationHint = () => {
  return (
    <HintContent>
      <h3>Create Visualization</h3>
      <p>
        Creates a plot and replaces the globe view with a chart view in the
        center of the page. To toggle back to globe view from chart view, select
        the globe icon that will appear immediately to the right of this button.
        Once a plot has been created, a plot icon will appear in the same
        location and can be used to toggle back to chart view from globe view.
      </p>
    </HintContent>
  );
};

export default CreateVisualizationHint;

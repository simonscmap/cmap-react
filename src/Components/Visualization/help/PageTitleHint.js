import React from 'react';
import HintContent from '../../Help/HintContent';
import InlineVideo from '../../Help/InlineVideo';
import SeeAlso from './SeeAlso';

const PageTitleHint = () => {
  return (
    <HintContent>
      <h3>Charts and Plots Visualization</h3>
      <p>
        The Simons CMAP Visualization page is where you can quickly and easily
        visualize datasets that match your interests. Use the search and
        filtering options located on the left to identify datasets and variables
        that match your interests, set time and space boundaries if you wish,
        and select a chart type and then quickly and easily view the data.
      </p>
      <p>Once a plot is created you can:</p>
      <ul>
        <li>Download the plot</li>
        <li>
          Download the entire dataset or a subset of that data for further
          analysis
        </li>
        <li>
          Create additional plots from the same dataset or a different dataset
        </li>
      </ul>
      <h3>Video Tutorial</h3>
      <InlineVideo src={'https://player.vimeo.com/video/657984891'} />
      <SeeAlso />
    </HintContent>
  );
};

export default PageTitleHint;

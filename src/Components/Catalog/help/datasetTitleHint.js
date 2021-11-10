import React from 'react';
import HintContent from '../../Help/HintContent';
import SeeAlso from './seeAlso';

const DatasetTitleHint = () => {
  return (
    <HintContent>
      <h3>Dataset Title</h3>
      <p>Opens the catalog page for a given dataset which includes:</p>
      <ul>
        <li>Links to download the dataset and metadata </li>
        <li>A dataset description</li>
        <li>
          A list of relevant dataset attributes including dataset table names
          and start/end dates
        </li>
        <li>Information about dataset variables</li>
        <li>The dataset source and distributor </li>
        <li>How to acknowledge use of the dataset</li>
        <li>
          References Links to cruises that contributed data to the dataset
        </li>
      </ul>
      <SeeAlso />
    </HintContent>
  );
};

export default DatasetTitleHint;

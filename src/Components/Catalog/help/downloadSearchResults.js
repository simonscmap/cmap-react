import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const DownloadSearchResults = () => {
  return (
    <HintContent>
      <h3>Download Search Results</h3>
      <p>
        Download a .csv file containing metadata for all listed datasets. This
        includes:
      </p>
      <ul>
        <li>Dataset name and table name</li>
        <li>Information about when and where the data was collected.</li>
      </ul>
    </HintContent>
  );
};

export default DownloadSearchResults;

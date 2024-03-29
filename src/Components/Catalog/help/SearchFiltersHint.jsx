import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';

const SearchFiltersHint = () => {
  return (
    <HintContent>
      <h3>Search Filters</h3>
      <p>Filters refine the dataset list by:</p>
      <ul>
        <li>
          <em>Makes</em>: Type of data; model or observation.
        </li>
        <li>
          <em>Sensors</em>: Type of sensor used to collect the data.
        </li>
        <li>
          <em>Region</em>: Region of the ocean where the data was collected.
        </li>
      </ul>
    </HintContent>
  );
};

export default SearchFiltersHint;

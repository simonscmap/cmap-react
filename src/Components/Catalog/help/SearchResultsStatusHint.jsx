import React from 'react';
import HintContent from '../../Navigation/Help/HintContent';
import SeeAlso from './seeAlso';

const Hint = () => {
  return (
    <HintContent>
      <h3>Dataset Results Indicator</h3>
      <p>
        States the number of datasets matching the search and filters specified.
        These datasets are listed directly below.
      </p>
      <SeeAlso />
    </HintContent>
  );
};

export default Hint;

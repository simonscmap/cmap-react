import React, { useState } from 'react';
import { ShowChart } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Hide Plot Lines', 'Show Plot Lines'];

export const makeLinesControl = makeGenericToggleControl(ShowChart)(tooltip);

// hook returns [controlTuple, toggleState]
export const useLineControl = (initialState) => {
  let state = initialState === undefined ? true : initialState;
  let [showLinesState, setShowLines] = useState(state);
  let showLinesContolTuple = [makeLinesControl([showLinesState, setShowLines])];
  return [showLinesContolTuple, showLinesState];
};

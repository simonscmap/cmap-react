import React, { useState } from 'react';
import { Tune } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Hide Error Bar', 'Show Error Bar'];

export const makeErrorBarControl = makeGenericToggleControl(Tune)(tooltip);

// hook returns [controlTuple, toggleState]
export const useErrorBarControl = (initialState) => {
  let state = initialState === undefined ? true : initialState;
  let [errorBarState, setErrorBarState] = useState(state);
  let errorBarControlTuple = [
    makeErrorBarControl([errorBarState, setErrorBarState]),
  ];
  return [errorBarControlTuple, errorBarState];
};

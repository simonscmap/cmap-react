import React, { useState } from 'react';
import Rotate90DegreesCcwIcon from '@material-ui/icons/Rotate90DegreesCcw';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Switch Orientation', 'Switch Orientation'];

// pass a transform to the orientation control to switch state between zonal and meridional
let switchOrientation = (current) =>
  current === 'zonal' ? 'meridional' : 'zonal';

export const makeSwitchOrientationControlTuple = makeGenericToggleControl(
  Rotate90DegreesCcwIcon,
)(tooltip);

export const useOrientationControl = (initialState) => {
  if (initialState === undefined) {
    throw new Error('Expected initial state in useOrientationControl hook');
  }
  let onState = initialState;

  let [orientation, setOrientation] = useState(initialState);

  let orientationControlTuple = [
    makeSwitchOrientationControlTuple([
      orientation,
      setOrientation,
      switchOrientation,
      onState,
    ]),
  ];

  return [orientationControlTuple, orientation];
};

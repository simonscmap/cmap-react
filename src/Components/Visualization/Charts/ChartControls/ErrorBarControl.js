import React from 'react';
import { Tune } from '@material-ui/icons';
import { makeGenericToggleControl } from './GenericToggleControl';

let tooltip = ['Hide Error Bar', 'Show Error Bar'];

const makeErrorBarControls = makeGenericToggleControl(Tune)(tooltip);
export default makeErrorBarControls;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  InputLabel,
  MenuItem,
  Select,
  Typography,

  makeStyles,
} from '@material-ui/core';
import {
  datasetVariableSelect
} from '../../../Redux/actions/catalog';
import { safePath } from '../../../Utility/objectUtils';

const useStyles = makeStyles ((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '10px',
    marginRight: '10px'
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  }
}));

const SelectDatasetVariableForSampleVisualization = (props) => {
  const cl = useStyles();
  const dispatch = useDispatch();
  const visVars = useSelector (
    safePath ([
      'datasetDetailsPage',
      'visualizableVariables',
      'variables'
  ]));

  const selectedVisVar = useSelector ((state) =>
    state.datasetDetailsPage.visualizationSelection);

  const handleChange = (ev) => {
    const eValue = ev.target.value;
    if (eValue !== selectedVisVar) {
      dispatch (datasetVariableSelect(eValue));
    }
  };

  const selectOptions = visVars && visVars.map ((v, i) => {
    return (
      <MenuItem value={v.Short_Name} key={`menuItem${i}`}>
        {`${v.Long_Name} ("${v.Short_Name}")`}
      </MenuItem>
    );
  });

  if (!selectOptions) {
    return '';
  }

  return (
    <div className={cl.wrapper}>
      <div className={cl.inner}>
        <InputLabel>Select Variable for Sample Visualization</InputLabel>
        <Select
          value={selectedVisVar}
          onChange={handleChange}
          name="hasDepth"
          className={cl.select}
        >
          {selectOptions}
        </Select>
      </div>
    </div>
  );
}

export default SelectDatasetVariableForSampleVisualization;

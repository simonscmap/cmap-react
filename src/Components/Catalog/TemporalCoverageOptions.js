import React from 'react';
import { makeStyles } from '@material-ui/core';
import {
  Typography,
  TextField,
  Grid,
} from '@material-ui/core';
// New Drop Down
import { DropDownContainer } from '../UI/DropDown';


const useStyles = makeStyles ((theme) => ({
  formControl: {
    width: '90%',
    marginBottom: '6px',
  },
  searchSectionHeader: {
    color: theme.palette.primary.main,
    textAlign: 'left',
    marginBottom: '8px',
  },
  inputRow: {
    marginTop: '1em',
  },
}))

export const TemporalCoverageOptions = (props) => {
  const { timeStart, timeEnd, handleChangeSearchValue, } = props;
  const classes = useStyles ();
  return (
    <Grid
      item
      container
      xs={12}
      className={classes.searchPanelRow}
    >
      <Grid item xs={12}>
        <TextField
          name="timeStart"
          className={classes.formControl}
          id="date"
          label="Start Date"
          type="date"
          InputLabelProps={{
            shrink: true,
            style: {
              color: '#96CE57'
            }
          }}
          value={timeStart}
          onChange={handleChangeSearchValue}
          inputProps={{
            style: { fontSize: '16px' }
          }}
        />
      </Grid>

      <Grid item xs={12} className={classes.inputRow}>
        <TextField
          name="timeEnd"
          className={classes.formControl}
          id="date"
          label="End Date"
          type="date"
          InputLabelProps={{
            shrink: true,
            style: { color: '#96CE57'}
          }}
          inputProps={{
            style: { fontSize: '16px' }
          }}
          value={timeEnd}
          onChange={handleChangeSearchValue}
        />
      </Grid>
    </Grid>
  );
};

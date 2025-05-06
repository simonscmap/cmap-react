import React from 'react';
import { makeStyles } from '@material-ui/core';
import {
  Typography,
  TextField,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Grid,
} from '@material-ui/core';
// New Drop Down
import { DropDownContainer } from '../UI/DropDown';

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: '90%',
    marginBottom: '6px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  searchSectionHeader: {
    color: theme.palette.primary.main,
    textAlign: 'left',
    marginBottom: '8px',
  },
  selectControl: {
    width: '95%',
    textAlign: 'left',
  },
  selectLabel: {
    fontSize: '15px',
    color: '#96CE57', // olive
  },

  select: {
    fontSize: '15px',
  },
}));

export const SpatialCoverageOptions = (props) => {
  const {
    latStart,
    latEnd,
    lonStart,
    lonEnd,
    hasDepth,
    handleChangeSearchValue,
  } = props;
  const classes = useStyles();
  return (
    <Grid item container xs={12} className={classes.searchPanelRow}>
      <Grid item xs={6}>
        <TextField
          name="latStart"
          className={classes.formControl}
          label="Lat Start&deg;"
          type="number"
          inputProps={{
            min: -90,
            max: 90,
            style: { fontSize: '16px' },
          }}
          InputLabelProps={{
            shrink: true,
            style: {
              color: '#96CE57',
            },
          }}
          value={latStart}
          onChange={handleChangeSearchValue}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          name="latEnd"
          className={classes.formControl}
          label="Lat End&deg;"
          type="number"
          inputProps={{
            min: -90,
            max: 90,
            style: { fontSize: '16px' },
          }}
          InputLabelProps={{
            shrink: true,
            style: {
              color: '#96CE57',
            },
          }}
          value={latEnd}
          onChange={handleChangeSearchValue}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          name="lonStart"
          className={classes.formControl}
          label="Lon Start&deg;"
          type="number"
          inputProps={{
            min: -180,
            max: 180,
            style: { fontSize: '16px' },
          }}
          InputLabelProps={{
            shrink: true,
            style: {
              color: '#96CE57',
            },
          }}
          value={lonStart}
          onChange={handleChangeSearchValue}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField
          name="lonEnd"
          className={classes.formControl}
          label="Lon End&deg;"
          type="number"
          inputProps={{
            min: -180,
            max: 180,
            style: { fontSize: '16px' },
          }}
          InputLabelProps={{
            shrink: true,
            style: {
              color: '#96CE57',
            },
          }}
          value={lonEnd}
          onChange={handleChangeSearchValue}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl className={classes.selectControl}>
          <FormHelperText className={classes.selectLabel}>
            Depth Levels
          </FormHelperText>
          <Select
            value={hasDepth}
            onChange={handleChangeSearchValue}
            name="hasDepth"
            className={classes.select}
          >
            <MenuItem value="any" className={classes.select}>
              Any
            </MenuItem>
            <MenuItem value="yes" className={classes.select}>
              Multiple Levels
            </MenuItem>
            <MenuItem value="no" className={classes.select}>
              Surface Only
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

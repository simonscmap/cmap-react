import React, { useState } from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import { SwapVert } from '@material-ui/icons';
import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  OutlinedInput,
  Popover,
  withStyles,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '../../../../Redux/actions/ui';
import { chartControlPanelPopoverStyles } from '../chartStyles';

// validaiton helpers
const checkLocalZMin = (localMin, localMax) => {
  if (localMin > localMax) return `Min must be higher than max`;
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(localMin)) return 'Invalid value';
};

const checkLocalZMax = (localMin, localMax) => {
  if (localMin > localMax) return `Min must be higher than max`;
  if (!/^[-+]?[0-9]*\.?[0-9]+$/.test(localMax)) return 'Invalid value';
};

// Control Component
const ColorscaleRangeControl = (props) => {
  let { classes, rangeValues, setRangeValues, disable } = props;

  let [anchorElement, setAnchorElement] = useState(null);
  let dispatch = useDispatch();

  let [localZMin, setLocalZMin] = React.useState(rangeValues && rangeValues[0]);
  let [localZMax, setLocalZMax] = React.useState(rangeValues && rangeValues[1]);

  // when user selects
  const handleChoice = (option) => {
    // close the menu
    setAnchorElement(null);
    // set a loading message
    dispatch(setLoadingMessage('Re-rendering'));
    // set the palette
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      setRangeValues([localZMin, localZMax]);
    }, 100);
  };

  // when the paletteAnchorElement is set, the menu opens
  let handleOpen = (event) => setAnchorElement(event.currentTarget);
  let handleClose = () => setAnchorElement(null);

  let popoverId = !!anchorElement ? 'colorscale-range-popover' : undefined;

  let localMinErrorMessage = checkLocalZMin(localZMin, localZMax);
  let localMaxErrorMessage = checkLocalZMax(localZMin, localZMax);
  let hasError = !!(localMinErrorMessage || localMaxErrorMessage);

  const handleLocalZConfirm = () => {
    handleChoice([localZMin, localZMax]);
    handleClose();
  };

  return (
    <React.Fragment>
      <ControlButtonTemplate
        tooltipContent={'Change Colorscale Range'}
        onClick={handleOpen}
        icon={SwapVert}
        disable={disable}
      />

      <Popover
        id={popoverId}
        open={!!anchorElement}
        anchorEl={anchorElement}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          className: classes.grayBackground,
        }}
        classes={{
          root: classes.setPopoverZ,
        }}
      >
        <div className={classes.popover}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl variant="outlined" error={!!localMinErrorMessage}>
                <InputLabel htmlFor="z-min-input">Min</InputLabel>
                <OutlinedInput
                  id="z-min-input"
                  value={localZMin}
                  onChange={(event) => setLocalZMin(event.target.value)}
                  aria-describedby="local-zmin-error"
                  labelWidth={36}
                  name="local-zmin"
                />
                <FormHelperText id="local-zmin-error">
                  {localMinErrorMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl variant="outlined" error={!!localMaxErrorMessage}>
                <InputLabel htmlFor="z-max-input">Max</InputLabel>
                <OutlinedInput
                  id="z-max-input"
                  value={localZMax}
                  onChange={(event) => setLocalZMax(event.target.value)}
                  aria-describedby="local-zmax-error"
                  labelWidth={36}
                  name="local-zmax"
                />
                <FormHelperText id="local-zmax-error">
                  {localMaxErrorMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={7}></Grid>

            <Grid item xs={2}>
              <Button onClick={handleClose}>Cancel</Button>
            </Grid>

            <Grid item xs={2}>
              <Button
                color="primary"
                onClick={handleLocalZConfirm}
                disabled={hasError}
              >
                Confirm
              </Button>
            </Grid>

            <Grid item xs={1}></Grid>
          </Grid>
        </div>
      </Popover>
    </React.Fragment>
  );
};

const StyledColorscaleRangeControl = withStyles(chartControlPanelPopoverStyles)(
  ColorscaleRangeControl,
);

export default StyledColorscaleRangeControl;

export const useColorscaleRangeControl = (defaultValues) => {
  let [rangeValues, setRangeValues] = useState(defaultValues);

  let controlTuple = [
    StyledColorscaleRangeControl,
    { rangeValues, setRangeValues },
  ];

  return [controlTuple, rangeValues];
};

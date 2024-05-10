// Chart Control for choosing Palette
// Renders a chart control button, and a mui Menu which opens when the button is clicked
// connects to redux to dispatch loading messages
// NOTE: Palette corresponds to the "colorscale" option for plotly
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
import { Gamepad } from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '../../../../Redux/actions/ui';
import { chartControlPanelStyles } from '../chartStyles';
import ControlButtonTemplate from './ControlButtonTemplate';

function usePreviousSize(value) {
  let size = value ? value.size : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = size;
  });
  return ref.current;
}

function usePreviousColor(value) {
  let color = value ? value.color : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = color;
  });
  return ref.current;
}

function usePreviousOpacity(value) {
  let opacity = value ? value.opacity : null;
  const ref = useRef();
  useEffect(() => {
    ref.current = opacity;
  });
  return ref.current;
}


const MarkerOptions = (props) => {
  let {
    setMarkerOptions, // a useState setter provided by parent
    markerOptions,
    classes,
    disable, // we may want to hide this cotrol in centain tabbed contexts
  } = props;

  const [anchorElement, setAnchorElement] = useState(null);

  let dispatch = useDispatch();

  // when the paletteAnchorElement is set, the menu opens
  let handleOpen = (event) => {
    setAnchorElement(event.currentTarget);
  };

  // when user clicks a palette option from the menu
  const handleChoice = (option) => {
    // close the menu
    setAnchorElement(null);
    // set a loading message
    dispatch(setLoadingMessage('Re-rendering'));
    // set the palette
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      setMarkerOptions(option);
    }, 100);
  };

  const [localMarkerOpacity, setLocalMarkerOpacity] = React.useState(
    markerOptions && markerOptions.opacity,
  );
  const [localMarkerColor, setLocalMarkerColor] = React.useState(
    markerOptions && markerOptions.color,
  );
  const [localMarkerSize, setLocalMarkerSize] = React.useState(
    markerOptions && markerOptions.size,
  );

  var previousOpacity = usePreviousOpacity(markerOptions);
  var previousColor = usePreviousColor(markerOptions);
  var previousSize = usePreviousSize(markerOptions);

  useEffect(() => {
    if (markerOptions) {
      if (markerOptions.opacity !== previousOpacity) {
        setLocalMarkerOpacity(markerOptions.opacity);
      }

      if (markerOptions.color !== previousColor) {
        setLocalMarkerColor(markerOptions.color);
      }

      if (markerOptions.size !== previousSize) {
        setLocalMarkerSize(markerOptions.size);
      }
    }
  }, [markerOptions, previousOpacity, previousColor, previousSize]);

  const markerPopoverOpen = !!anchorElement;
  const markerPopoverID = markerPopoverOpen ? 'marker-popover' : undefined;

  const handleMarkerOptionsClose = () => {
    setAnchorElement(null);
  };

  const checkLocalMarkerOpacity = () => {
    if (
      localMarkerOpacity < 0.1 ||
      localMarkerOpacity > 1 ||
      !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerOpacity)
    ) {
      return 'Opacity should be 0.1 to 1';
    }
  };

  const checkLocalMarkerSize = () => {
    if (
      localMarkerSize < 1 ||
      localMarkerSize > 18 ||
      !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerSize)
    ) {
      return 'Size should be 1 to 18';
    }
  };

  const markerOptionsValidations = [
    checkLocalMarkerOpacity(),
    checkLocalMarkerSize(),
  ];

  const [localMarkerOpacityMessage, localMarkerSizeMessage] =
    markerOptionsValidations;

  const handleLocalMarkerOptionsConfirm = () => {
    handleChoice({
      opacity: localMarkerOpacity,
      color: localMarkerColor,
      size: localMarkerSize,
    });
    handleMarkerOptionsClose();
  };

  return (
    <React.Fragment>
      <ControlButtonTemplate
        tooltipContent={'Marker Options'}
        onClick={handleOpen}
        icon={Gamepad}
        disable={disable}
      />

      <Popover
        id={markerPopoverID}
        open={markerPopoverOpen}
        anchorEl={anchorElement}
        onClose={handleMarkerOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          root: classes.setPopoverZ,
        }}
        PaperProps={{
          className: classes.grayBackground,
        }}
      >
        <div className={classes.popover}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl
                variant="outlined"
                error={Boolean(localMarkerOpacityMessage)}
              >
                <InputLabel htmlFor="local-marker-opacity">Opacity</InputLabel>
                <OutlinedInput
                  id="local-marker-opacity"
                  value={localMarkerOpacity}
                  onChange={(event) =>
                    setLocalMarkerOpacity(event.target.value)
                  }
                  aria-describedby="local-marker-opacity"
                  labelWidth={44}
                  name="local-marker-opacity"
                />
                <FormHelperText id="local-marker-opacity-error">
                  {localMarkerOpacityMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl
                variant="outlined"
                // error={Boolean(zMaxMessage)}
              >
                <InputLabel htmlFor="local-marker-size">Size</InputLabel>
                <OutlinedInput
                  error={Boolean(localMarkerSizeMessage)}
                  id="local-marker-size"
                  value={localMarkerSize}
                  onChange={(event) => setLocalMarkerSize(event.target.value)}
                  aria-describedby="local-marker-size"
                  labelWidth={36}
                  name="local-marker-size"
                />
                <FormHelperText id="local-marker-size-error">
                  {localMarkerSizeMessage}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.colorForm}>
                <InputLabel htmlFor="z-min-input">Color</InputLabel>
                <OutlinedInput
                  type="color"
                  id="marker-color"
                  value={localMarkerColor}
                  onChange={(event) => setLocalMarkerColor(event.target.value)}
                  aria-describedby="local-marker-color"
                  labelWidth={44}
                  name="local-marker-color"
                />
              </FormControl>
            </Grid>

            <Grid item xs={1}></Grid>

            <Grid item xs={2}>
              <Button onClick={handleMarkerOptionsClose}>Cancel</Button>
            </Grid>

            <Grid item xs={2}>
              <Button
                color="primary"
                onClick={handleLocalMarkerOptionsConfirm}
                disabled={Boolean(
                  localMarkerOpacityMessage || localMarkerSizeMessage,
                )}
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

const ConnectedMarkerOptions = withStyles(chartControlPanelStyles)(
  MarkerOptions,
);

export default ConnectedMarkerOptions;

// hook returns [controlTuple, toggleState]
export const useMarkerOptions = (initialState) => {
  // const blue = 'rgb(105, 255, 242)';
  const green = 'rgb(161, 246, 64)';
  const defaultMarkerState = {
    opacity: 0.7,
    color: green,
    size: 6
  };

  // TODO incorporate initialState

  let [markerOptions, setMarkerOptions] = useState(defaultMarkerState);

  const markerControlTuple = [
    ConnectedMarkerOptions,
    { setMarkerOptions, markerOptions },
  ];
  return [markerControlTuple, markerOptions];
};

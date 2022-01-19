// Chart Control for choosing Palette
// Renders a chart control button, and a mui Menu which opens when the button is clicked
// connects to redux to dispatch loading messages
// NOTE: Palette corresponds to the "colorscale" option for plotly
import React, { useState } from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import { Palette } from '@material-ui/icons';
import { Menu, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import { chartControlPaletteMenu } from '../chartStyles';
import colorscaleOptions from './colorScaleOptions';
import { setLoadingMessage } from '../../../../Redux/actions/ui';
import { useDispatch } from 'react-redux';

const PaletteControl = (props) => {
  let {
    classes,
    setPalette, // a useState setter provided by parent
    disable, // in tabbed context we sometimes want to disable the contol
  } = props;

  let dispatch = useDispatch();

  const [paletteAnchorElement, setPaletteAnchorElement] = useState(null);

  // when the paletteAnchorElement is set, the menu opens
  let handleOpenPalette = (event) => {
    setPaletteAnchorElement(event.currentTarget);
  };

  // when user clicks a palette option from the menu
  const handlePaletteChoice = (option) => {
    // close the menu
    setPaletteAnchorElement(null);
    // set a loading message
    dispatch(setLoadingMessage('Re-rendering'));
    // set the palette
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      setPalette(option);
    }, 100);
  };

  return (
    <React.Fragment>
      <ControlButtonTemplate
        tooltipContent={'Change Palette'}
        onClick={handleOpenPalette}
        icon={Palette}
        disable={disable}
      />
      <Menu
        id="palette-option-menu"
        anchorEl={paletteAnchorElement}
        keepMounted
        open={!!paletteAnchorElement}
        onClose={() => setPaletteAnchorElement(null)}
        className={classes.colorscaleMenu}
        MenuListProps={{
          className: classes.grayBackground,
        }}
      >
        {colorscaleOptions.map((option, index) => (
          <MenuItem
            onClick={() =>
              handlePaletteChoice(option === 'Default' ? 'heatmap' : option)
            }
            key={index}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

const StyledPaletteControl = withStyles(chartControlPaletteMenu)(
  PaletteControl,
);

export default StyledPaletteControl;

// hook returns [controlTuple, toggleState]
export const usePaletteControl = (initialState) => {
  let defaultState = initialState === undefined ? 'heatmap' : initialState;
  let [palette, setPalette] = useState(defaultState);
  let paletteControlTuple = [StyledPaletteControl, { setPalette }];
  return [paletteControlTuple, palette];
};

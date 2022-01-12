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
import { setLoadingMessage } from '../../../Redux/actions/ui';
import { connect } from 'react-redux';

let mapDispatchToProps = {
  setLoadingMessage,
}

const PaletteControl = (props) => {
  let {
    classes,
    setLoadingMessage, // dispatch
    setPalette // a useState setter provided by parent
  } = props;

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
    setLoadingMessage('Re-rendering');
    // set the palette
    setTimeout(() => {
      window.requestAnimationFrame(() => props.setLoadingMessage(''));
      setPalette(option);
    }, 100);
  };

  return (
    <React.Frament>
      <ControlButtonTemplate
        tooltipContent={'Change Palette'}
        onClick={handleOpenPalette}
        icon={Palette}
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
    </React.Frament>
  );
};

export default connect(null, mapDispatchToProps)(withStyles(chartControlPaletteMenu)(PaletteControl));

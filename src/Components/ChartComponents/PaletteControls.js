import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import { Palette } from '@material-ui/icons';

const styles = theme => ({
    colorscaleMenu: {
        maxHeight: '400px'
    },

    iconButtonWrapper: {
        display: 'inline-block'
    }
})

const colorscaleOptions = [
    'Greys', 
    'YlGnBu', 
    'Greens', 
    'YlOrRd',
    'Bluered',
    'RdBu',
    'Reds',
    'Blues',
    'Picnic',
    'Rainbow',
    'Portland',
    'Jet',
    'Hot',
    'Blackbody',
    'Earth',
    'Electric',
    'Viridis',
    'Cividis'];

const PaletteControls = (props) => {

    const { classes, disabled } = props;

    const [paletteAnchorElement, setPaletteAnchorElement] = useState(null);

    if(disabled){
        return (
            <Tooltip title='Change Palette'>
                <div className={classes.iconButtonWrapper}>
                <IconButton disabled={disabled} color='secondary' onClick={handleOpenPalette} className={classes.iconButton}>
                    <Palette/>
                </IconButton>
                </div>
            </Tooltip>
        )
    }

    let handleOpenPalette = (event) => {
        setPaletteAnchorElement(event.currentTarget);
    }

    let handlePaletteChoice = (option) => {
        setPaletteAnchorElement(null);
        props.handlePaletteChoice(option);
    }

    return (
        <React.Fragment>
            <Tooltip title='Change Palette'>
                <IconButton disabled={disabled} color='secondary' onClick={handleOpenPalette} className={classes.iconButton}>
                    <Palette/>
                </IconButton>
            </Tooltip>
            <Menu
                id="simple-menu"
                anchorEl={paletteAnchorElement}
                keepMounted
                open={Boolean(paletteAnchorElement)}
                onClose={() => setPaletteAnchorElement(null)}
                className={classes.colorscaleMenu}
            >
                {colorscaleOptions.map((option, index) => (
                    <MenuItem onClick={() => handlePaletteChoice(option)} key={index}>{option}</MenuItem>
                ))}
                
            </Menu>
        </React.Fragment>
    )
}

export default withStyles(styles)(PaletteControls);
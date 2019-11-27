import React, { useState, useEffect, useRef } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormHelperText from '@material-ui/core/FormHelperText';
import Button from '@material-ui/core/Button';
import { DateRange, Waves, CloudDownload, Palette, SwapVert, Gamepad, LineWeight, Rotate90DegreesCcw, Info } from '@material-ui/icons';

import colors from '../../Enums/colors';

import { ButtonGroup } from '@material-ui/core';

const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white'
    },

    popover: {
        width: '470px',
        height: '120px',
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2.5),
        paddingRight: theme.spacing(2.5)
    },

    iconButton: {
        boxShadow: '0px 1px 1px 1px #242424',
    },

    colorForm: {
        width: '100%'
    },

    lastIcon: {
        borderTopRightRadius: '10%',
        borderBottomRightRadius: '10%'
    },

    buttonGroup: {
        display: 'block',
        margin: '0px auto 8px auto',
        maxWidth: '700px'
    },

    depressed: {
        boxShadow: 'inset 1px 1px 5px #262626'
    },

    colorscaleMenu: {
        maxHeight: '400px'
    },
})

const colorscaleOptions = [
    'Default',
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

function usePreviousSize(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function usePreviousColor(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function usePreviousOpacity(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const ChartControlPanel = (props) => {

    const { 
        classes, 
        onToggleSplitByDate,
        splitByDate,
        onToggleSplitByDepth,
        splitByDepth,
        onToggleSplitBySpace,
        splitBySpace,
        switchOrientation,
        orientation, 
        downloadCsv, 
        handleZValueConfirm,
        zValues,
        markerOptions,
        handleMarkerOptionsConfirm,
    } = props;

    const [paletteAnchorElement, setPaletteAnchorElement] = useState(null);

    let handleOpenPalette = (event) => {
        setPaletteAnchorElement(event.currentTarget);
    }

    // Local version, not from props
    let handlePaletteChoice = (option) => {
        setPaletteAnchorElement(null);
        props.handlePaletteChoice(option);
    }

    const [zScalePopoverAnchorElement, setZScalePopoverAnchorElement] = React.useState(null);
    const [localZMin, setLocalZMin] = React.useState(zValues && zValues[0]);
    const [localZMax, setLocalZMax] = React.useState(zValues && zValues[1]);

    const zScalePopoverOpen = Boolean(zScalePopoverAnchorElement);
    const zScalePopoverID = zScalePopoverOpen ? 'zscale-popover' : undefined;

    const handleZScalePopoverClose = () => {
        setZScalePopoverAnchorElement(null);
    };
    
    const checkLocalZMin = () => {
        if(localZMin > localZMax) return `Min must be higher than max`;
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMin)) return 'Invalid value';
    }

    const checkLocalZMax = () => {
        if(localZMin > localZMax) return `Min must be higher than max`;
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(localZMax)) return 'Invalid value';
    }

    const zScaleValidations = [
        checkLocalZMin(),
        checkLocalZMax()
    ];

    const [
        zMinMessage,
        zMaxMessage
    ] = zScaleValidations;

    const handleLocalZConfirm = () => {
        handleZValueConfirm([localZMin, localZMax]);
        handleZScalePopoverClose();
    }

    const [markerOptionsAnchorElement, setMarkerOptionsAnchorElement] = React.useState(null);
    const [localMarkerOpacity, setLocalMarkerOpacity] = React.useState(markerOptions && markerOptions.opacity);
    const [localMarkerColor, setLocalMarkerColor] = React.useState(markerOptions && markerOptions.color);
    const [localMarkerSize, setLocalMarkerSize] = React.useState(markerOptions && markerOptions.size);

    if(markerOptions){
        var previousOpacity = usePreviousOpacity(markerOptions.opacity);
        var previousColor = usePreviousColor(markerOptions.color);
        var previousSize = usePreviousSize(markerOptions.size);
        
        useEffect(() => {
            if(markerOptions.opacity !== previousOpacity){
                setLocalMarkerOpacity(markerOptions.opacity);
            }
    
            if(markerOptions.color !== previousColor){
                setLocalMarkerColor(markerOptions.color);
            }
    
            if(markerOptions.size !== previousSize){
                setLocalMarkerSize(markerOptions.size);
            }
        })
    }


    const markerPopoverOpen = Boolean(markerOptionsAnchorElement);
    const markerPopoverID = markerPopoverOpen ? 'marker-popover' : undefined;

    const handleMarkerOptionsClose = () => {
        setMarkerOptionsAnchorElement(null);
    }

    const checkLocalMarkerOpacity = () => {
        if(localMarkerOpacity < 0.1 || localMarkerOpacity > 1 || !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerOpacity)){
            return 'Opacity should be 0.1 to 1'
        }
    }

    const checkLocalMarkerSize = () => {
        if(localMarkerSize < 1 || localMarkerSize > 18 || !/^[-+]?[0-9]*\.?[0-9]+$/.test(localMarkerSize)){
            return 'Size should be 1 to 18'
        }
    }

    const markerOptionsValidations = [
        checkLocalMarkerOpacity(),
        checkLocalMarkerSize()
    ]

    const [
        localMarkerOpacityMessage,
        localMarkerSizeMessage
    ] = markerOptionsValidations;

    const handleLocalMarkerOptionsConfirm = () => {
        handleMarkerOptionsConfirm({opacity: localMarkerOpacity, color: localMarkerColor, size: localMarkerSize});
        handleMarkerOptionsClose();
    }

    return (
        <React.Fragment>
            <ButtonGroup className={classes.buttonGroup}>

                {Boolean(onToggleSplitByDate) && 
                    <Tooltip placement='top' title='Split By Date'>
                        <IconButton color='inherit' className={`${classes.iconButton} ${splitByDate && classes.depressed}`} 
                            onClick={onToggleSplitByDate}
                        >
                            <DateRange/>
                        </IconButton>
                    </Tooltip>
                }
{/* 
                {Boolean(onToggleSplitByDepth) && 
                    <Tooltip placement='top' title='Split By Depth'>
                        <IconButton color='inherit' className={`${classes.iconButton} ${splitByDepth && classes.depressed}`} 
                            onClick={onToggleSplitByDepth}
                        >
                            <Waves/>
                        </IconButton>
                    </Tooltip>
                } */}

                {Boolean(onToggleSplitBySpace) && 
                    <Tooltip placement='top' title={orientation === 'zonal' ? 'Split by Latitude' : 'Split by Longitude'}>
                        <IconButton color='inherit' className={`${classes.iconButton} ${splitBySpace && classes.depressed}`} 
                            onClick={onToggleSplitBySpace}
                        >
                            <LineWeight/>
                        </IconButton>
                    </Tooltip>
                }

                {/* {Boolean(switchOrientation) && 
                    <Tooltip placement='top' title={orientation === 'zonal' ? 'Switch to Meridional' : 'Switch to Zonal'}>
                        <IconButton color='inherit' className={classes.iconButton} 
                            onClick={switchOrientation}
                        >
                            <Rotate90DegreesCcw/>
                        </IconButton>
                    </Tooltip>
                } */}

                <Tooltip placement='top' title='Download CSV'>
                    <IconButton color='inherit' onClick={downloadCsv} className={classes.iconButton} >
                        <CloudDownload/>
                    </IconButton>
                </Tooltip>

                {Boolean(handleZValueConfirm) &&
                    <Tooltip title='Change Colorscale Range' placement='top'>
                        <IconButton color='inherit' onClick={(event) => setZScalePopoverAnchorElement(event.currentTarget)} className={classes.iconButton}>
                            <SwapVert/>
                        </IconButton>
                    </Tooltip>
                }

                {Boolean(props.handlePaletteChoice) &&
                    <Tooltip title='Change Palette' placement='top'>
                        <IconButton disabled={!Boolean(props.handlePaletteChoice)} color='inherit' onClick={handleOpenPalette} className={classes.iconButton}>
                            <Palette/>
                        </IconButton>                
                    </Tooltip>      
                }

                {Boolean(props.handleMarkerOptionsConfirm) &&
                    <Tooltip title='Marker Options' placement='top'>
                        <IconButton color='inherit' onClick={(event) => setMarkerOptionsAnchorElement(event.currentTarget)} className={`${classes.iconButton} ${classes.lastIcon}`} >
                            <Gamepad/>
                        </IconButton>                
                    </Tooltip>
                }

                {/* <Tooltip title='Plot Info' placement='top'>
                    <IconButton color='inherit' onClick={() => console.log('Info!')} className={`${classes.iconButton}`} >
                        <Info/>
                    </IconButton>                
                </Tooltip> */}
                
            </ButtonGroup>
            
            <Menu
                id="simple-menu"
                anchorEl={paletteAnchorElement}
                keepMounted
                open={Boolean(paletteAnchorElement)}
                onClose={() => setPaletteAnchorElement(null)}
                className={classes.colorscaleMenu}
            >
                {colorscaleOptions.map((option, index) => (
                    <MenuItem onClick={() => handlePaletteChoice(option === 'Default' ? 'heatmap' : option)} key={index}>{option}</MenuItem>
                ))}
                
            </Menu>
            
            {/* zscale popover */}
            <Popover
                id={zScalePopoverID}
                open={zScalePopoverOpen}
                anchorEl={zScalePopoverAnchorElement}
                onClose={handleZScalePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className={classes.popover}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                error={Boolean(zMinMessage)} 
                            >
                                <InputLabel htmlFor='z-min-input' >Min</InputLabel>
                                <OutlinedInput
                                    id='z-min-input'
                                    value={localZMin}
                                    onChange={(event) => setLocalZMin(event.target.value)}
                                    aria-describedby='local-zmin-error'
                                    labelWidth={36}
                                    name='local-zmin'
                                />
                                <FormHelperText id='local-zmin-error'>{zMinMessage}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                error={Boolean(zMaxMessage)} 
                            >
                                <InputLabel htmlFor='z-max-input' >Max</InputLabel>
                                <OutlinedInput
                                    id='z-max-input'
                                    value={localZMax}
                                    onChange={(event) => setLocalZMax(event.target.value)}
                                    aria-describedby="local-zmax-error"
                                    labelWidth={36}
                                    name='local-zmax'
                                />
                                <FormHelperText id="local-zmax-error">{zMaxMessage}</FormHelperText>
                            </FormControl>
                        </Grid> 

                        <Grid item xs={7}>
                        </Grid>

                        <Grid item xs={2}>
                            <Button onClick={handleZScalePopoverClose}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid item xs={2}>
                            <Button 
                                color='primary'
                                onClick={handleLocalZConfirm}
                                disabled={Boolean(zMinMessage || zMaxMessage)}
                            >
                                Confirm
                            </Button>
                        </Grid> 

                        <Grid item xs={1}>
                        </Grid>

                    </Grid>                    
                </div>
            </Popover>
                
            {/* Marker popover */}
            <Popover
                id={markerPopoverID}
                open={markerPopoverOpen}
                anchorEl={markerOptionsAnchorElement}
                onClose={handleMarkerOptionsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <div className={classes.popover}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                error={Boolean(localMarkerOpacityMessage)} 
                            >
                                <InputLabel htmlFor='local-marker-opacity' >Opacity</InputLabel>
                                <OutlinedInput
                                    id='local-marker-opacity'
                                    value={localMarkerOpacity}
                                    onChange={(event) => setLocalMarkerOpacity(event.target.value)}
                                    aria-describedby='local-marker-opacity'
                                    labelWidth={44}
                                    name='local-marker-opacity'
                                />
                            <FormHelperText id="local-marker-opacity-error">{localMarkerOpacityMessage}</FormHelperText>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                // error={Boolean(zMaxMessage)} 
                            >
                                <InputLabel htmlFor='local-marker-size' >Size</InputLabel>
                                <OutlinedInput
                                    error={Boolean(localMarkerSizeMessage)}
                                    id='local-marker-size'
                                    value={localMarkerSize}
                                    onChange={(event) => setLocalMarkerSize(event.target.value)}
                                    aria-describedby="local-marker-size"
                                    labelWidth={36}
                                    name='local-marker-size'
                                />
                                <FormHelperText id="local-marker-size-error">{localMarkerSizeMessage}</FormHelperText>
                            </FormControl>
                        </Grid> 

                        <Grid item xs={6}>
                            <FormControl 
                                variant='outlined'
                                className={classes.colorForm}
                            >
                                <InputLabel htmlFor='z-min-input'>Color</InputLabel>
                                <OutlinedInput
                                    type='color'
                                    id='marker-color'
                                    value={localMarkerColor}
                                    onChange={(event) => setLocalMarkerColor(event.target.value)}
                                    aria-describedby='local-marker-color'
                                    labelWidth={44}
                                    name='local-marker-color'
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={1}></Grid>

                        <Grid item xs={2}>
                            <Button onClick={handleMarkerOptionsClose}>
                                Cancel
                            </Button>
                        </Grid>

                        <Grid item xs={2}>
                            <Button 
                                color='primary'
                                onClick={handleLocalMarkerOptionsConfirm}
                                disabled={Boolean(localMarkerOpacityMessage || localMarkerSizeMessage)}
                            >
                                Confirm
                            </Button>
                        </Grid> 

                        <Grid item xs={1}>
                        </Grid>

                    </Grid>                    
                </div>
            </Popover>
        </React.Fragment>
    )
}

export default withStyles(styles)(ChartControlPanel);
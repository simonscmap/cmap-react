// Select viz type and create viz button

import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Paper, Grid, MenuItem, FormControl, InputLabel, Button, Tooltip } from '@material-ui/core';
import MUISelect from '@material-ui/core/Select';

import vizSubTypes from '../../Enums/visualizationSubTypes';
import colors from '../../Enums/colors';

const styles = (theme) => ({
    vizTypeSelectFormControl: {
        width: '100%',
        '&:disabled': {
          backgroundColor: 'transparent'
      }
    },

    vizTypeMenu: {
        backgroundColor: colors.backgroundGray
    },
  
    vizTypeMenuItem: {
      '&:hover': {backgroundColor: colors.greenHover}
    },

    visualizeButton: {
        textTransform: 'none',
        height: '56px',
        borderRadius: 0,
        backgroundColor: colors.backgroundGray,
        color: theme.palette.primary.main,
        fontVariant: 'normal',
        '&:disabled': {
          backgroundColor: 'transparent'
      },
        '&:hover': {
            backgroundColor: colors.greenHover,
              color: 'white'
          }
    },

    vizButtonTooltip: {
        color: 'yellow'
    },
});

const ChartControl = (props) => {
    const { 
        classes,
        overrideDisabledStyle,
        heatmapMessage,
        contourMessage,
        sectionMapMessage,
        histogramMessage,
        timeSeriesMessage,
        depthProfileMessage,
        sparseMapMessage,
        visualizeButtonTooltip,
        disableVisualizeMessage,
        selectedVizType,
        handleChangeInputValue,
        handleVisualize,
        disabled
    } = props;

    return (
        <React.Fragment>
                <Grid container>
                    <Grid item xs={12}>
                        <FormControl variant='filled' className={classes.vizTypeSelectFormControl}>
                            <InputLabel shrink htmlFor="vizSelector" style={disabled ? {color: 'rgba(0,0,0,.38)'} : {}}>Select Chart Type</InputLabel>
                            <MUISelect
                                disabled={disabled}
                                className={classes.vizTypeSelectFormControl}
                                style={overrideDisabledStyle}
                                value={selectedVizType}
                                variant='filled'
                                // onChange={handleChangeInputValue}
                                onChange={handleChangeInputValue}
                                inputProps={{
                                    name: 'selectedVizType',
                                    id: 'vizSelector',
                                    variant: 'filled'
                                }}
                                MenuProps={{
                                    MenuListProps: {
                                        className: classes.vizTypeMenu
                                    }
                                }}
                                >
                                {!heatmapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.heatmap} title={heatmapMessage}>Heatmap</MenuItem>}
                                {!contourMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.contourMap}>Contour Heatmap</MenuItem>}
                                {!sectionMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.sectionMap}>Section Map</MenuItem>}
                                {!sectionMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.contourSectionMap}>Contour Section Map</MenuItem>}
                                {!histogramMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.histogram}>Histogram</MenuItem>}                      
                                {!timeSeriesMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.timeSeries}>Time Series</MenuItem>}
                                {!depthProfileMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.depthProfile}>Depth Profile</MenuItem>}
                                {!sparseMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.sparse}>Time and Space Plots</MenuItem>}
                            </MUISelect>
                        </FormControl>
                    </Grid>

                    <Tooltip placement='right' title={visualizeButtonTooltip} className={classes.vizButtonTooltip}>
                        <Grid item xs={12}>
                            <Button
                                className={classes.visualizeButton}
                                variant='contained'
                                onClick={() => handleVisualize()}
                                disabled={Boolean(disableVisualizeMessage) || !selectedVizType || disabled}
                                fullWidth
                            >
                                Create Visualization
                            </Button>
                        </Grid>
                    </Tooltip>

                </Grid>
        </React.Fragment>
    )
}

export default withStyles(styles)(ChartControl);
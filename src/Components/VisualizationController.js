import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { renderMap, renderChart } from '../Redux/actions/visualization';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { Divider } from '@material-ui/core';

const styles = (theme) => ({
    controlPanel: {
        width: '150px',
        height: '280px',
        padding: theme.spacing(1),
        position:'fixed',
        left: '10px',
        top: '180px',
        zIndex: 2
    },
    slider: {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
    }
})

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState
})

const mapDispatchToProps = {
    renderMap,
    renderChart
}

class VisualizationController extends Component {
    state = {
        mapMenuAnchor: null,
        chartMenuAnchor: null
    }

    handleMapButtonClick = (event) => {
        this.setState({mapMenuAnchor: event.currentTarget})
    }

    handleChartButtonClick = (event) => {
        this.setState({chartMenuAnchor: event.currentTarget})
    }

    handleClose = () => {
        this.setState({mapMenuAnchor: null, chartMenuAnchor: null})
    }

    handleMap = (event) => {
        this.props.renderMap(event.currentTarget.id);
    }

    handleChart = (event) => {
        this.props.renderChart(event.currentTarget.id);
    }

    render(){
        const {classes} = this.props;

        return (  
            <div>

                <Paper className={classes.controlPanel}>
                   {
                       Object.keys(this.props.data).map((key, index) => {
                            let variableName = key;
                            return (
                                <div key={index}>
                                    <Typography variant='button'>
                                        {key}
                                    </Typography>
                                    <Grid container>
                                        <Grid item xs={6}>
                                            <Button onClick={this.handleMapButtonClick}>Map</Button>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Button onClick={this.handleChartButtonClick}>Chart</Button>
                                        </Grid>
                                    </Grid>
                                    <Menu
                                        id="map-menu"
                                        anchorEl={this.state.mapMenuAnchor}
                                        keepMounted
                                        open={Boolean(this.state.mapMenuAnchor)}
                                        onClose={this.handleClose}
                                    >
                                        <MenuItem id={variableName + ' grid'} onClick={this.handleMap}>Grid</MenuItem>
                                        <MenuItem id={variableName + ' columns'} onClick={this.handleMap}>Columns</MenuItem>
                                        <MenuItem id={variableName + ' point'} onClick={this.handleMap}>Pointcloud</MenuItem>
                                    </Menu>
                                    <Menu
                                        id="simple-menu"
                                        anchorEl={this.state.chartMenuAnchor}
                                        keepMounted
                                        open={Boolean(this.state.chartMenuAnchor)}
                                        onClose={this.handleClose}
                                    >
                                        <MenuItem id={variableName + ' line'} onClick={this.handleChart}>Line</MenuItem>
                                        <MenuItem id={variableName + ' bar'} onClick={this.handleChart}>Bar</MenuItem>
                                    </Menu>
                                    <Divider/>
                                </div>
                            )
                       })
                   }
                </Paper>
            </div>
        )
    }

    // OLD CONTROLLER FOR DEMO VIZ
    // return (
    //     <div>
    //         <Paper className={classes.controlPanel}>

    //             <FormControl component="fieldset" className={classes.formControl}>
    //                 <FormLabel component="legend">Variable</FormLabel>
    //                 <RadioGroup
    //                     aria-label="Variable"
    //                     name="variable"
    //                     value={props.variable}
    //                     onChange={props.handleVariableChange}
    //                     >
    //                     <FormControlLabel value="SiO2_darwin_3day" control={<Radio />} label="SiO2" />
    //                     <FormControlLabel value="PO4_darwin_3day" control={<Radio />} label="PO4" />
    //                     <FormControlLabel value="DIN_darwin_3day" control={<Radio />} label="DIN" />
    //                 </RadioGroup>
    //             </FormControl>
    //             <Divider/>
    //             <div className={classes.slider}>
    //                 <Typography variant='h6'>Date</Typography>
    //                 <Slider
    //                     value={props.dateSliderPosition}
    //                     min={3}
    //                     max={24}
    //                     step={3}
    //                     onChange ={props.handleDateSliderChange}
    //                     disabled={!props.hasData}
    //                 />
    //                 <Typography> {`1994-01-${props.dateSliderPosition}`}    </Typography>
    //             </div>

    //             <div className={classes.slider}>
    //                 <Typography variant='h6'>Opacity</Typography>
    //                 <Slider
    //                     value={props.opacity}
    //                     min={.1}
    //                     max={1}
    //                     step={.1}
    //                     onChange ={props.handleOpacitySliderChange}
    //                 />
    //                 <Typography> {props.opacity}    </Typography>
    //             </div>
    //         </Paper>
    //     </div>
    // )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VisualizationController));
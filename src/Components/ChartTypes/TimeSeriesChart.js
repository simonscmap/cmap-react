import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { Paper, Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';

const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white',
        backgroundColor: colors.backgroundGray
    },
    buttonBlock: {
        display:'block'
    }
})

const buttonProps = {
    size: 'small',
    color: 'primary',
    variant: 'contained'
}

const TimeSeriesCharts = (props) => {

    const { classes } = props;
    const { data, subType } = props.chart;
    const { lats, lons, dates, depths } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitByDepth, setSplitByDepth] = useState(false);
    const [subTypeState, setSubTypeState] = useState(subType);

    const subSets = data.generatePlotData(splitByDate, splitByDepth);

    var plots;

    switch(subTypeState){
        case vizSubTypes.contourMap:
            plots = handleContourMap(subSets, data, splitByDate, splitByDepth);
            break;

        default:
            plots = '';
            break;        

    }
        

    return (
        <div>
            <div className={classes.buttonBlock}>
            </div>
            {plots}      
        </div>
    )
}

export default withStyles(styles)(TimeSeriesChart);
import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { Paper, Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';

import colors from '../../Enums/colors';

const handleSectionMap = (subsets, infoObject, splitByDate, splitBySpace, orientation) => {

    const dates = Array.from(infoObject.dates);
    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));

    const distinctMeridiansOrParallelsForSplitting = 
        orientation === 'zonal' ?
        infoObject.latsDistinct : 
        infoObject.lonsDistinct;

    const xAxisLabel = 
        orientation === 'zonal' ?
        'Longitude' : 
        'Latitude';

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = dates.length < 2 ?
            dates[0] :
            !splitByDate ? 
                'Merged Dates' : 
                splitBySpace ? 
                    dates[Math.floor(index/distinctMeridiansOrParallelsForSplitting.length)].slice(0, 10) : 
                    dates[index];
                
        const spaceTitle = distinctMeridiansOrParallelsForSplitting.length <= 1 ? distinctMeridiansOrParallelsForSplitting[0] : 
            !splitBySpace ? `Merged ${xAxisLabel}s` : 
            `${distinctMeridiansOrParallelsForSplitting[index % distinctMeridiansOrParallelsForSplitting.length]} ${orientation === 'zonal' ? 
            'Parallel' :
            'Meridian'}`
 

        try {
            return (
            <Plot
                style= {{
                    position: 'relative',
                    display:'inline-block'
                }}
    
                data={[
                    {   
                        zauto: false,
                        zmin: infoObject.zMin,
                        zmax: infoObject.zMax,
                        zsmooth: subset.length < 20000 ? 'best' : 'fast',
                        x: orientation === 'zonal' ? infoObject.plotLons : infoObject.plotLats,
                        y: orientation === 'zonal' ? infoObject.zonalPlotDepths : infoObject.meridionalPlotDepths,
                        z: subset,
                        name: infoObject.parameters.fields,
                        type: 'heatmap',
                        colorbar: {
                            title: {
                                text: `[${infoObject.metadata.Unit}]`
                            },
                            exponentformat:'power'
                        }
                    }
                ]}                
                key={index}

                layout= {{
                    font: {color: '#ffffff'},
                    title: `${variableName}[${infoObject.metadata.Unit}]  ${spaceTitle}   ${date}`,
                    xaxis: {
                        title: `${xAxisLabel}[\xB0]`, 
                        color: '#ffffff',
                        exponentformat: 'power'
                    },
                    yaxis: {
                        title: 'Depth[m]', 
                        color: '#ffffff',
                        exponentformat: 'power'
                    },
                    paper_bgcolor: colors.backgroundGray,
                    annotations: [
                        {
                            text: `Source: ${infoObject.metadata.Distributor.length < 30 ? 
                                infoObject.metadata.Distributor : 
                                infoObject.metadata.Distributor.slice(0,30)} -- Provided by Simons CMAP`,
                            font: {
                                color: 'white',
                                size: 10
                            },
                            xref: 'paper',
                            yref: 'paper',
                            yshift: -202,
                            showarrow: false,
                        }
                    ]
    
                }}   
            />
            )
        } catch (e) {
            console.log('Failed to plot subset');
            console.log(subset);
        }
    })
}

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

const SectionMapChart = (props) => {

    const { classes } = props;
    const { data } = props.chart;
    const { lats, lons, dates, latsDistinct, lonsDistinct } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitBySpace, setSplitBySpace] = useState(false);
    const [orientation, setOrientation] = useState(data.orientation);

    const numSpaceSplits = 
        orientation === 'zonal' ?
        latsDistinct.length : 
        lonsDistinct.length

    const splitOrientation = orientation === 'zonal' ?
        'Longitudes' : 
        'Latitudes'

    const alternateOrientation = orientation === 'zonal' ? 'meridional' : 'zonal';

    const subsets = data.generatePlotData(orientation, splitByDate, splitBySpace);
    var plots = handleSectionMap(subsets, data, splitByDate, splitBySpace, orientation);

    return (
        <div>
            <div className={classes.buttonBlock}>
                <Button {...buttonProps} disabled={dates.size === 1} onClick={() => setSplitByDate(!splitByDate)}>{splitByDate ? 'Merge Dates' : 'Split By Date'}</Button>
                <Button {...buttonProps} disabled={numSpaceSplits === 1} onClick={() => setSplitBySpace(!splitBySpace)}>{splitBySpace ? `Merge ${splitOrientation}` : `Split By ${splitOrientation}`}</Button>
                <Button {...buttonProps} disabled={numSpaceSplits === 1} onClick={() => setOrientation(alternateOrientation)}>Switch to {alternateOrientation}</Button>
            </div>
            {plots}      
        </div>
    )
}

export default withStyles(styles)(SectionMapChart);

{/* <div key={index} className={classes.chartWrapper}>
<Plot
    style= {{
        position: 'relative',
        display:'inline-block'
    }}
    key={index}
    layout= {{...chart.layout,

        title: `${chart.parameters.fields} - ${chart.subType} - ${chart.parameters.dt1} - ${Number(chart.parameters.depth1) || 'Surface'}`,
        font: {... chart.layout.font,
            color: '#ffffff'
        },

        xaxis: {...chart.layout.xaxis,
            color: '#ffffff'
        },

        yaxis: {...chart.layout.yaxis,
            color: '#ffffff'
        },

        paper_bgcolor: colors.backgroundGray,

        annotations: [
            {
                text: `Source: ${chart.metadata.distributor.length < 30 ? 
                        chart.metadata.distributor : 
                        chart.metadata.distributor.slice(0,30)} -- Provided by Simons CMAP`,
                font: {
                    color: 'white',
                    size: 10
                },
                xref: 'paper',
                yref: 'paper',
                yshift: -202,
                showarrow: false,
            }
        ]
    }}
    data={chart.data}
/>
</div>   */}


import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { Paper, Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';

const handleContourMap = (subsets, infoObject, splitByDate, splitByDepth) => {

    const depths = Array.from(infoObject.depths);
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = !splitByDate ? 'Mean Over Time' : 
            splitByDepth ? dates[Math.floor(index/depths.length)].slice(0, 10) : dates[index].slice(0, 10);
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Mean Over Depth' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm depth' : depths[index].toFixed(2) + 'm depth';

        return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}

            data={[
                {
                    x: infoObject.lons,
                    y: infoObject.lats,
                    z: subset,
                    name: infoObject.parameters.fields,
                    type: 'contour',
                    contours: {
                        coloring: 'heatmap',
                        showlabels: true,
                        labelfont: {
                            family: 'Raleway',
                            size: 12,
                            color: 'white',
                        }
                    },
                    colorbar: {
                        title: {
                            text: `${infoObject.metadata.unit}`
                        }
                    }
                }
            ]}
            
            key={index}
            layout= {{
                font: {color: '#ffffff'},
                title: `${variableName} - ${depth}  - ${date}`,
                xaxis: {title: 'Longitude', color: '#ffffff'},
                yaxis: {title: 'Latitude', color: '#ffffff'},
                paper_bgcolor: colors.backgroundGray,
                annotations: [
                    {
                        text: `Source: ${infoObject.metadata.distributor.length < 30 ? 
                            infoObject.metadata.distributor : 
                            infoObject.metadata.distributor.slice(0,30)} -- Provided by Simons CMAP`,
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
        />)
    })
}

const handleHistogram = (subsets, infoObject, splitByDate, splitByDepth) => {

    const depths = Array.from(infoObject.depths);
    const dates = Array.from(infoObject.dates);

    console.log(subsets);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = !splitByDate ? 'Aggregated Time' : 
            splitByDepth ? dates[Math.floor(index/depths.length)].slice(0, 10) : dates[index].slice(0, 10);
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Aggregated Depth' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm depth' : depths[index].toFixed(2) + 'm depth';

        return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}

            data={[
                {
                    x: subset,
                    name: infoObject.parameters.fields,
                    type: 'histogram'
                }
            ]}
            
            key={index}
            layout= {{
                font: {color: '#ffffff'},
                title: `${variableName} - ${depth}  - ${date}`,
                xaxis: {title: `${infoObject.parameters.fields} ${infoObject.metadata.unit}`, color: '#ffffff'},
                paper_bgcolor: colors.backgroundGray,
                annotations: [
                    {
                        text: `Source: ${infoObject.metadata.distributor.length < 30 ? 
                            infoObject.metadata.distributor : 
                            infoObject.metadata.distributor.slice(0,30)} -- Provided by Simons CMAP`,
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
        />)
    })
}

const handleHeatmap = (subsets, infoObject, splitByDate, splitByDepth) => {

    const depths = Array.from(infoObject.depths);
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = !splitByDate ? 'Mean Over Time' : 
            splitByDepth ? dates[Math.floor(index/depths.length)].slice(0, 10) : dates[index].slice(0, 10);
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Mean Over Depth' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm depth' : depths[index].toFixed(2) + 'm depth';

        try {
            return (
            <Plot
                style= {{
                    position: 'relative',
                    display:'inline-block'
                }}
    
                data={[
                    {
                        x: infoObject.lons,
                        y: infoObject.lats,
                        z: subset,
                        name: infoObject.parameters.fields,
                        type: 'heatmap',
                        colorbar: {
                            title: {
                                text: `${infoObject.metadata.unit}`
                            }
                        }
                    }
                ]}
                
                key={index}
                layout= {{
                    font: {color: '#ffffff'},
                    title: `${variableName} - ${depth}  - ${date}`,
                    xaxis: {title: 'Longitude', color: '#ffffff'},
                    yaxis: {title: 'Latitude', color: '#ffffff'},
                    paper_bgcolor: colors.backgroundGray,
                    annotations: [
                        {
                            text: `Source: ${infoObject.metadata.distributor.length < 30 ? 
                                infoObject.metadata.distributor : 
                                infoObject.metadata.distributor.slice(0,30)} -- Provided by Simons CMAP`,
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
            />)
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

const SpaceTimeChart = (props) => {

    const { classes } = props;
    const { data, subType } = props.chart;
    const { lats, lons, dates, depths } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitByDepth, setSplitByDepth] = useState(false);
    const [subTypeState, setSubTypeState] = useState(subType);

    const subSets = data.generatePlotData(subTypeState, splitByDate, splitByDepth);

    var plots;

    switch(subTypeState){
        case vizSubTypes.contourMap:
            plots = handleContourMap(subSets, data, splitByDate, splitByDepth);
            break;

        case vizSubTypes.heatmap:
            plots = handleHeatmap(subSets, data, splitByDate, splitByDepth);
            break;

        case vizSubTypes.histogram:
            plots = handleHistogram(subSets, data, splitByDate, splitByDepth);
            break;

        default:
            plots = '';
            break;        

    }
        

    return (
        <div>
            <div className={classes.buttonBlock}>
                <Button {...buttonProps} disabled={dates.size===1} onClick={() => setSplitByDate(!splitByDate)}>{splitByDate ? 'Merge Dates' : 'Split By Date'}</Button>
                <Button {...buttonProps} disabled={depths.size===1} onClick={() => setSplitByDepth(!splitByDepth)}>{splitByDepth ? 'Merge Depths' : 'Split By Depth'}</Button>
                
                {subTypeState == vizSubTypes.heatmap ? '' : 
                    <Button {...buttonProps} 
                        onClick={() => setSubTypeState(vizSubTypes.heatmap)}
                        >Switch to Heatmap
                    </Button>
                }
                
                {subTypeState == vizSubTypes.contourMap ? '' : 
                    <Button {...buttonProps} 
                        onClick={() => setSubTypeState(vizSubTypes.contourMap)}
                        >Switch to Contour
                    </Button>
                }
                
                {subTypeState == vizSubTypes.histogram ? '' : 
                    <Button {...buttonProps}
                        onClick={() => setSubTypeState(vizSubTypes.histogram)}
                        >Switch to Histogram
                    </Button>
                }
            </div>
            {plots}      
        </div>
    )
}

export default withStyles(styles)(SpaceTimeChart);

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


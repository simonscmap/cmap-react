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

    console.log(infoObject.lons);
    console.log(infoObject.lats);

    const height = subsets.length > 4 ? 300 : 450
    const width = subsets.length > 4 ? 450 : 700

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = !splitByDate ? 'Mean Over Time' : 
            splitByDepth ? dates[Math.floor(index/depths.length)] : dates[index];
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Mean Over Depth' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm' : depths[index].toFixed(2) + 'm';

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
                // height,
                // width,
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

const handleHistogram = (chart) => ({     
        parameters: chart.parameters,
        metadata: chart.metadata,   
        subType: chart.subType,
        data: [
            {
            x: chart.data.map(row => row[chart.parameters.fields]),
            name: chart.parameters.fields,
            type: 'histogram',
            marker: {color: '#17becf'}
            }
        ],
        layout: {
            xaxis: {title: `${chart.metadata.unit}`}
        }          
})

const handleHeatmap = (chart) => ({
    parameters: chart.parameters,
    metadata: chart.metadata,
    subType: chart.subType,
    data:[
        {
            x: chart.data.map(row => row.lon),
            y: chart.data.map(row => row.lat),
            z: chart.data.map(row => row[chart.parameters.fields]),
            name: chart.parameters.fields,
            type: 'heatmap',
            colorbar: {
                title: {
                    text: `${chart.metadata.unit}`
                }
            }
        }
    ],
    layout: {
        xaxis: {title: 'Longitude'},
        yaxis: {title: 'Latitude'}
    }    
})

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

    const subSets = data.generatePlotData(splitByDate, splitByDepth);

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
                
                {/* {subTypeState == vizSubTypes.heatmap ? '' : 
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
                } */}
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


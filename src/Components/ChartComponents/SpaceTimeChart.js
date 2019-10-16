import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';

import { setLoadingMessage } from '../../Redux/actions/ui'; 
import ChartControlPanel from './ChartControlPanel';

const handleContourMap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = dates.length <=1 ? dates[0].slice(0,10) :
            !splitByDate ? 'Merged Dates' : 
            splitByDepth ? dates[Math.floor(index/depths.length)].slice(0, 10) : dates[index].slice(0, 10);
        
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Merged Depths' : 
            depths[index % depths.length].toFixed(2) + 'm depth';

        return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}
            
            data={[
                {   
                    zauto: false,
                    zmin: zMin,
                    zmax: zMax,
                    x: infoObject.lons,
                    y: infoObject.lats,
                    z: subset,
                    connectgaps: false,
                    autocolorscale: false,
                    colorscale: palette,
                    
                    name: infoObject.parameters.fields,
                    type: 'contour',
                    contours: {
                        coloring: palette,
                        showlabels: true,
                        labelfont: {
                            family: 'Raleway',
                            size: 12,
                            color: 'white',
                        },
                        labelformat: '.2e'
                    },
                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat: 'power'
                    }
                }
            ]}
            
            key={index}
            layout= {{
                font: {color: '#ffffff'},
                title: `${variableName}[${infoObject.metadata.Unit}]  ${depth}  ${date}`,
                xaxis: {title: 'Longitude', color: '#ffffff'},
                yaxis: {title: 'Latitude', color: '#ffffff'},
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
        />)
    })
}

const handleHistogram = (subsets, infoObject, splitByDate, splitByDepth, palette) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = dates.length <=1 ? dates[0].slice(0,10) :
            !splitByDate ? 'Merged Dates' : 
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
                title: `${variableName}[${infoObject.metadata.Unit}]  ${depth}  ${date}`,
                xaxis: {
                    title: `${infoObject.parameters.fields} [${infoObject.metadata.Unit}]`,
                    exponentformat: 'power',
                    color: '#ffffff'
                },
                yaxis:{
                    color: '#ffffff',
                    title: 'Frequency'
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
        />)
    })
}

const handleHeatmap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;
        const date = dates.length <=1 ? dates[0].slice(0,10) :
            !splitByDate ? 'Merged Dates' : 
            splitByDepth ? dates[Math.floor(index/depths.length)].slice(0, 10) : dates[index].slice(0, 10);
        const depth = !infoObject.hasDepth ? 'Surface' : 
            !splitByDepth ? 'Merged Depths' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm depth' : depths[index].toFixed(2) + 'm depth';

        return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}

            data={[
                {   
                    zauto: false,
                    zmin: zMin,
                    zmax: zMax,
                    zsmooth: subset.length < 20000 ? 'fast' : 'false',
                    x: infoObject.lons,
                    y: infoObject.lats,
                    z: subset,
                    connectgaps: false,
                    name: infoObject.parameters.fields,
                    type: 'heatmapgl',
                    colorscale: palette,
                    autocolorscale: false,
                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat:'power'
                    },
                    
                }
            ]}                
            key={index}

            layout= {{
                font: {color: '#ffffff'},
                title: `${variableName}[${infoObject.metadata.Unit}]  ${depth}   ${date}`,
                xaxis: {
                    title: 'Longitude[\xB0]', 
                    color: '#ffffff',
                    exponentformat: 'power'
                },
                yaxis: {
                    title: 'Latitude[\xB0]', 
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
        />)
    })
}

const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white'
    },
    buttonBlock: {
        display:'block'
    },
    iconButtonWrapper: {
        display: 'inline-block'
    }
})

const mapDispatchToProps = {
    setLoadingMessage
}

const SpaceTimeChart = (props) => {

    const { classes } = props;
    const { data, subType } = props.chart;
    const { dates, depths, extent } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitByDepth, setSplitByDepth] = useState(false);
    const [subTypeState, setSubTypeState] = useState(subType);
    const [palette, setPalette] = useState('heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [zMin, zMax] = zValues;

    const subSets = data.generatePlotData(subTypeState, splitByDate, splitByDepth);
    var plots;

    switch(subTypeState){
        case vizSubTypes.contourMap:
            plots = handleContourMap(subSets, data, splitByDate, splitByDepth, palette, zMin, zMax);
            break;

        case vizSubTypes.heatmap:
            plots = handleHeatmap(subSets, data, splitByDate, splitByDepth, palette, zMin, zMax);
            break;

        case vizSubTypes.histogram:
            plots = handleHistogram(subSets, data, splitByDate, splitByDepth, palette, zMin, zMax);
            break;

        default:
            plots = '';
            break;        

    }

    const onToggleSplitByDate = () => {
        props.setLoadingMessage('Processing Data');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setSplitByDate(!splitByDate);
        }, 100)
    }

    const onToggleSplitByDepth = () => {
        props.setLoadingMessage('Processing Data');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setSplitByDepth(!splitByDepth);
        }, 100)
    }

    const handlePaletteChoice = (option) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setPalette(option);
        }, 100)
    }

    const handleZValueConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setZValues(values);
        }, 100)
    }

    const downloadCsv = () => {
        props.setLoadingMessage('Processing Data');

        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));

            let csv = data.generateCsv();
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('hidden', '');
            a.setAttribute('href', url);
            a.setAttribute('download', `${data.parameters.fields}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, 100)
    }

    return (
        <div>
            <ChartControlPanel
                handlePaletteChoice={handlePaletteChoice}
                onToggleSplitByDepth={depths.size===1 ? null : onToggleSplitByDepth}
                onToggleSplitByDate={dates.size===1 ? null : onToggleSplitByDate}
                splitByDepth={splitByDepth}
                splitByDate={splitByDate}
                handleZValueConfirm={handleZValueConfirm}
                zValues={zValues}
                extent={extent}
                downloadCsv={downloadCsv}
            />
            {plots}      
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SpaceTimeChart));
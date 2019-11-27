import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';

import handleXTicks from '../../Utility/handleXTicks';
import handleDateString from '../../Utility/handleChartDatestring';
import chartBase from '../../Utility/chartBase';

import { setLoadingMessage } from '../../Redux/actions/ui'; 
import ChartControlPanel from './ChartControlPanel';

import { format } from 'd3-format';
import subTypes from '../../Enums/visualizationSubTypes';

const determineHeight = (infoObject) => {
    const latRange = infoObject.latMax - infoObject.latMin;
    const lonRange = infoObject.lonMax - infoObject.lonMin;
    return (((latRange / lonRange) * 800) * .83) + 60;
}
// equal 608 wide, 670 high
// height half 608 / 267

const handleContourMap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);
    
    // Handle axis labels when crossing 180th meridian
    let xTicks = infoObject.parameters.lon1 > infoObject.parameters.lon2 ? handleXTicks(infoObject) : {};

    // let height = determineHeight(infoObject);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;

        const date = dates.length <= 1 ? handleDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            !splitByDate ? infoObject.hasHour ? 'Merged times' : 'Merged Dates' : 
            splitByDepth ? handleDateString(dates[Math.floor(index/depths.length)], infoObject.hasHour, infoObject.isMonthly) : 
            handleDateString(dates[index], infoObject.hasHour, infoObject.isMonthly);

        const depth = !infoObject.hasDepth ? 'Surface' :
            depths.length === 1 ? depths[0] + 'm depth':
            !splitByDepth ? 'Merged Depths' : 
            splitByDate ? depths[index % depths.length].toFixed(2) + 'm depth' : depths[index].toFixed(2) + 'm depth';

        var hovertext = subset.map((value, i) => {
            let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
            if(isNaN(value)) return `Lat: ${format('.2f')(infoObject.lats[i])}\xb0` +
                `<br>` +
                `Lon: ${infoObject.lons[i] > 180 ? format('.2f')(infoObject.lons[i] - 360) : format('.2f')(infoObject.lons[i])}\xb0`

            return `Lat: ${format('.2f')(infoObject.lats[i])}\xb0` +
            `<br>` +
            `Lon: ${infoObject.lons[i] > 180 ? format('.2f')(infoObject.lons[i] - 360) : format('.2f')(infoObject.lons[i])}\xb0` + 
            '<br>' +
            `${infoObject.parameters.fields}: ${format(formatter)(value)} [${infoObject.metadata.Unit}]`;
        });

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

                    hoverinfo: 'text',
                    hovertext,
                    
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
                        labelformat: infoObject.zMin > 1 && infoObject.zMin < 1000 ? '.2f' : '.2e'
                    },
                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat: 'power'
                    }
                }
            ]}

            config={{...chartBase.config}}
            
            key={index}
            layout= {{
                ...chartBase.layout,
                width: 800,
                height: 570,
                title: {
                    text: `${variableName} [${infoObject.metadata.Unit}]  ${depth}  ${date}`,
                },
                xaxis: {title: 'Longitude', color: '#ffffff', ...xTicks},
                yaxis: {title: 'Latitude', color: '#ffffff'},
                // annotations: chartBase.annotations(infoObject.metadata.Distributor, height)
                annotations: chartBase.annotations(infoObject.metadata.Distributor)
            }}   
        />)
    })
}

const handleHistogram = (subsets, infoObject, splitByDate, splitByDepth, palette) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;

        const date = dates.length <= 1 ? handleDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            !splitByDate ? infoObject.hasHour ? 'Merged times' : 'Merged Dates' : 
            splitByDepth ? handleDateString(dates[Math.floor(index/depths.length)], infoObject.hasHour, infoObject.isMonthly) : 
            handleDateString(dates[index], infoObject.hasHour, infoObject.isMonthly);

        const depth = !infoObject.hasDepth ? 'Surface' :
            depths.length === 1 ? depths[0] + 'm depth':
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
                    x: subset,
                    name: infoObject.parameters.fields,
                    type: 'histogram'
                }
            ]}
            
            key={index}
            layout= {{
                width: 800,
                height: 570,
                ...chartBase.layout,
                title: `${variableName} [${infoObject.metadata.Unit}]  ${depth}  ${date}`,
                xaxis: {
                    title: `${infoObject.parameters.fields} [${infoObject.metadata.Unit}]`,
                    exponentformat: 'power',
                    color: '#ffffff'
                },
                yaxis:{
                    color: '#ffffff',
                    title: 'Frequency'
                },
                annotations: chartBase.annotations(infoObject.metadata.Distributor)             
            }}
            config={{...chartBase.config}}
        />)
    })
}

const handleHeatmap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    let xTicks = infoObject.parameters.lon1 > infoObject.parameters.lon2 ? handleXTicks(infoObject) : {};

    // let height = determineHeight(infoObject);

    return subsets.map((subset, index) => {

        const variableName = infoObject.parameters.fields;

        const date = dates.length <= 1 ? handleDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            !splitByDate ? infoObject.hasHour ? 'Merged times' : 'Merged Dates' : 
            splitByDepth ? handleDateString(dates[Math.floor(index/depths.length)], infoObject.hasHour, infoObject.isMonthly) : 
            handleDateString(dates[index], infoObject.hasHour, infoObject.isMonthly);

        const depth = !infoObject.hasDepth ? 'Surface' :
            depths.length === 1 ? depths[0] + 'm depth':
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

                    // hoverinfo: 'text',
                    // hovertext,

                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat:'power'
                    },
                    
                }
            ]}                
            key={index}

            config={{...chartBase.config}}

            layout= {{
                ...chartBase.layout,
                width: 800,
                height: 570,
                title: {
                    text: `${variableName} [${infoObject.metadata.Unit}]  ${depth}  ${date}`,
                    font: {
                        size: 16
                    }
                },
                xaxis: {
                    title: 'Longitude[\xB0]', 
                    color: '#ffffff',
                    exponentformat: 'power',
                    ...xTicks
                },
                yaxis: {
                    title: 'Latitude[\xB0]', 
                    color: '#ffffff',
                    exponentformat: 'power'
                },
                annotations: chartBase.annotations(infoObject.metadata.Distributor)
                // annotations: chartBase.annotations(infoObject.metadata.Distributor, height)
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
    },    
})

const mapDispatchToProps = {
    setLoadingMessage
}

const SpaceTimeChart = (props) => {

    const { classes } = props;
    const { data, subType } = props.chart;
    const { dates, depths, extent } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitByDepth, setSplitByDepth] = useState(true);
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
        <React.Fragment>
            <ChartControlPanel
                handlePaletteChoice={subTypeState !== subTypes.histogram && handlePaletteChoice}
                onToggleSplitByDepth={depths.size===1 ? null : onToggleSplitByDepth}
                onToggleSplitByDate={dates.size===1 ? null : onToggleSplitByDate}
                splitByDepth={splitByDepth}
                splitByDate={splitByDate}
                handleZValueConfirm={subTypeState !== subTypes.histogram && handleZValueConfirm}
                zValues={subTypeState !== subTypes.histogram && zValues}
                extent={subTypeState !== subTypes.histogram && extent}
                downloadCsv={downloadCsv}
            />
            {plots}     
        </React.Fragment>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SpaceTimeChart));
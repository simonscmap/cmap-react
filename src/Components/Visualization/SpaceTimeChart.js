// Wrapper for heatmaps and non-sparse histograms

import React, { useState } from 'react';
import { connect } from 'react-redux';

import Histogram from './Histogram';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';

import handleXTicks from '../../Utility/handleXTicks';
import chartBase from '../../Utility/chartBase';
import getChartDimensions from '../../Utility/getChartDimensions';
import handleChartDateString from '../../Utility/handleChartDatestring';
import countWebGLContexts from '../../Utility/countWebGLContexts';

import { setLoadingMessage, snackbarOpen } from '../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../Redux/actions/visualization';
import ChartControlPanel from './ChartControlPanel';

import { format } from 'd3-format';
import subTypes from '../../Enums/visualizationSubTypes';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const handleContourMap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {
    const { parameters, metadata } = infoObject;

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);
    
    // Handle axis labels when crossing 180th meridian
    let xTicks = infoObject.parameters.lon1 > infoObject.parameters.lon2 ? handleXTicks(infoObject) : {};

    const [ height, width ] = getChartDimensions(infoObject);

    return subsets.map((subset, index) => {

        const date = dates.length <= 1 ? handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            !splitByDate ? `Averaged Values ${handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly)} to ${handleChartDateString(dates[dates.length - 1], infoObject.hasHour, infoObject.isMonthly)}` :  
            splitByDepth ? handleChartDateString(dates[Math.floor(index/depths.length)], infoObject.hasHour, infoObject.isMonthly) : 
            handleChartDateString(dates[index], infoObject.hasHour, infoObject.isMonthly);

        const depth = !infoObject.hasDepth ? 'Surface' :
            depths.length === 1 ? depths[0] + '[m]':
            !splitByDepth ? `Averaged Values ${parameters.depth1} to ${parameters.depth2}` : 
            splitByDate ? depths[index % depths.length].toFixed(2) + '[m]' : depths[index].toFixed(2) + '[m]';

        const latTitle = parameters.lat1 === parameters.lat2 ? `${parameters.lat1}\xb0` :
            `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0`;

        const lonTitle = parameters.lon1 === parameters.lon2 ? `${parameters.lon1}\xb0` :
            `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`; 

        var hovertext = subset.map((value, i) => {
            let abs = Math.abs(value);
            let formatter = abs > .01 && abs < 1000 ? '.2f' : '.2e';
            if(value === null) return `Lat: ${format('.2f')(infoObject.lats[i])}\xb0` +
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
                // display:'inline-block',
                width: `${width}vw`,
                height: `${height}vw`,
                minWidth: `${width * 10}px`,
                minHeight: `${height * 10}px`,
                margin: '0 auto'
            }}

            useResizeHandler={true}
            
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
                    
                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
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
                // autosize: true,
                title: {
                    text: `${metadata.Dataset_Name}` +
                        `<br>${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]` + 
                        `<br>${date}, ` + 
                        `${depth} <br>` + 
                        `Lat: ${latTitle}, ` +
                        `Lon: ${lonTitle}`,
                    font: {
                        size: 12
                    }
                },
                xaxis: {title: 'Longitude', color: '#ffffff', ...xTicks},
                yaxis: {title: 'Latitude', color: '#ffffff'},
                annotations: chartBase.annotations(infoObject.metadata.Distributor, metadata.Data_Source)
            }}   
        />)
    })
}

const handleHeatmap = (subsets, infoObject, splitByDate, splitByDepth, palette, zMin, zMax) => {
    const { parameters, metadata } = infoObject;

    const depths = Array.from(infoObject.depths).map(depth => parseFloat(depth));
    const dates = Array.from(infoObject.dates);

    let xTicks = infoObject.parameters.lon1 > infoObject.parameters.lon2 ? handleXTicks(infoObject) : {};

    const [ height, width ] = getChartDimensions(infoObject);

    return subsets.map((subset, index) => {

        const date = dates.length <= 1 ? handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            !splitByDate ? `Averaged Values ${handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly)} to ${handleChartDateString(dates[dates.length - 1], infoObject.hasHour, infoObject.isMonthly)}` :  
            splitByDepth ? handleChartDateString(dates[Math.floor(index/depths.length)], infoObject.hasHour, infoObject.isMonthly) : 
            handleChartDateString(dates[index], infoObject.hasHour, infoObject.isMonthly);

        const depth = !infoObject.hasDepth ? 'Surface' :
            depths.length === 1 ? depths[0] + '[m]':
            !splitByDepth ? `Averaged Values ${parameters.depth1} to ${parameters.depth2}` : 
            splitByDate ? depths[index % depths.length].toFixed(2) + '[m]' : depths[index].toFixed(2) + '[m]';

        const latTitle = parameters.lat1 === parameters.lat2 ? `${parameters.lat1}\xb0` :
            `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0`;

        const lonTitle = parameters.lon1 === parameters.lon2 ? `${parameters.lon1}\xb0` :
            `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`;
        
        var hovertext = subset.map((value, i) => {
            let abs = Math.abs(value);
            let formatter = abs > .01 && abs < 1000 ? '.2f' : '.2e';
            if(value === null || isNaN(value)) return `Lat: ${format('.2f')(infoObject.lats[i])}\xb0` +
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
                // display:'inline-block',
                width: `${width}vw`,
                height: `${height}vw`,
                minWidth: `${width * 10}px`,
                minHeight: `${height * 10}px`,
            }}

            useResizeHandler={true}

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
                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
                    type: 'heatmap',
                    colorscale: palette,
                    autocolorscale: false,
                    
                    hoverinfo: 'text',
                    text: hovertext,

                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
                        },
                        exponentformat:'power'
                    },
                    
                },

            ]}                
            key={index}

            config={{...chartBase.config}}

            layout= {{
                ...chartBase.layout,               

                title: {
                    text: `${metadata.Dataset_Name}` +
                        `<br>${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]` + 
                        `<br>${date}, ` + 
                        `${depth} <br>` + 
                        `Lat: ${latTitle}, ` +
                        `Lon: ${lonTitle}`,
                    font: {
                        size: 13
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
                annotations: chartBase.annotations(infoObject.metadata.Distributor, metadata.Data_Source)
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
    setLoadingMessage,
    snackbarOpen,
    csvFromVizRequestSend
}

const SpaceTimeChart = (props) => {

    const { snackbarOpen, csvFromVizRequestSend, chart } = props;
    const { data, subType } = chart;
    const { dates, depths, extent, metadata } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitByDepth, setSplitByDepth] = useState(true);
    const [palette, setPalette] = useState('heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [zMin, zMax] = zValues;

    const subSets = data.generatePlotData(subType, splitByDate, splitByDepth);
    var plots;
    switch(subType){
        case vizSubTypes.contourMap:
            plots = handleContourMap(subSets, data, splitByDate, splitByDepth, palette, zMin, zMax);
            break;

        case vizSubTypes.heatmap:
            plots = handleHeatmap(subSets, data, splitByDate, splitByDepth, palette, zMin, zMax);
            break;

        case vizSubTypes.histogram:
            return <Histogram chart={{data}}/>;

        default:
            plots = '';
            break;        

    }

    const onToggleSplitByDate = () => {
        let chartCount = depths ? depths.size : 1;

        if(subType === vizSubTypes.heatmap){
            let availableWGLContexts = 15 - countWebGLContexts(props.charts);

            if(!splitByDate && chartCount * dates.size > availableWGLContexts){
                snackbarOpen('Unable to split. Rendering limit exceeded.');
                return;
            }
        }

        if(subType === vizSubTypes.contourMap){
            if(!splitByDate && chartCount * dates.size > 20){
            snackbarOpen('Unable to split. Rendering limit exceeded.');
            return;
            }
        }

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
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
    }
    
    return (
        <React.Fragment>
            <ChartControlPanel
                handlePaletteChoice={subType !== subTypes.histogram && handlePaletteChoice}
                onToggleSplitByDepth={depths.size===1 ? null : onToggleSplitByDepth}
                onToggleSplitByDate={dates.size===1 ? null : onToggleSplitByDate}
                splitByDepth={splitByDepth}
                splitByDate={splitByDate}
                handleZValueConfirm={subType !== subTypes.histogram && handleZValueConfirm}
                zValues={subType !== subTypes.histogram && zValues}
                extent={subType !== subTypes.histogram && extent}
                downloadCsv={downloadCsv}
                chart={chart}
            />
            {plots}     
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SpaceTimeChart));
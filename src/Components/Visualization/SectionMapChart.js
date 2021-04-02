import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { setLoadingMessage, snackbarOpen } from '../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../Redux/actions/visualization';

import colors from '../../Enums/colors';
import visualizationSubTypes from '../../Enums/visualizationSubTypes';

import ChartControlPanel from './ChartControlPanel';

import { format } from 'd3-format';

import handleXTicks from '../../Utility/handleXTicks';
import handleChartDateString from '../../Utility/handleChartDatestring';
import chartBase from '../../Utility/chartBase';

const handleSectionMap = (subsets, infoObject, splitByDate, splitBySpace, orientation, palette, zMin, zMax) => {
    const { parameters, metadata } = infoObject;

    const dates = Array.from(infoObject.dates);
    const depths = Array.from(infoObject.depths);
    const lats = Array.from(infoObject.lats);
    const lons = Array.from(infoObject.lons);

    const distinctMeridiansOrParallelsForSplitting = 
        orientation === 'zonal' ?
        lats : 
        lons;

    const xAxis = orientation === 'zonal' ?
        'Longitude' :
        'Latitude';

    let xTicks = parameters.lon1 > parameters.lon2 && orientation === 'zonal' ? handleXTicks(infoObject) : {};


    return subsets.map((subset, index) => {
        let z = subset;
        let x = [];
        let y = [];

        if(orientation === 'zonal'){
            for(let i = 0; i < subset.length; i++){
                x.push(lons[Math.floor(i / depths.length)])
            }
        } else {
            for(let i = 0; i < subset.length; i++){
                x.push(lats[Math.floor(i / depths.length)])
            }
        }

        for(let i = 0; i < subset.length; i++){
            y.push(depths[i % depths.length]);
        }

        const latTitle = orientation === 'meridional' ? `${parameters.lat1}\xb0 to ${parameters.lat2}\xb0` :
            splitBySpace ? distinctMeridiansOrParallelsForSplitting[index % distinctMeridiansOrParallelsForSplitting.length] + '\xb0' : 
            `Averaged Values ${parameters.lat1}\xb0 to ${parameters.lat2}\xb0`;

        const lonTitle = orientation === 'zonal' ? `${parameters.lon1}\xb0 to ${parameters.lon2}\xb0` :
            splitBySpace ? distinctMeridiansOrParallelsForSplitting[index % distinctMeridiansOrParallelsForSplitting.length] + '\xb0' : 
            `Averaged Values ${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`;

        const date = dates.length < 2 ? handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) :
            splitByDate && splitBySpace ? handleChartDateString(dates[Math.floor(index / distinctMeridiansOrParallelsForSplitting.length)], infoObject.hasHour, infoObject.isMonthly) : 
            splitByDate ? handleChartDateString(dates[index], infoObject.hasHour, infoObject.isMonthly) :
            'Averaged Values ' + handleChartDateString(dates[0], infoObject.hasHour, infoObject.isMonthly) + ' to ' + handleChartDateString(dates[dates.length - 1], infoObject.hasHour, infoObject.isMonthly);

        let hovertext = z.map((value, i) => {
            
            if(orientation === 'zonal'){
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                if(isNaN(value)) return `Depth: ${format('.2f')(y[i])} [m]` +
                    `<br>` +
                    `Lon: ${format('.2f')(x[i] > 180 ? x[i] - 360 : x[i])}\xb0`
    
                return `Depth: ${format('.2f')(y[i])} [m]` +
                `<br>` +
                `Lon: ${format('.2f')(x[i] > 180 ? x[i] - 360 : x[i])}\xb0` + 
                '<br>' +
                `${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`;
            } else {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                if(isNaN(value)) return `Depth: ${format('.2f')(y[i])} [m]` +
                    `<br>` +
                    `Lat: ${format('.2f')(x[i])}\xb0`
    
                return `Depth: ${format('.2f')(y[i])} [m]` +
                `<br>` +
                `Lat: ${format('.2f')(x[i])}\xb0` + 
                '<br>' +
                `${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`;
            }
        });

        return (
        <Plot
            style= {{
                position: 'relative',
                // display:'inline-block',
                width: '60vw',
                height: '40vw',
                minWidth: '510px',
                minHeight: '340px'
            }}

            useResizeHandler={true}

            data={[
                {   
                    zauto: false,
                    zmin: zMin,
                    zmax: zMax,

                    connectgaps: false,
                    autocolorscale: false,
                    colorscale: palette,
                    zsmooth: subset.length < 20000 ? 'best' : 'fast',
                    x,
                    y,
                    z,
                    name: parameters.fields,
                    type: infoObject.subType === visualizationSubTypes.contourSectionMap ? 'contour' : 'heatmap',
                    colorbar: {
                        title: {
                            text: `[${metadata.Unit}]`
                        },
                        exponentformat:'power'
                    },

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

                    hoverinfo: 'text',
                    hovertext
                }
            ]}                
            key={index}

            layout= {{
                font: {color: '#ffffff'},
                title: {
                    text: `${metadata.Dataset_Name}` +
                        `<br>${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]` + 
                        `<br>${date}, ` + 
                        `${parameters.depth1}[m] to ${parameters.depth2}[m] <br>` + 
                        `Lat: ${latTitle}, ` +
                        `Lon: ${lonTitle}`,
                    font: {
                        size: 12
                    }
                },
                xaxis: {
                    title: `${xAxis}[\xB0]`,
                    color: '#ffffff',
                    exponentformat: 'power',
                    ...xTicks
                },
                yaxis: {
                    title: 'Depth[m]', 
                    color: '#ffffff',
                    exponentformat: 'power',
                    autorange: 'reversed'
                },
                paper_bgcolor: colors.backgroundGray,
                annotations: chartBase.annotations(metadata.Distributor)

            }}   
        />
        )
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
    }
})

const mapDispatchToProps = {
    setLoadingMessage,
    snackbarOpen,
    csvFromVizRequestSend
}

const SectionMapChart = (props) => {

    const { classes, snackbarOpen, csvFromVizRequestSend } = props;
    const { data } = props.chart;
    const { dates, extent, lats, lons, metadata } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitBySpace, setSplitBySpace] = useState(false);
    const [orientation, setOrientation] = useState(data.orientation);
    const [palette, setPalette] = useState('heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [zMin, zMax] = zValues;

    var spaces = orientation === 'zonal' ? lats : lons;

    const subsets = data.generatePlotData(orientation, splitByDate, splitBySpace);
    var plots = handleSectionMap(subsets, data, splitByDate, splitBySpace, orientation, palette, zMin, zMax);

    const downloadCsv = () => {
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
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

    const onToggleSplitBySpace = () => {
        let chartCount = splitByDate ? dates.size : 1;
        if(!splitBySpace && chartCount * spaces.size > 20){
            snackbarOpen('Unable to split. Rendering limit exceeded.');
            return;
        }
        else {
            props.setLoadingMessage('Re-rendering');
            setTimeout(() => {
                window.requestAnimationFrame(() => props.setLoadingMessage(''));
                setSplitBySpace(!splitBySpace);
            }, 100)
        }
    }

    const onToggleSplitByDate = () => {
        let chartCount = splitBySpace ? spaces.size : 1;
        if(!splitByDate && chartCount * dates.size > 20){
            snackbarOpen('Unable to split. Rendering limit exceeded.');
            return;
        }
        else {
            props.setLoadingMessage('Re-rendering');
            setTimeout(() => {
                window.requestAnimationFrame(() => props.setLoadingMessage(''));
                setSplitByDate(!splitByDate);
            }, 100)
        }     
    }

    const switchOrientation = () => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setOrientation(orientation === 'zonal' ? 'meridional' : 'zonal');
        }, 100)
    }

    return (
        <div>
            <div className={classes.buttonBlock}>
            <ChartControlPanel
                orientation={orientation}
                switchOrientation={switchOrientation}
                onToggleSplitBySpace={spaces.size === 1 ? null : onToggleSplitBySpace}
                splitBySpace={splitBySpace}
                onToggleSplitByDate={dates.size === 1 ? null : onToggleSplitByDate}
                splitByDate={splitByDate}
                handlePaletteChoice={handlePaletteChoice}
                handleZValueConfirm={handleZValueConfirm}
                zValues={zValues}
                extent={extent}
                downloadCsv={downloadCsv}
                chart={props.chart}
            />
            </div>
            {plots}      
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SectionMapChart));
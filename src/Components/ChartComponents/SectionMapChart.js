import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { setLoadingMessage } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';
import visualizationSubTypes from '../../Enums/visualizationSubTypes';

import ChartControlPanel from './ChartControlPanel';

import { format } from 'd3-format';

import handleXTicks from '../../Utility/handleXTicks';

const handleSectionMap = (subsets, infoObject, splitByDate, splitBySpace, orientation, palette, zMin, zMax) => {

    const dates = Array.from(infoObject.dates);
    const depths = Array.from(infoObject.depths);
    const lats = Array.from(infoObject.lats);
    const lons = Array.from(infoObject.lons);

    const distinctMeridiansOrParallelsForSplitting = 
        orientation === 'zonal' ?
        lats : 
        lons;

    const mergedOrSplitAxis = 
        orientation === 'zonal' ?
        'Latitude' :
        'Longitude';

    const xAxis = orientation === 'zonal' ?
        'Longitude' :
        'Latitude';

    let xTicks = infoObject.parameters.lon1 > infoObject.parameters.lon2 && orientation === 'zonal' ? handleXTicks(infoObject) : {};


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

        const variableName = infoObject.parameters.fields;
        const date = dates.length < 2 ?
            dates[0].slice(0,10) :
            !splitByDate ? 
                'Merged Dates' : 
                splitBySpace ? 
                    dates[Math.floor(index/distinctMeridiansOrParallelsForSplitting.length)].slice(0, 10) : 
                    dates[index].slice(0,10);
                
        const spaceTitle = distinctMeridiansOrParallelsForSplitting.length <= 1 ? `${orientation === 'zonal' ? 'Lat' : 'Lon'} ${distinctMeridiansOrParallelsForSplitting[0]}\xb0` : 
            !splitBySpace ? `Merged ${mergedOrSplitAxis}s` : 
            `${orientation === 'zonal' ? 'Lat' : 'Lon'} ${distinctMeridiansOrParallelsForSplitting[index % distinctMeridiansOrParallelsForSplitting.length]}\xb0`;

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
                `${infoObject.parameters.fields}: ${format(formatter)(value)} [${infoObject.metadata.Unit}]`;
            } else {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                if(isNaN(value)) return `Depth: ${format('.2f')(y[i])} [m]` +
                    `<br>` +
                    `Lat: ${format('.2f')(x[i])}\xb0`
    
                return `Depth: ${format('.2f')(y[i])} [m]` +
                `<br>` +
                `Lat: ${format('.2f')(x[i])}\xb0` + 
                '<br>' +
                `${infoObject.parameters.fields}: ${format(formatter)(value)} [${infoObject.metadata.Unit}]`;
            }
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

                    connectgaps: false,
                    autocolorscale: false,
                    colorscale: palette,
                    zsmooth: subset.length < 20000 ? 'best' : 'fast',
                    x,
                    y,
                    z,
                    name: infoObject.parameters.fields,
                    type: infoObject.subType === visualizationSubTypes.contourSectionMap ? 'contour' : 'heatmap',
                    colorbar: {
                        title: {
                            text: `[${infoObject.metadata.Unit}]`
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
                title: `${variableName} [${infoObject.metadata.Unit}] ${spaceTitle} ${date}`,
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
    setLoadingMessage
}

const SectionMapChart = (props) => {

    const { classes } = props;
    const { data } = props.chart;
    const { dates, extent, lats, lons } = data;

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
        setLoadingMessage('Processing Data');
    
        setTimeout(() => {
            window.requestAnimationFrame(() => setLoadingMessage(''));
    
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
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setSplitBySpace(!splitBySpace);
        }, 100)
    }

    const onToggleSplitByDate = () => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setSplitByDate(!splitByDate);
        }, 100)
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
                downloadCsv={downloadCsv}
                handleZValueConfirm={handleZValueConfirm}
                zValues={zValues}
                extent={extent}
                downloadCsv={downloadCsv}
            />
            </div>
            {plots}      
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SectionMapChart));
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { setLoadingMessage } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';

import ChartControlPanel from './ChartControlPanel';

const handleSectionMap = (subsets, infoObject, splitByDate, splitBySpace, orientation) => {

    const dates = Array.from(infoObject.dates);

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
                    x: orientation === 'zonal' ? infoObject.lons : infoObject.lats,
                    y: orientation === 'zonal' ? infoObject.zonalPlotDepths : infoObject.meridionalPlotDepths,
                    z: subset,
                    name: infoObject.parameters.fields,
                    type: 'heatmapgl',
                    connectgaps: true,
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
    const { dates, extent, latsDistinct, lonsDistinct } = data;

    const [splitByDate, setSplitByDate] = useState(false);
    const [splitBySpace, setSplitBySpace] = useState(false);
    const [orientation, setOrientation] = useState(data.orientation);
    const [palette, setPalette] = useState('heatmap');
    const [zValues, setZValues] = useState([data.zMin, data.zMax]);
    const [zMin, zMax] = zValues;

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

    return (
        <div>
            <div className={classes.buttonBlock}>
                {/* <Button {...buttonProps} disabled={dates.size === 1} onClick={() => setSplitByDate(!splitByDate)}>{splitByDate ? 'Merge Dates' : 'Split By Date'}</Button>
                <Button {...buttonProps} disabled={numSpaceSplits === 1} onClick={() => setSplitBySpace(!splitBySpace)}>{splitBySpace ? `Merge ${splitOrientation}` : `Split By ${splitOrientation}`}</Button>
                <Button {...buttonProps} disabled={numSpaceSplits === 1} onClick={() => setOrientation(alternateOrientation)}>Switch to {alternateOrientation}</Button> */}
            <ChartControlPanel
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
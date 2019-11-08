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
                annotations: chartBase.annotations(infoObject.metadata.Distributor)             
            }}
            config={{...chartBase.config}}
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

const SparseHistogram = (props) => {

    const { classes } = props;
    const { data } = props.chart;
    const { metadata, parameters } = data;
    const { dates, depths, extent } = data;

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
                downloadCsv={downloadCsv}
            />
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}

            data={[
                {
                    x: data.variableValues,
                    name: data.parameters.fields,
                    type: 'histogram'
                }
            ]}
            
            layout= {{
                width: 800,
                height: 570,
                ...chartBase.layout,
                title: `${parameters.fields} [${metadata.Unit}]`,
                xaxis: {
                    title: `${parameters.fields} [${metadata.Unit}]`,
                    exponentformat: 'power',
                    color: '#ffffff'
                },
                yaxis:{
                    color: '#ffffff',
                    title: 'Frequency'
                },
                annotations: chartBase.annotations(metadata.Distributor)             
            }}
            config={{...chartBase.config}}
        />
        </React.Fragment>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(SparseHistogram));
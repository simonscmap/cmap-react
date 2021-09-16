// Wrapper for histogram plots

import React from 'react';
import { connect } from 'react-redux';

import handleChartDateString from '../../Utility/handleChartDatestring';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import colors from '../../enums/colors';

import chartBase from '../../Utility/chartBase';

import { csvFromVizRequestSend } from '../../Redux/actions/visualization';

import ChartControlPanel from './ChartControlPanel';

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
    csvFromVizRequestSend
}

// User for all histograms sparse or otherwise
const Histogram = props => {
    const { csvFromVizRequestSend } = props;
    const { data } = props.chart;
    const { metadata, parameters } = data;

    const downloadCsv = () => {
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
    }

    const date = parameters.dt1 === parameters.dt2 ? handleChartDateString(parameters.dt1) :
        handleChartDateString(parameters.dt1) + ' to ' + handleChartDateString(parameters.dt2);

    const lat = parameters.lat1 === parameters.lat2 ? parameters.lat1 + '\xb0' :
        parameters.lat1 + '\xb0 to ' + parameters.lat2 + '\xb0';

    const lon = parameters.lon1 === parameters.lon2 ? parameters.lon1 + '\xb0' :
        parameters.lon1 + '\xb0 to ' + parameters.lon2 + '\xb0';

    const depth = !data.hasDepth ? 'Surface' :
        parameters.depth1 === parameters.depth2 ? `${parameters.depth1}[m]` :
        `${parameters.depth1}[m] to ${parameters.depth2}[m]`;
        
    return (
        <React.Fragment>
            <ChartControlPanel
                downloadCsv={downloadCsv}
                chart={props.chart}
            />
        <Plot
            style= {{
                position: 'relative',
                // display:'inline-block',
                width: '60vw',
                height: '40vw'
            }}

            // onHover={(e, e2) => {
            //     console.log(e);
            //     console.log(e2)
            // }}

            // onUnhover={(e, e2) => {
            //     console.log(e);
            //     console.log(e2)
            // }}

            useResizeHandler={true}

            data={[
                {
                    x: data.variableValues,
                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
                    type: 'histogram',
                    marker: {
                        color: '#00FFFF'
                    }
                }
            ]}
            
            layout= {{
                ...chartBase.layout,                
                title: chartBase.title(metadata, date, lat, lon, depth),
                xaxis: {
                    title: `${metadata.Long_Name.length > 35 ? metadata.Long_Name.slice(0, 35) + '...' : metadata.Long_Name} [${metadata.Unit}]`,
                    exponentformat: 'power',
                    color: '#ffffff'
                },
                yaxis:{
                    color: '#ffffff',
                    title: 'Count'
                },
                annotations: chartBase.annotations(metadata.Distributor, metadata.Data_Source)             
            }}
            config={{...chartBase.config}}
        />
        </React.Fragment>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(Histogram));
// Wrapper for scatter / line plots

import React from 'react';
import Plot from 'react-plotly.js';

import chartBase from '../../Utility/chartBase';
import handleChartDateString from '../../Utility/handleChartDatestring';

import { format } from 'd3-format';

const SparseScatter = (props) => {
    const {
        xValues,
        yValues,
        markerOptions,
        infoObject,
        xTitle,
        yTitle,
        type
    } = props;

    const { parameters, metadata, hasDepth, variableValues, times, lats, lons, depths } = infoObject;

    var hovertext;

    switch(type){
        case 'time':
            hovertext = variableValues.map((value, i) => {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                let time= times[i].slice(0,20);
                time = time.replace('T', ' ');
                return `Time: ${time}<br>${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
            })
            break;

        case 'latitude':
            hovertext = variableValues.map((value, i) => {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                return `Lat: ${lats[i].toFixed(2)}<br>${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
            })
            break;

        case 'longitude':
            hovertext = variableValues.map((value, i) => {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                return `Lon: ${lons[i].toFixed(2)}<br>${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
            })
            break;

        case 'depth':
            hovertext = variableValues.map((value, i) => {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                return `Depth: ${depths[i].toFixed(2)}<br>${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
            })
            break;

        default:
            hovertext = variableValues.map((value, i) => {
                let formatter = value > 1 && value < 1000 ? '.2f' : '.2e';
                let time= times[i].slice(0,20);
                time = time.replace('T', ' ');
                return `Time: ${time}<br>${parameters.fields}: ${format(formatter)(value)} [${metadata.Unit}]`
            })
        }
        
    const date = parameters.dt1 === parameters.dt2 ? handleChartDateString(parameters.dt1) :
        handleChartDateString(parameters.dt1) + ' to ' + handleChartDateString(parameters.dt2);

    const lat = parameters.lat1 === parameters.lat2 ? parameters.lat1 + '\xb0' :
        parameters.lat1 + '\xb0 to ' + parameters.lat2 + '\xb0';

    const lon = parameters.lon1 === parameters.lon2 ? parameters.lon1 + '\xb0' :
        parameters.lon1 + '\xb0 to ' + parameters.lon2 + '\xb0';

    const depth = !hasDepth ? 'Surface' :
        parameters.depth1 === parameters.depth2 ? `${parameters.depth1}[m]` :
        `${parameters.depth1}[m] to ${parameters.depth2}[m]`;

    return (
        <Plot
            style= {{
                position: 'relative',
                // display:'inline-block',
                width: '60vw',
                height: '40vw'
            }}

            useResizeHandler={true}
    
            data={[
                {
                    x: xValues,
                    y: yValues,
                    mode: 'markers',
                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
                    type: variableValues.length > 10000 ? 'scattergl' : 'scatter',
                    // type: 'scatter',
                    marker: {
                        opacity: markerOptions.opacity,
                        size: markerOptions.size,
                        color: markerOptions.color
                    },
                    hoverinfo: 'text',
                    hovertext
                },
            ]}
            config={{...chartBase.config}}
            layout= {{
                ...chartBase.layout,
                title: chartBase.title(metadata, date, lat, lon, depth),
                xaxis: {
                    title: xTitle,
                    color: '#ffffff',
                    exponentformat: 'power'
                },
                yaxis: {
                    title: yTitle,
                    color: '#ffffff',
                    exponentformat: 'power',
                    autorange: type === 'depth' ? 'reversed' : true
                },
                annotations: chartBase.annotations(metadata.Distributor, metadata.Data_Source)
            }}            
        />
    )
}

export default SparseScatter;
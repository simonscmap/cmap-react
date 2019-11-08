import React from 'react';
import Plot from 'react-plotly.js';

import chartBase from '../../Utility/chartBase';

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

    const title = `${parameters.fields} [${metadata.Unit}]`;
    
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

    return (
        <Plot
            style= {{
                position: 'relative',
                display:'inline-block'
            }}
    
            data={[
                {
                    x: xValues,
                    y: yValues,
                    mode: 'markers',
                    name: parameters.fields,
                    type: variableValues.length > 1000 ? 'scattergl' : 'scatter',
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
                plot_bgcolor: 'transparent',
                width: 800,
                height: 570,
                title,
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
                annotations: chartBase.annotations(metadata.Distributor)
            }}            
        />
    )
}

export default SparseScatter;
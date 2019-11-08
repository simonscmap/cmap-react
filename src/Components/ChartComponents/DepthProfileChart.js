import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import { setLoadingMessage } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';
import chartBase from '../../Utility/chartBase';

import { format } from 'd3-format';

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

const DepthProfileChart = (props) => {

    const { classes, setLoadingMessage } = props;
    const { data } = props.chart;
    const { stds, variableValues, depths, parameters, metadata } = data;

    const [markerOptions, setMarkerOptions] = React.useState({opacity: .2, color:'#ff1493', size: 12})

    let hovertext = variableValues.map((value, i) => {
        return `Depth: ${format('.2f')(depths[i])} [m] <br>${parameters.fields}: ${format('.2e')(value)} \xb1 ${format('.2e')(stds[i])} [${metadata.Unit}]`;
    })

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

    const handleMarkerOptionsConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setMarkerOptions(values);
        }, 100)
    }


    return (
        <div>
            <ChartControlPanel
                downloadCsv={downloadCsv}
                handleMarkerOptionsConfirm={handleMarkerOptionsConfirm}
                markerOptions={markerOptions}
            />
            <Plot
                style= {{
                    position: 'relative',
                    display:'inline-block'
                }}

                data={[
                    {   
                        mode: 'lines+markers',
                        y: depths,
                        x: variableValues,
                        error_x: {
                            type: 'data',
                            array: stds,
                            opacity: 0.3,
                            color: '#f2f2f2',
                            visible: true
                        },
                        name: parameters.fields,
                        type: 'scatter',

                        marker: {
                            line: {color: markerOptions.color},
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
                    title: `${parameters.fields} [${metadata.Unit}]  ${parameters.depth1} to ${parameters.depth2} meters`,
                  yaxis: {
                      title: 'Depth[m]',
                      color: '#ffffff',
                      exponentformat: 'power',
                      autorange:'reversed'
                    },
                  xaxis: {
                      title: `${parameters.fields}[${metadata.Unit}]`,
                      color: '#ffffff',
                      exponentformat: 'power'
                    },
                  annotations: chartBase.annotations(metadata.Distributor)
                }}
                
            />
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(DepthProfileChart));
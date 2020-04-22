import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import { setLoadingMessage } from '../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../Redux/actions/visualization';

import colors from '../../Enums/colors';
import chartBase from '../../Utility/chartBase';

import { format } from 'd3-format';

import handleChartDateString from '../../Utility/handleChartDatestring';

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
    csvFromVizRequestSend
}

const DepthProfileChart = (props) => {

    const { setLoadingMessage, csvFromVizRequestSend } = props;
    const { data } = props.chart;
    const { stds, variableValues, depths, parameters, metadata } = data;

    const [ showLines, setShowLines ] = React.useState(true);
    const [ showErrorBars, setShowErrorBars ] = React.useState(variableValues && variableValues.length <= 40 ? true : false);

    var infoObject = data;

    const [markerOptions, setMarkerOptions] = React.useState({opacity: .2, color:'#ff1493', size: 12})

    let hovertext = variableValues.map((value, i) => {
        return `Depth: ${format('.2f')(depths[i])} [m] <br>${parameters.fields}: ${format('.2e')(value)} \xb1 ${format('.2e')(stds[i])} [${metadata.Unit}]`;
    })

    const downloadCsv = () => {
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
    }    

    const handleMarkerOptionsConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setMarkerOptions(values);
        }, 100)
    }

    const handleSetShowLines = (value) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setShowLines(value);
        }, 50)
    }

    const handleSetShowErrorBars = (value) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setShowErrorBars(value);
        }, 50)
    }

    const date1 = infoObject.isMonthly ? new Date(parameters.dt1).getMonth() + 1 : parameters.dt1;
    const date2 = infoObject.isMonthly ? new Date(parameters.dt2).getMonth() + 1 : parameters.dt2;

    const date = date1 === date2 ? handleChartDateString(date1, infoObject.hasHour, infoObject.isMonthly) :
            handleChartDateString(date1, infoObject.hasHour, infoObject.isMonthly) + ' to ' + handleChartDateString(date2, infoObject.hasHour, infoObject.isMonthly);
    console.log(data);
    return (
        <div>
            <ChartControlPanel
                downloadCsv={downloadCsv}
                handleMarkerOptionsConfirm={handleMarkerOptionsConfirm}
                markerOptions={markerOptions}
                showErrorBars={showErrorBars}
                handleSetShowErrorBars={handleSetShowErrorBars}
                showLines={showLines}
                handleSetShowLines={handleSetShowLines}
            />
            <Plot
                style= {{
                    position: 'relative',
                    width: '60vw',
                    height: '40vw'
                }}

                useResizeHandler={true}

                data={[
                    {   
                        // mode: 'lines+markers',
                        mode: showLines ? 'lines+markers' : 'markers',
                        y: depths,
                        x: variableValues,
                        error_x: {
                            type: 'data',
                            array: stds,
                            opacity: 0.3,
                            color: showErrorBars ? '#f2f2f2' : 'transparent',
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
                    title: {
                        text: `${parameters.fields} [${metadata.Unit}]` + 
                            `<br>${date}, ` + 
                            `${parameters.depth1}[m] to ${parameters.depth2}[m] <br>` + 
                            `Lat: ${parameters.lat1}\xb0 to ${parameters.lat2}\xb0, ` +
                            `Lon: ${parameters.lon1}\xb0 to ${parameters.lon2}\xb0`,
                        font: {
                            size: 13
                        }
                    },
                        
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
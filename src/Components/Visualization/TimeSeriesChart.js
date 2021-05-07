import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import colors from '../../Enums/colors';
import months from '../../Enums/months';
import chartBase from '../../Utility/chartBase';
import handleChartDateString from '../../Utility/handleChartDatestring';

import ChartControlPanel from './ChartControlPanel';

import { setLoadingMessage } from '../../Redux/actions/ui';
import { csvFromVizRequestSend } from '../../Redux/actions/visualization';

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
    setLoadingMessage,
    csvFromVizRequestSend
}

const TimeSeriesChart = (props) => {
    const { csvFromVizRequestSend } = props;
    const { data } = props.chart;
    const { stds, variableValues, dates, parameters, metadata } = data;

    const [ markerOptions, setMarkerOptions ] = React.useState({opacity: .2, color:'#ff1493', size: 6});
    const [ showLines, setShowLines ] = React.useState(true);
    const [ showErrorBars, setShowErrorBars ] = React.useState(variableValues && variableValues.length <= 40 ? true : false);

    const downloadCsv = () => {
        csvFromVizRequestSend(data, metadata.Table_Name, metadata.Variable, metadata.Long_Name);
    }

    const handleMarkerOptionsConfirm = (values) => {
        props.setLoadingMessage('Re-rendering');
        setTimeout(() => {
            window.requestAnimationFrame(() => props.setLoadingMessage(''));
            setMarkerOptions(values);
        }, 50)
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

    let hovertext = variableValues.map((value, i) => {
        return `Time: ${dates[i].slice(0,10)}<br>${parameters.fields}: ${format('.2e')(value)} \xb1 ${format('.2e')(stds[i])} [${metadata.Unit}]`;
    })

    const date = parameters.dt1 === parameters.dt2 ? handleChartDateString(dates[0], data.hasHour, data.isMonthly) :
        handleChartDateString(dates[0], data.hasHour, data.isMonthly) + ' to ' + handleChartDateString(dates[dates.length - 1], data.hasHour, data.isMonthly);

    const lat = parameters.lat1 === parameters.lat2 ? parameters.lat1 + '\xb0' :
        parameters.lat1 + '\xb0 to ' + parameters.lat2 + '\xb0';

    const lon = parameters.lon1 === parameters.lon2 ? parameters.lon1 + '\xb0' :
        parameters.lon1 + '\xb0 to ' + parameters.lon2 + '\xb0';

    const depth = parameters.depth2 === 0 ? 'Surface' :
        parameters.depth1 === parameters.depth2 ? `${parameters.depth1}[m]` :
        `${parameters.depth1}[m] to ${parameters.depth2}[m]`;

    const x = data.isMonthly ? dates.map(date => months[parseInt(date)]) : dates;

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
                chart={props.chart}
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
                    x: x,
                    y: variableValues,
                    error_y: {
                        type: 'data',
                        array: stds,
                        opacity: 0.3,
                        color: showErrorBars ? '#f2f2f2' : 'transparent',
                        visible: true
                    },

                    name: `${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name}`,
                    // type: 'scatter',
                    type: variableValues.length > 10000 ? 'scattergl' : 'scatter',
                    line: {color: markerOptions.color},
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
                    title: {
                        text: `${metadata.Dataset_Name}` +
                            `<br>${metadata.Long_Name.length > 60 ? metadata.Long_Name.slice(0, 60) + '...': metadata.Long_Name} [${metadata.Unit}]` + 
                            `<br>${date}, ` + 
                            depth + 
                            `<br>Lat: ${lat}, ` +
                            `Lon: ${lon}`,
                        font: {
                            size: 12
                        }
                    },
                  xaxis: {
                      title: data.isMonthy? 'Month' : 'Time',
                      color: '#ffffff',
                      exponentformat: 'power'
                    },
                  yaxis: {
                      title: `${metadata.Long_Name.length > 35 ? metadata.Long_Name.slice(0, 35) + '...' : metadata.Long_Name} [${metadata.Unit}]`,
                      color: '#ffffff',
                      exponentformat: 'power'
                    },
                  annotations: chartBase.annotations(metadata.Distributor, metadata.Data_Source)
                }}
                
            />
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(TimeSeriesChart));
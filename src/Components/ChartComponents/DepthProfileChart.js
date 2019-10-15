import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import ChartControlPanel from './ChartControlPanel';

import { setLoadingMessage } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';

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

    return (
        <div>
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
                  x: depths,
                  y: variableValues,
                  error_y: {
                    type: 'data',
                    array: stds,
                    opacity: 0.2,
                    color: 'gray',
                    visible: true
                  },
                  name: parameters.fields,
                  type: 'scatter',
                  line: {color: '#e377c2'},
                  },
                ]}

                layout= {{
                    title: `${parameters.fields}[${metadata.Unit}]  ${parameters.depth1} to ${parameters.depth2} meters`,

                    paper_bgcolor: colors.backgroundGray,
                    font: {
                        color: '#ffffff'
                    },
                  xaxis: {
                      title: 'Depth[m]',
                      color: '#ffffff',
                      exponentformat: 'power'
                    },
                  yaxis: {
                      title: `${parameters.fields}[${metadata.Unit}]`,
                      color: '#ffffff',
                      exponentformat: 'power'
                    },
                  annotations: [
                    {
                        text: `Source: ${metadata.Distributor.length < 30 ? 
                                metadata.Distributor : 
                                metadata.Distributor.slice(0,30)} -- Provided by Simons CMAP`,
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
        </div>
    )
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(DepthProfileChart));
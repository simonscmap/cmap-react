import React, { useState } from 'react';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import { Paper, Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';

import colors from '../../Enums/colors';

const styles = theme => ({
    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white',
        backgroundColor: colors.backgroundGray
    },
    buttonBlock: {
        display:'block'
    }
})

const buttonProps = {
    size: 'small',
    color: 'primary',
    variant: 'contained'
}

const DepthProfileChart = (props) => {

    const { classes } = props;
    const { data, subType } = props.chart;
    const { stds, variableValues, depths, parameters, metadata } = data;

    return (
        <div>
            <div className={classes.buttonBlock}>
            </div>
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

export default withStyles(styles)(DepthProfileChart);
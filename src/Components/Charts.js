import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Plot from 'react-plotly.js';

import vizSubTypes from '../Enums/visualizationSubTypes';
import { Paper, Typography } from '@material-ui/core';

import colors from '../Enums/colors';
import storedProcedures from '../Enums/storedProcedures';

import SpaceTimeChart from './ChartTypes/SpaceTimeChart';
import TimeSeriesChart from './ChartTypes/TimeSeriesChart';
import DepthProfileChart from './ChartTypes/DepthProfileChart';
import SectionMapChart from './ChartTypes/SectionMapChart';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    chartsContainer: {
        margin: '260px 0 0 100px'
    },

    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white',
        backgroundColor: colors.backgroundGray
    }
})



const handleTimeSeries = (chart) => ({
    parameters: chart.parameters,
    metadata: chart.metadata,
    subType: chart.subType,
    data: [
      {
      x: chart.data.map(row => row.time || row.month),
      y: chart.data.map(row => row[chart.parameters.fields]),
      error_y: {
        type: 'data',
        array: chart.data.map(row => row[chart.parameters.fields + '_std']),
        opacity: 0.2,
        color: 'gray',
        visible: true
      },
      name: chart.parameters.fields,
      type: 'scatter',
      line: {color: '#e377c2'},
      },
    ],
    layout: {
      xaxis: {title: chart.data[0].time ? 'Time' : 'Month'},
      yaxis: {title: chart.parameters.fields}
    }
  })

const handleSectionMap = (chart) => ({
    parameters: chart.parameters,
    metadata: chart.metadata,
    subType: chart.subType,
    data: [
      {
      x: chart.data.map(row => row.lat),
      y: chart.data.map(row => row.depth),
      z: chart.data.map(row => row[chart.parameters.fields]),
      name: chart.parameters.fields,
      type: 'heatmap',
      }
    ],
    layout: {
      xaxis: {title: 'Latitude'},
      yaxis: {autorange: 'reversed', title: 'Depth [m]'}
    }
  })

const handleDepthProfile = (chart) => ({
    parameters: chart.parameters,
    metadata: chart.metadata,
    subType: chart.subType,
    data: [
      {
        x: chart.data.map(row => row.depth),
        y: chart.data.map(row => row[chart.parameters.fields]),
        error_y: {
          type: 'data',
          array: chart.data.map(row => row[chart.parameters.fields] + '_std'),
          opacity: 0.2,
          color: 'gray',
          visible: true
        },
        name: chart.parameters.fields,
        type: 'scatter',
        line: {color: '#e377c2'},
        },
    ],
    layout: {
      xaxis: {title: 'Depth [m]'},
      yaxis: {title: chart.parameters.fields}
    }
  })



class Charts extends Component {

    render(){
        const { classes, charts } = this.props;

        return (
            <div className={classes.chartsContainer}>
                {charts.map((chart, index) => {
                    switch(chart.data.parameters.spName){
                        case storedProcedures.spaceTime:
                          return <SpaceTimeChart chart={chart} key={index}/>

                        case storedProcedures.timeSeries:
                          return <TimeSeriesChart chart={chart} key={index}/>

                        case storedProcedures.depthProfile:
                          return <DepthProfileChart chart={chart} key={index}/>

                        case storedProcedures.sectionMap:
                          return <SectionMapChart chart={chart} key={index}/>
                        
                        default:
                          break;
                  }
                })}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts));

{/* <div key={index} className={classes.chartWrapper}>
<Plot
    style= {{
        position: 'relative',
        display:'inline-block'
    }}
    key={index}
    layout= {{...chart.layout,

        title: `${chart.parameters.fields} - ${chart.subType} - ${chart.parameters.dt1} - ${Number(chart.parameters.depth1) || 'Surface'}`,
        font: {... chart.layout.font,
            color: '#ffffff'
        },

        xaxis: {...chart.layout.xaxis,
            color: '#ffffff'
        },

        yaxis: {...chart.layout.yaxis,
            color: '#ffffff'
        },

        paper_bgcolor: colors.backgroundGray,

        annotations: [
            {
                text: `Source: ${chart.metadata.distributor.length < 30 ? 
                        chart.metadata.distributor : 
                        chart.metadata.distributor.slice(0,30)} -- Provided by Simons CMAP`,
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
    data={chart.data}
/>
</div>   */}
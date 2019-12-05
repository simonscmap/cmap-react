import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';

import { IconButton, Paper } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import colors from '../Enums/colors';
import storedProcedures from '../Enums/storedProcedures';
import vizSubTypes from '../Enums/visualizationSubTypes';

import SpaceTimeChart from './ChartComponents/SpaceTimeChart';
import TimeSeriesChart from './ChartComponents/TimeSeriesChart';
import DepthProfileChart from './ChartComponents/DepthProfileChart';
import SectionMapChart from './ChartComponents/SectionMapChart';
import SparseMap from './ChartComponents/SparseMap';
import SparseHistogram from './ChartComponents/SparseHistogram';

import spatialResolutions from '../Enums/spatialResolutions';

import { deleteChart } from '../Redux/actions/visualization';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const mapDispatchToProps = {
  deleteChart
}

const styles = (theme) => ({
    chartsContainer: {
        margin: '300px 0 0 100px'
    },

    chartPaper: {
      margin: '60px auto 0px auto',
      width: '1000px',
      paddingTop: '16px'
  },

    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white',
    }
})

const SamplePlot = () => {
  let x = [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4];
  let y = [0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,];
  let z = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,1,2,3,4,5,6,7,8,9];
  // z = z.map(() => Math.floor(Math.random() * 100));
  return (

      <Plot
      style= {{
          position: 'relative',
          display:'inline-block',
          marginTop: '50px'
      }}
      
      data={[
          {   
              x,
              y,
              z,
              connectgaps: false,
              zsmooth: 'best',
              
              name: 'Test',
              type: 'heatmap',
              contours: {
                  showlabels: true,
                  labelfont: {
                      family: 'Raleway',
                      size: 12,
                      color: 'white',
                  },
                  labelformat: '.2e'
              },
              colorbar: {
                  title: {
                      text: `test`
                  },
                  exponentformat: 'power'
              }
          }
      ]}
      
      layout= {{
          font: {color: '#ffffff'},
          margin: {
            t: 50
          },
          title: {
              text: `A sample chart title`,
              // yanchor: 'bottom',
              // y: .9,
              // yref: 'container',
              font: {
                size: 18
              }
          },
          paper_bgcolor: colors.backgroundGray,
          xaxis: {title: 'Longitude', color: '#ffffff'},
          yaxis: {title: 'Latitude', color: '#ffffff'},
          annotations: [
              {
                  text: `test`,
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
          )
      }

const closeChartStyles = {
    closeChartIcon: {
      float: 'right',
      marginTop: '-16px'
    }
}

const _CloseChartIcon = (props) => {
  const { classes } = props;
  return (
    <React.Fragment>
      <IconButton className={classes.closeChartIcon} color="inherit" onClick={() => props.handleDeleteChart(props.chartIndex)} disableFocusRipple disableRipple>
        <Close/>
      </IconButton>
    </React.Fragment>
  )
}

const CloseChartIcon = withStyles(closeChartStyles)(_CloseChartIcon);

class Charts extends Component {

  handleDeleteChart = (chartIndex) => {
    this.props.deleteChart(chartIndex);
  }

    render(){
        const { classes, charts } = this.props;
        return (
            <React.Fragment>
              {/* <SamplePlot/>  */}
                {charts.map((chart, index) => {
                    switch(chart.data.parameters.spName){

                        case storedProcedures.spaceTime:
                          if(chart.subType === vizSubTypes.sparse) {
                            return (
                              <Paper elevation={12} className={classes.chartPaper} key={index}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <SparseMap chart={chart}/>
                              </Paper>
                            )
                          } else if(chart.data.metadata.Spatial_Resolution === spatialResolutions.irregular) {
                            return (
                              <Paper elevation={12} className={classes.chartPaper} key={index}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <SparseHistogram chart={chart}/>
                              </Paper>
                            )
                          }
                          else return (
                            <Paper elevation={12} className={classes.chartPaper} key={index}>
                              <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                              <SpaceTimeChart chart={chart}/>
                            </Paper>
                          )

                        case storedProcedures.timeSeries:
                          return (
                            <Paper elevation={12} className={classes.chartPaper} key={index}>
                              <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                              <TimeSeriesChart chart={chart}/>
                            </Paper>
                          )

                        case storedProcedures.depthProfile:
                          return (
                            <Paper elevation={12} className={classes.chartPaper} key={index}>
                              <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                              <DepthProfileChart chart={chart}/>
                            </Paper>
                          )

                        case storedProcedures.sectionMap:
                          return (
                            <Paper elevation={12} className={classes.chartPaper} key={index}>
                              <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                              <SectionMapChart chart={chart}/>
                            </Paper>
                          )
                        
                        default:
                          return '';
                  }
                })}
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts));
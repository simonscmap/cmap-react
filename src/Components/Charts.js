import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';

import { IconButton, Paper } from '@material-ui/core';
import { Close, StarHalf } from '@material-ui/icons';

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
    chartPaper: {
      margin: '60px auto 20px auto',
      // width: '90%'
      paddingTop: '16px',
      display: 'inline-block'
  },
})

const SamplePlot = () => {
  let x = [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4];
  let y = [0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,0,1,2,5,9,];
  let z = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,1,2,3,4,5,6,7,8,9];
  // z = z.map(() => Math.floor(Math.random() * 100));
  const xRange = x[x.length - 1] - x[0];
  const yRange = y[y.length - 1] - y[0];
  const ratio = xRange / yRange;

  let height = 44;
  let width = 66;

  if(ratio > 1) height = height / ratio;
  else width = width * ratio;
  
  return (

      <Plot
      useResizeHandler={true}
      style= {{
          position: 'relative',
          display:'inline-block',
          marginTop: '30px',
          width: '66vw',
          height: '44vw'

          // width: '1200px',
          // height: '100%'
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
        autosize: true,
        // width: '100%',
          font: {color: '#ffffff'},
          margin: {
            t: 50
          },
          title: {
              text: `A sample chart title`,
              // yanchor: 'bottom',
              // y: 'auto',
              // y: .5,
              // yref: 'container',
              font: {
                size: 16
              }
          },
          paper_bgcolor: colors.backgroundGray,
          xaxis: {title: 'Longitude', color: '#ffffff'},
          yaxis: {title: 'Latitude', color: '#ffffff'},
          annotations: [
              {
                  text: `Brought to you by chef boyardee`,
                    font: {
                        color: 'white',
                        size: 10
                    },
                  // xref: 'paper',
                  yref: 'paper',
                  y: -.24,
                  // yshift: 0,
                  showarrow: false,
                  xref: 'paper',
                  x: .5
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
              {/* <Paper elevation={12} className={classes.chartPaper}>
              <SamplePlot/> 
              </Paper> */}
                {charts.map((chart, index) => {
                    switch(chart.data.parameters.spName){

                        case storedProcedures.spaceTime:
                          if(chart.subType === vizSubTypes.sparse) {
                            return (
                              <div key={chart.id}>
                                <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                  <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                  <SparseMap chart={chart}/>
                                </Paper>
                              </div>
                            )
                          } else if(chart.data.metadata.Spatial_Resolution === spatialResolutions.irregular) {
                            return (
                              <div key={chart.id}>
                                <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                  <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                  <SparseHistogram chart={chart}/>
                                </Paper>
                              </div>
                            )
                          }
                          else return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <SpaceTimeChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.timeSeries:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <TimeSeriesChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.depthProfile:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <DepthProfileChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.sectionMap:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <SectionMapChart chart={chart}/>
                              </Paper>
                            </div>
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
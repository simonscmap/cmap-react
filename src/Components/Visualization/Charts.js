import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Plot from 'react-plotly.js';

import { IconButton, Paper } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import colors from '../../Enums/colors';
import storedProcedures from '../../Enums/storedProcedures';
import vizSubTypes from '../../Enums/visualizationSubTypes';

import SpaceTimeChart from './SpaceTimeChart';
import TimeSeriesChart from './TimeSeriesChart';
import DepthProfileChart from './DepthProfileChart';
import SectionMapChart from './SectionMapChart';
import SparseMap from './SparseMap';
import SparseHistogram from './SparseHistogram';

import spatialResolutions from '../../Enums/spatialResolutions';

import { deleteChart } from '../../Redux/actions/visualization';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts,
    plotsActiveTab: state.plotsActiveTab
})

const mapDispatchToProps = {
  deleteChart
}

const styles = (theme) => ({
  chartPaper: {
    backgroundColor: colors.backgroundGray,
    marginBottom: '5h',
    paddingTop: theme.spacing(1),
    boxShadow: '2px 2px 2px 2px #242424',    
    width: 'max-content',
    margin: '0 auto 5vh auto',
    '@media (min-width: 1280px)': {
      textAlign: 'left',
      margin: '0 0 5vh 360px'
    }
  }
})

const SamplePlot = () => {
  let x = [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4];
  let y = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,];
  let z = [0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4,0,1,2,3,4];
  
  return (

      <Plot
      useResizeHandler={true}
      style= {{
          position: 'relative',
          display:'inline-block',
          // marginTop: '30px',
          width: '66vw',
          height: '44vw'
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

      config={{responsive: true}}
      
      layout= {{
        autosize: true,
          font: {color: '#ffffff'},
          margin: {
            t: 50
          },
          title: {
              text: `A sample chart title`,
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
                  yref: 'paper',
                  y: -.24,
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
      marginTop: '-12px',
      marginRight: '-8px'
    }
}

const _CloseChartIcon = (props) => {
  const { classes } = props;
  return (
    <React.Fragment>
      <IconButton className={classes.closeChartIcon} color="inherit" onClick={() => props.handleDeleteChart(props.chartIndex)} disableFocusRipple disableRipple>
        <Delete/>
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
        const { classes, charts, plotsActiveTab } = this.props;
        
        return (
            <React.Fragment>
              {/* <Paper elevation={12} className={classes.chartPaper}> */}
              {/* <SamplePlot/>  */}
              {/* </Paper> */}
                {charts.map((chart, index) => {
                    switch(chart.data.parameters.spName){

                        case storedProcedures.spaceTime:
                          if(chart.subType === vizSubTypes.sparse) {
                            return (
                              <div key={chart.id}>
                                <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
                                  <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                  <SparseMap chart={chart}/>
                                </Paper>
                              </div>
                            )
                          } else if(chart.data.metadata.Spatial_Resolution === spatialResolutions.irregular) {
                            return (
                              <div key={chart.id}>
                                <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                                {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
                                  <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                  <SparseHistogram chart={chart}/>
                                </Paper>
                              </div>
                            )
                          }
                          else return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                              {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <SpaceTimeChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.timeSeries:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                              {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <TimeSeriesChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.depthProfile:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                              {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
                                <CloseChartIcon chartIndex={index} handleDeleteChart={this.handleDeleteChart}/>
                                <DepthProfileChart chart={chart}/>
                              </Paper>
                            </div>
                          )

                        case storedProcedures.sectionMap:
                          return (
                            <div key={chart.id}>
                              <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
                              {/* <Paper elevation={12} className={classes.chartPaper} key={chart.id} style={index === plotsActiveTab - 1 ? {} : {display: 'none'}}> */}
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
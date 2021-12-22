// Wrapper for charts

// import Plot from 'react-plotly.js';
import { IconButton, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import colors from '../../enums/colors';
import spatialResolutions from '../../enums/spatialResolutions';
import storedProcedures from '../../enums/storedProcedures';
import vizSubTypes from '../../enums/visualizationSubTypes';
import { deleteChart } from '../../Redux/actions/visualization';
import DepthProfileChart from './DepthProfileChart';
import Histogram from './Histogram';
import SectionMapChart from './SectionMapChart';
import SpaceTimeChart from './SpaceTimeChart';
import SparseMap from './SparseMap';
import TimeSeriesChart from './TimeSeriesChart';

const mapStateToProps = (state) => ({
  charts: state.charts,
  plotsActiveTab: state.plotsActiveTab,
});

const mapDispatchToProps = {
  deleteChart,
};

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
      margin: '0 0 5vh 360px',
    },
  },
});

const closeChartStyles = {
  closeChartIcon: {
    float: 'right',
    marginTop: '-12px',
    marginRight: '-8px',
  },
};

const _CloseChartIcon = (props) => {
  const { classes } = props;
  return (
    <React.Fragment>
      <IconButton
        className={classes.closeChartIcon}
        color="inherit"
        onClick={() => props.handleDeleteChart(props.chartIndex)}
        disableFocusRipple
        disableRipple
      >
        <Delete />
      </IconButton>
    </React.Fragment>
  );
};

const CloseChartIcon = withStyles(closeChartStyles)(_CloseChartIcon);

const ChartWrapper = ({
  chart,
  chartIndex,
  classes,
  handleDelete,
  children,
}) => {
  return (
    <div key={chart.id}>
      <Paper elevation={12} className={classes.chartPaper} key={chart.id}>
        <CloseChartIcon
          chartIndex={chartIndex}
          handleDeleteChart={handleDelete}
        />
        <React.Fragment>{children}</React.Fragment>
      </Paper>
    </div>
  );
};

class Charts extends Component {
  handleDeleteChart = (chartIndex) => {
    this.props.deleteChart(chartIndex);
  };

  render() {
    const { classes, charts, plotsActiveTab } = this.props;

    return (
      <React.Fragment>
        {charts.map((chart, index) => {
          switch (chart.data.parameters.spName) {
            case storedProcedures.spaceTime:
              if (chart.subType === vizSubTypes.sparse) {
                return (
                  <ChartWrapper
                    chart={chart}
                    chartIndex={index}
                    handleDelete={this.handleDeleteChart}
                    classes={classes}
                  >
                    <SparseMap chart={chart} />
                  </ChartWrapper>
                );
              } else if (
                chart.data.metadata.Spatial_Resolution ===
                spatialResolutions.irregular
              ) {
                return (
                  <div key={chart.id}>
                    <Paper
                      elevation={12}
                      className={classes.chartPaper}
                      key={chart.id}
                    >
                      <CloseChartIcon
                        chartIndex={index}
                        handleDeleteChart={this.handleDeleteChart}
                      />
                      <Histogram chart={chart} />
                    </Paper>
                  </div>
                );
              } else
                return (
                  <div key={chart.id}>
                    <Paper
                      elevation={12}
                      className={classes.chartPaper}
                      key={chart.id}
                    >
                      <CloseChartIcon
                        chartIndex={index}
                        handleDeleteChart={this.handleDeleteChart}
                      />
                      <SpaceTimeChart chart={chart} />
                    </Paper>
                  </div>
                );

            case storedProcedures.timeSeries:
              return (
                <div key={chart.id}>
                  <Paper
                    elevation={12}
                    className={classes.chartPaper}
                    key={chart.id}
                  >
                    <CloseChartIcon
                      chartIndex={index}
                      handleDeleteChart={this.handleDeleteChart}
                    />
                    <TimeSeriesChart chart={chart} />
                  </Paper>
                </div>
              );

            case storedProcedures.depthProfile:
              return (
                <div key={chart.id}>
                  <Paper
                    elevation={12}
                    className={classes.chartPaper}
                    key={chart.id}
                  >
                    <DepthProfileChart chart={chart} />
                    <CloseChartIcon
                      chartIndex={index}
                      handleDeleteChart={this.handleDeleteChart}
                    />
                  </Paper>
                </div>
              );

            case storedProcedures.sectionMap:
              return (
                <div key={chart.id}>
                  <Paper
                    elevation={12}
                    className={classes.chartPaper}
                    key={chart.id}
                  >
                    <CloseChartIcon
                      chartIndex={index}
                      handleDeleteChart={this.handleDeleteChart}
                    />
                    <SectionMapChart chart={chart} />
                  </Paper>
                </div>
              );

            default:
              return '';
          }
        })}
      </React.Fragment>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(Charts));

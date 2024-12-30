/* Main Visualization Component
   Contains Chart, Trajectories, Control Panel
 */
import { ThemeProvider, withStyles } from '@material-ui/core';
import { loadModules } from 'esri-loader';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import colors from '../../enums/colors';
import metaTags from '../../enums/metaTags';
import { showLoginDialog, snackbarOpen } from '../../Redux/actions/ui';
import {
  completedShowCharts,
  cruiseListRequestSend,
  guestPlotLimitNotificationSetIsVisible,
  plotsActiveTabSet,
  queryRequestSend,
  storedProcedureRequestSend,
} from '../../Redux/actions/visualization';
import stars from '../../Utility/starsBase64';
// import { pick } from '../../Utility/objectUtils';
import Intro from '../Navigation/Help/Intro';
import Charts from './Charts/Charts';
import CruiseSelector from './CruiseSelector';
import GuestPlotLimitNotification from './GuestPlotLimitNotification';
import visualizationTourConfig from './help/tourConfig';
import MapContainer from './MapContainer';
import ModuleSelector from './ModuleSelector';
import VizControlPanel from './VizControlPanel';

export const visualizationConfig = {
  video: true,
  tour: true,
  hints: true,
  navigationVariant: 'Left',
};

const mapStateToProps = (state) => ({
  user: state.user,
  sampleData: state.sampleData,
  queryRequestState: state.queryRequestState,
  charts: state.charts,
  data: state.data,
  loadingMessage: state.loadingMessage,
  cruiseList: state.cruiseList,
  cruiseTrajectoryFocus: state.cruiseTrajectoryFocus,
  showChartsOnce: state.showChartsOnce,
  datasets: state.datasets,
  catalog: state.catalog,
  plotsActiveTab: state.plotsActiveTab,
  userIsGuest: state.userIsGuest,
});

const mapDispatchToProps = {
  showLoginDialog,
  queryRequestSend,
  storedProcedureRequestSend,
  snackbarOpen,
  cruiseListRequestSend,
  completedShowCharts,
  plotsActiveTabSet,
  guestPlotLimitNotificationSetIsVisible,
};

const styles = () => ({
  displayNone: {
    display: 'none',
  },
  background: {
    backgroundColor: colors.backgroundGray,
  },

  showCharts: {
    width: 'calc(100vw - 40px)',
    paddingTop: '180px',
    paddingBottom: '50px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },

  vizWrapper: {
    minHeight: '100vh',
    background: `url(${stars})`,
  },
});

const baseSPParams = {
  tableName: '',
  fields: null,
  depth1: 0,
  depth2: 0,
  dt1: new Date(),
  dt2: new Date(),
  lat1: 0,
  lat2: 0,
  lon1: 0,
  lon2: 0,
  selectedVizType: '',
};

// make tooltips take a black background on Viz pages
const themeOverride = (primary) => {
  return {
    ...primary,
    overrides: {
      ...primary.overrides,
      MuiTooltip: {
        ...primary.overrides.MuiTooltip,
        tooltip: {
          ...primary.overrides.MuiTooltip.tooltip,
          backgroundColor: 'black',
        },
      },
    },
  };
};

class Visualization extends Component {
  globeUIRef = React.createRef();
  mapContainerRef = React.createRef();

  state = {
    filteredData: [],
    opacity: 1,
    showCharts: false,
    showUI: false, // TODO move into Viz
    surfaceOnly: false,
    irregularSpatialResolution: false,
    showCruiseControl: false,
    spParams: baseSPParams,
  };

  async componentDidMount() {
    document.title = metaTags.visualization.title;
    document.description = metaTags.visualization.description;

    const esriModuleNames = [
      'AreaMeasurement3D',
      'Search',
      'GraphicsLayer',
      'SketchViewModel',
      'Utils',
      'Graphic',
      'FeatureLayer'
    ];

    var loadedModules = await loadModules(
      [
        'esri/widgets/AreaMeasurement3D',
        'esri/widgets/Search',
        'esri/layers/GraphicsLayer',
        'esri/widgets/Sketch/SketchViewModel',
        'esri/geometry/support/webMercatorUtils',
        'esri/Graphic',
        'esri/layers/FeatureLayer',
      ],
      { version: '4.14' },
    );

    var esriModules = esriModuleNames.reduce(
      (accumulator, currentValue, currentIndex) => {
        accumulator[currentValue] = loadedModules[currentIndex];
        return accumulator;
      },
      {},
    );

    this.setState({ ...this.state, esriModules });
  }

  componentWillUnmount = () => {
    document.title = metaTags.default.title;
    document.description = metaTags.default.description;
  };

  componentDidUpdate(prevProps /*, prevState */) {
    if (this.props.showChartsOnce) {
      console.log(`<trace::Visualization> componentDidUpdate w/ showChartsOnce`)
      this.props.completedShowCharts();
      this.setState({ ...this.state, showCharts: true });
    }
  }

  handlePlotsSetActiveTab = (_, newValue) => {
    // redux dispatch
    this.props.plotsActiveTabSet(newValue);
  };

   handleShowCharts = () => {
    this.setState({ ...this.state, showCharts: true });
  };

  handleShowGlobe = () => {
    this.setState({ ...this.state, showCharts: false });
  };

  handleShowCruiseControl = () => {
    this.setState({
      ...this.state,
      showCruiseControl: !this.state.showCruiseControl,
    });
  };

  toggleShowUI = () => {
    // TODO: move state into children
    this.setState({ ...this.state, showUI: !this.state.showUI });
  };

  updateDomainFromGraphicExtent = (extent) => {
    var _lon1 = extent.xmin;

    while (_lon1 < -180) _lon1 += 360;
    while (_lon1 > 180) _lon1 -= 360;

    var _lon2 = extent.xmax;

    while (_lon2 < -180) _lon2 += 360;
    while (_lon2 > 180) _lon2 -= 360;

    var newCoordinates = {
      lat1: extent.ymin.toFixed(3),
      lat2: extent.ymax.toFixed(3),
      lon1: _lon1.toFixed(3),
      lon2: _lon2.toFixed(3),
    };

    this.setState({
      ...this.state,
      spParams: { ...this.state.spParams, ...newCoordinates },
    });
  };

  resetSPParams = () => {
    this.setState({ ...this.state, spParams: baseSPParams });
  };

  render() {
    const { classes } = this.props;

    return (
      <ThemeProvider theme={themeOverride}>
        <div className={classes.vizWrapper}>
          <GuestPlotLimitNotification />
          <Intro config={visualizationTourConfig} />

          {this.state.esriModules && (
            <div
              className={`${
                this.props.plotsActiveTab === 0 ? '' : classes.displayNone
              }`}
            >
              <MapContainer
                globeUIRef={this.globeUIRef}
                updateDomainFromGraphicExtent={
                  this.updateDomainFromGraphicExtent
                }
                esriModules={this.state.esriModules}
                showCruiseControl={this.state.showCruiseControl}
                chartControlPanelRef={this.chartControlPanelRef}
                ref={this.mapContainerRef} // this ref is used by the VizControlPanel
              />
            </div>
          )}

          <Switch>
            <Route exact path="/visualization" component={ModuleSelector} />
            <Route
              path="/visualization/charts"
              render={(props) => (
                <VizControlPanel
                  {...props}
                  toggleChartView={this.toggleChartView}
                  toggleShowUI={this.toggleShowUI} // TODO move this into child
                  showUI={this.state.showUI} // TODO no reason for this to be drilled
                  {...this.state.spParams}
                  surfaceOnly={this.state.surfaceOnly}
                  irregularSpatialResolution={
                    this.state.irregularSpatialResolution
                  }
                  showCharts={this.state.showCharts}
                  handleShowCharts={this.handleShowCharts}
                  // handleShowGlobe={this.handleShowGlobe}
                  resetSPParams={this.resetSPParams}
                  handleShowCruiseControl={this.handleShowCruiseControl}
                  showCruiseControl={this.state.showCruiseControl}
                  globeUIRef={this.globeUIRef}
                  mapContainerRef={this.mapContainerRef}
                  handlePlotsSetActiveTab={this.handlePlotsSetActiveTab}
                  plotsActiveTab={this.props.plotsActiveTab}
                />
              )}
            />
            <Route
              path="/visualization/cruises"
              render={() => (
                <CruiseSelector
                  handleShowGlobe={() => this.handlePlotsSetActiveTab(null, 0)}
                />
              )}
            />
          </Switch>

          <div
            className={
              this.props.plotsActiveTab === 0
                ? classes.displayNone
                : classes.showCharts
            }
          >
            <Charts />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(Visualization));

// Container for ArcGIS globe. The "scene" component injects control props into its children
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Scene } from '@esri/react-arcgis';
import palette from 'google-palette';
import TrajectoryController from './TrajectoryController';
import TrajectoryZoom from './TrajectoryZoom';

const styles = (theme) => ({
  container: {
    margin: '0 auto 0 auto',
    width: '100vw',
    height: '100vh',
  },
});

const polygonSymbol = {
  type: 'polygon-3d',
  symbolLayers: [
    {
      type: 'fill',
      material: {
        color: [0, 255, 255, 0.3],
      },
      outline: {
        color: [0, 255, 255, 1],
        size: '2px',
      },
    },
  ],
};

const polylineSymbol = {
  type: 'line-3d',
  symbolLayers: [
    {
      type: 'line',
      size: '3px',
      material: {
        color: {
          r: 0,
          g: 255,
          b: 255,
          a: 0,
        },
      },
    },
  ],
};

class UiComponents extends React.Component {
  constructor(props) {
    super(props);
    this.sketchModel = new props.esriModules.SketchViewModel({
      layer: props.regionLayer,
      view: props.view,
      polygonSymbol,
      polylineSymbol,
      defaultUpdateOptions: {
        toggleToolOnClick: false,
        tool: 'transform',
      },
    });
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    return false;
  };

  render() {
    const { view } = this.props;

    view.ui.remove('zoom');
    view.ui.remove('navigation-toggle');
    view.ui.remove('compass');
    view.ui.remove('attribution');

    return null;
  }
}

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHelp: false,
    };
    this.regionLayer = new props.esriModules.GraphicsLayer();
    this.trajectoryLayer = new props.esriModules.GraphicsLayer();
  }

  render = () => {
    const { classes, esriModules, globeUIRef, view } = this.props;

    return (
      <div className={classes.container} id="found-you">
        <Scene
          mapProperties={{
            basemap: 'satellite',
            layers: [this.regionLayer, this.trajectoryLayer]
          }}
          viewProperties={{
            center: [-140, 30],
            zoom: 3,
            highlightOptions: {
              haloOpacity: 0,
              haloColor: 'rgba(0, 0, 0, 0)',
              fillOpacity: 0,
              color: 'rgba(0, 0, 0, 0)',
            }
          }}
        >
          <UiComponents
            updateDomainFromGraphicExtent={
              this.props.updateDomainFromGraphicExtent
            }
            esriModules={esriModules}
            measurementPositions={this.props.measurementPositions}
            regionLayer={this.regionLayer}
            setShowHelp={(showHelp) =>
              this.setState({ ...this.state, showHelp })
            }
            ref={globeUIRef}
          />

          <TrajectoryZoom view={view} />
        </Scene>


        <TrajectoryController
          trajectoryLayer={this.trajectoryLayer}
          esriModules={esriModules}
          globeUIRef={globeUIRef}
        />

      </div>
    );
  };
}

export default withStyles(styles)(MapContainer);

// Container for ArcGIS globe. The "scene" component injects control props into its children
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Scene } from '@esri/react-arcgis';

import UIComponents from './UI';
import Zoom from './Zoom';
import TrajectoryControls from './TrajectoryControl';
import Legend from './Legend';

const styles = (theme) => ({
  container: {
    position: 'relative',
    minHeight: '500px',
    height: '100%',
    width: '100%',
    margin: '0 auto 0 auto',
    borderRadius: '5px',
    overflow: 'hidden',
    boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
  },
});

class GlobeScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHelp: false,
    };
    this.regionLayer = new props.esriModules.GraphicsLayer();
    this.trajectoryLayer = new props.esriModules.GraphicsLayer();
  }

  render () {
    const {
      classes,
      esriModules,
      globeUIRef,
      trajectorySelector,
      cruiseSelector,
      activeTrajectorySelector,
      onCruiseFocus,
      view,
    } = this.props;

    return (
      <div className={classes.container} id="globe">
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
          <UIComponents
            esriModules={esriModules}
            regionLayer={this.regionLayer}
            setShowHelp={(showHelp) =>
              this.setState({ ...this.state, showHelp })
            }
            ref={globeUIRef}
          />
          <Zoom view={view} activeTrajectorySelector={activeTrajectorySelector} />
        </Scene>
        <TrajectoryControls
          trajectoryLayer={this.trajectoryLayer}
          esriModules={esriModules}
          globeUIRef={globeUIRef}
          trajectorySelector={trajectorySelector}
          cruiseSelector={cruiseSelector}

        />
        <Legend
          cruiseSelector={cruiseSelector}
          onFocus={onCruiseFocus}
        />
      </div>
    );
  }
}

export default withStyles(styles) (GlobeScene);

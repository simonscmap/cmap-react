// Container for ArcGIS globe. The "scene" component injects control props into its children
import React, { Component, useState } from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Scene } from '@esri/react-arcgis';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import UIComponents from './UI';
import Zoom from './Zoom';
import TrajectoryControls from './TrajectoryControl';
import Legend from './Legend';

// Downsample warning

const useWarningStyles = makeStyles(() => ({
  handle: {
    position: 'absolute',
    top: '1em',
    right: '1em',
    '& svg': {
      fontSize: '2.5em',
    }
  },
  icon: {
    color: '#ffe500',
    cursor: 'pointer',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(5px)',
    textAlign: 'center',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2em',
    cursor: 'pointer',
    padding: '2em'
  },
  hide: {
    display: 'none',
  }
}));

const Warning = (props) => {
  const cl = useWarningStyles();
  let [open, setOpen] = useState(false);


  return (
    <React.Fragment>
      <div className={cl.handle}>
        <WarningRoundedIcon className={cl.icon} onClick={() => setOpen(true)} />
      </div>
      <div className={`${cl.overlay} ${open ? '' : cl.hide}`} onClick={() => setOpen(false)}>
        <Typography variant="h5">{'The trajectories rendered here are based on data that has been downsampled and are presented as illustrations, not as references.'}</Typography>
        <Typography variant="body1">{'(Click to Close)'}</Typography>
      </div>
    </React.Fragment>
  );
};


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
    this.uiRef = props.globeUIRef;
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
      downSampleWarning,
    } = this.props;

    // NOTE: the Zoom and TrajectoryControls must be children of Scene
    // in order to inherit the view prop

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
            },

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
          <TrajectoryControls
            trajectoryLayer={this.trajectoryLayer}
            esriModules={esriModules}
            trajectorySelector={trajectorySelector}
            activeTrajectorySelector={activeTrajectorySelector}
            cruiseSelector={cruiseSelector}
            view={view}
          />
        </Scene>

        <Legend
          cruiseSelector={cruiseSelector}
          onFocus={onCruiseFocus}
        />

        {downSampleWarning && <Warning />}
      </div>
    );
  }
}

export default withStyles(styles) (GlobeScene);

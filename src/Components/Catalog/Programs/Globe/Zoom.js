import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const TrajectoryZoom = (props) => {
  const { view, activeTrajectorySelector } = props;

  const focusedTrajectory = useSelector (activeTrajectorySelector);

  useEffect(() => {
    if (!view) {
      console.error (`Map Zoom control has no ref for map "view"`);
    } else if (!focusedTrajectory) {
      console.log (`Map Zoom control has no focusedTrajectory to use`);
      view.goTo(
        {
          target: [-140, 30],
          zoom: 3,
        },
        {
          maxDuration: 2500,
          speedFactor: 0.5,
        },
      );
    }
  }, [focusedTrajectory]);

  if (!focusedTrajectory) {
    return '';
  }

  try {
    const center = focusedTrajectory.trajectory.center;
    const zoom = 6.5 - Math.floor(focusedTrajectory.trajectory.maxDistance / 6);
    if (props.view && props.view.goTo) {
      props.view.goTo(
        {
          target: center,
          zoom,
        },
        {
          maxDuration: 2500,
          speedFactor: 0.5,
        },
      );
    } else {
      console.log ('Map Zoom tried to zoom to trajector, but had no reference to view or view.goTo method');
    }
  } catch (e) {
    console.log('error while changing esri view to center of trajectory', e);
  }

  return <React.Fragment />;
};

export default TrajectoryZoom;

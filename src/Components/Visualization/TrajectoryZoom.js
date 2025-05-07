// Zooms to currently selected trajectory
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

const TrajectoryZoom = (props) => {
  const { view } = props;
  const activeCruise = useSelector((state) => state.cruiseTrajectoryFocus);
  const nonce = useSelector((state) => state.cruiseTrajectoryFocusNonce);

  const focusedTrajectory = useSelector(
    (state) =>
      state.cruiseTrajectories && state.cruiseTrajectories[activeCruise],
  );

  useEffect(() => {
    if (!view) {
      console.error('no ref to view');
    } else if (!focusedTrajectory) {
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
  }, [activeCruise, focusedTrajectory]);

  if (!focusedTrajectory) {
    return '';
  }

  try {
    const center = focusedTrajectory.center;
    const zoom = 6.5 - Math.floor(focusedTrajectory.maxDistance / 6);
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
      console.log('no reference to view or view.goTo');
    }
  } catch (e) {
    console.log('error changing esri view to center of trajectory', e);
  }

  return <React.Fragment />;
};

export default TrajectoryZoom;

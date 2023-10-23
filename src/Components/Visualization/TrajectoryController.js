// Renders Trajectories on Esri Map
import React from 'react';
import palette from 'google-palette';
import { useSelector } from 'react-redux';

const TrajectoryController = (props) => {
  const { trajectoryLayer, esriModules } = props;
  const cruiseTrajectories = useSelector ((state) => state.cruiseTrajectories);

  const thereAreTrajectoriesToRender = cruiseTrajectories &&
    Object.entries(cruiseTrajectories).length > 0;

  // If No Data, Remove Layer and Return Camera to Default
  if (!thereAreTrajectoriesToRender) {
    trajectoryLayer.removeAll();
    props.view.goTo(
      {
        target: [-140, 30],
        zoom: 3,
      },
      {
        maxDuration: 2500,
        speedFactor: 0.5,
      },
    );
    return;
  }

  // Render Each Trajectory

  function renderTrajectory (trajectoryData, color) {
    const { lons, lats } = trajectoryData;
    const newColor = color;

    let polyLines = [[]];
    let lineIndex = 0;

    let lonStart = lons[0];
    let latStart = lats[0];
    let maxDistance = 0;

    // Create a new path array each time 180 lon is crossed
    lons.forEach((lon, i) => {
      let lat = lats[i];

      let latDistance = Math.abs(lat - latStart);
      let _lonDistance = Math.abs(lon - lonStart);
      let lonDistance = _lonDistance > 180 ? 360 - _lonDistance : _lonDistance;

      let distance = Math.sqrt(
        latDistance * latDistance + lonDistance * lonDistance,
      );
      maxDistance = distance > maxDistance ? distance : maxDistance;

      polyLines[lineIndex].push([lon, lat]);

      if (i < lons.length - 1) {
        if (
          lon > 160 &&
          lon < 180 &&
          lons[i + 1] > -180 &&
          lons[i + 1] < -160
        ) {
          polyLines.push([]);
          lineIndex++;
        }

        if (lon > -180 && lon < -160 && lon[i + 1] > 160 && lon[i + 1] < 180) {
          polyLines.push([]);
          lineIndex++;
        }
      }
    });

    /* var cruiseTrajectorySymbol = {
*   type: 'line-3d',
*   symbolLayers: [
*     {
*       type: 'line',
*       material: { color: newColor },
*       cap: 'round',
*       join: 'round',
*       size: 2,
*     },
*   ],
* }; */

    const markerSymbol = {
      type: 'simple-marker',
      color: newColor,
      outline: null,
      // outline: {
      //   color: [255, 255, 255],
      //   width: 0.5,
      // },
      size: 5,
    };

    let downSampleCoeff = Math.floor(lons.length / 1000) + 1;

    lons.forEach((lon, i) => {
      if (i % downSampleCoeff === 0) {
        let lat = lats[i];
        let pointGraphic = new esriModules.Graphic({
          geometry: {
            type: 'point',
            x: lon,
            y: lat,
          },
          symbol: markerSymbol,
        });
        trajectoryLayer.add(pointGraphic);
      }
    });

    return {
      center: [
        lons[Math.floor(lons.length / 2)],
        lats[Math.floor(lons.length / 2)]
      ],
      maxDistance
    }
  }

  // Call RenderTrajectory for each Trajectory

  const numberOfTrajectories = Object.entries(cruiseTrajectories).length;
  const colors = palette('rainbow', numberOfTrajectories).map((hex) => `#${hex}`)

  const midpointData = Object.entries(cruiseTrajectories)
                             .map(([, value], index) => renderTrajectory(value, colors[index]));

  // Try to Center the Camera on First Trajectory

  try {
    const center = midpointData[0].center;
    const zoom = 8 - Math.floor(midpointData[0].maxDistance / 6);

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

  } catch (e) {
    console.log('error changing esri view to center of trajectory', e);
  }

  return '';
};


export default React.memo(TrajectoryController);

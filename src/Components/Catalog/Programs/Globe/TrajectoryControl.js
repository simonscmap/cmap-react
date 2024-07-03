// Renders Trajectories on Esri Map
import React, { useEffect } from 'react';
import palette from 'google-palette';
import { useSelector, useDispatch } from 'react-redux';
import { cruiseTrajectoryZoomTo } from '../../../../Redux/actions/visualization';
import { polylinePopupTemplate } from './trajectoryInvariants';

// Generalized Trajectory Controller

/* trajectorySelector :: (state) => {
   Cruise_ID: {
     lats: [],
     lons: [],
     times: [],
     center: [x, y],
     maxDistance: Int
   }
 */

const distance = (x1, y1, x2, y2) => {
  return Math.sqrt (
    Math.pow((x1 - x2), 2) +
    Math.pow((y1 - y2), 2)
  );
}

const findNearestVertex = (loc, paths) => {
  // loc is an esrip view location
  // https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-Point.html
  // paths are an array of [lon, lat] tuples
  const { latitude: lat1, longitude: lon1 } = loc;
  let shortestDistanceSoFar = Number.MAX_VALUE;
  let lastIndex = 0;
  for (let k = 0; k < paths.length; k++) {
    const p = paths[k];
    const [lon2, lat2] = p;
    const thisDistance = distance (lat1, lon1, lat2, lon2);
    if (thisDistance < shortestDistanceSoFar) {
      shortestDistanceSoFar = thisDistance;
      lastIndex = k;
    }
  }

  return {
    lon: paths[lastIndex][0],
    lat: paths[lastIndex][1]
  };
}

const splitLineAtAntimeridian = (path) => {
  const path_ = path.map (([lon, lat]) => ([lon + 360, lat]));
  const paths = path_.reduce((acc, curr) => {
    const latestPath = acc[acc.length - 1];
    if (latestPath.length === 0) {
      latestPath.push (curr);
      return acc;
    }
    const [lon1 ] = latestPath[latestPath.length - 1];
    const [lon2 ] = curr;

    // if ((lon1 < 180 && lon2 > 180) || (lon1 > 180 && lon2 < 180)) {
    if (lon1 - lon2 > 180 || lon2 - lon1 > 180) {
      // crossing
      // terminate latest path

      // create new path with new point
      acc.push ([curr]);
      return acc;
    } else {
      latestPath.push (curr);
      return acc;
    }
  }, [[]]); // acc is an array of paths

  return paths.map (p => p.map (([lon, lat]) => ([lon - 360, lat])));
}


// https://developers.arcgis.com/javascript/latest/api-reference/esri-Color.html
// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/* cruiseSelector :: (state) => [Cruise] */
const TrajectoryController = (props) => {
  const {
    trajectoryLayer,
    esriModules,
    trajectorySelector,
    cruiseSelector, // selector that recturns a list of rendered cruises
    activeTrajectorySelector,
    downSample,
    view,
  } = props;

  const cruiseTrajectories = useSelector (trajectorySelector);
  const cruiseList = useSelector (cruiseSelector);
  const activeTrajectory = useSelector (activeTrajectorySelector);

  const dispatch = useDispatch ();

  const thereAreTrajectoriesToRender = cruiseTrajectories &&
    Object.entries(cruiseTrajectories).length > 0;

  // pre-determine cruise -> color map
  const numberOfTrajectories = Object.entries(cruiseTrajectories).length;
  const colors = palette('rainbow', numberOfTrajectories).map((hex) => `#${hex}`);

  const colorMap = Object.entries(cruiseTrajectories).reduce((m, currEntry, idx) => {
    const [id] = currEntry;
    Object.assign(m, { [id]: colors[idx] });
    return m;
  }, {});

  // If No Data, Remove Layer and Return Camera to Default
  useEffect(() => {
    trajectoryLayer.removeAll();
  }, [thereAreTrajectoriesToRender, cruiseTrajectories]);

  const idToCruise = (id) => {
    let result = (cruiseList || []).find (c =>
      parseInt(c.ID, 10) === parseInt(id, 10));
    return result || null;
  }

  // return a reducs set of lat/lon
  function downsample (trajectoryData) {
    const { lons, lats, times } = trajectoryData;

    const downSampleCoeff = Math.floor(lons.length / 1000) + 1;

    const accumulator = { lats: [], lons: [], times: [] };

    const result = lons.reduce((acc, curr, i) => {
      if (i % downSampleCoeff === 0) {
        acc.lons.push(lons[i]);
        acc.lats.push(lats[i]);
        acc.times.push(times[i]);
      }
      return acc;
    }, accumulator);

    return result;
  }

  // Render Each Trajectory
  function renderTrajectory (trajectoryData, cruiseId) {
    if (!trajectoryData) {
      return; // this shouldn't be needed
    }

    let newColor = colorMap[cruiseId];
    let strokeWidth = 3;

    if (activeTrajectory && activeTrajectory.cruiseId) {
      if (parseInt(cruiseId, 10) !== activeTrajectory.cruiseId) {
        // 1. add transparency to this trajectory
        const rgb = hexToRgb (newColor);
        if (rgb) {
          rgb.a = 0.2;
          newColor = rgb;
        }
        // 2. make stroke width smaller
        strokeWidth = 1;
      } else {
        // this trajectory has focus
      }
    }

    const cruise = idToCruise (cruiseId);

    let tdata = trajectoryData;
    if (downSample) {
      tdata = downsample(trajectoryData);
    }

    const { lats, lons } = tdata;

    if (!lons) {
      console.log (`no lons for cruise ${cruiseId}`, trajectoryData, tdata)
      return;
    }

    // draw point

    const path = [];
    for (let k = 0; k < lons.length; k++) {
      path.push ([lons[k], lats[k]]);
    }

    const simpleLineSymbol = {
      type: "simple-line",
      color: newColor,
      width: strokeWidth,
      style: 'short-dash',
    };

    const makePolylineGraphic = (graphic) => {
      return new esriModules.Graphic({
        geometry: graphic,
        symbol: simpleLineSymbol,
        popupTemplate: {
          title: "Cruise Trajectory Point for {name}",
          returnGeometry: true,
          content: (feature) => {
            const loc = view && view.popup.location;
            const paths_ = feature.graphic.geometry.paths[0];

            // FINDE NEAREST VERTEX

            const nearestVertex = findNearestVertex (loc, paths_);
            console.log ({
              loc: { lat: loc.latitude, lon: loc.longitude },
              nearestVertex,
            });

            const template = polylinePopupTemplate (nearestVertex, cruise);
            const table = document.createElement('tbody');
            table.innerHTML = template;
            return table;
          }
        }
      });
    };

    const geometries = splitLineAtAntimeridian (path).map ((p) => ({
      'type': 'polyline',
      paths: p
    }));

    geometries.forEach (g => {
      const graphic = makePolylineGraphic (g);
      trajectoryLayer.add(graphic)
    });
  }

  // Call RenderTrajectory for each Trajectory
  useEffect(() => {
    if (thereAreTrajectoriesToRender) {
      const ATID = activeTrajectory && activeTrajectory.cruiseId;

      if (trajectoryLayer) {
        trajectoryLayer.removeAll();
      }

      let trajectories = Object.entries(cruiseTrajectories)
                               .filter (([id, data]) =>
                                 Boolean (id && data && data.lats && data.lons && data.times));

      const indexOfSelected = trajectories.findIndex (([id]) => {
        if (isNaN (ATID)) {
          console.log ('could not identify index because active trajectory is NaN', activeTrajectory);
          return false;
        }
        return parseInt(id, 10) === parseInt(ATID, 10)
      });

      if (indexOfSelected >= 0 && (indexOfSelected !== (trajectories.length - 1))) {
        const AT = trajectories[indexOfSelected]; // copy
        trajectories = trajectories
          .filter ((entry, idx) => idx !== indexOfSelected);

        trajectories.push(AT)
      }

      trajectories.forEach(([id, data]) => renderTrajectory(data, id));

      // Try to Center the Camera on First Trajectory
      const [firstTrajectoryId] = Object.entries(cruiseTrajectories)[0];

      dispatch(cruiseTrajectoryZoomTo(firstTrajectoryId));
    }
  }, [
    thereAreTrajectoriesToRender,
    cruiseTrajectories,
    activeTrajectory,
  ]);

};


export default React.memo(TrajectoryController);

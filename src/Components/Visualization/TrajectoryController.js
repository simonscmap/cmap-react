// Renders Trajectories on Esri Map
import React, { useEffect } from 'react';
import palette from 'google-palette';
import { useSelector, useDispatch } from 'react-redux';
import { cruiseTrajectoryZoomTo } from '../../Redux/actions/visualization';

const TrajectoryController = (props) => {
  const { trajectoryLayer, esriModules, globeUIRef} = props;
  const cruiseTrajectories = useSelector ((state) => state.cruiseTrajectories);
  const renderedCruises = useSelector ((state) => {
    return Object.entries(state.cruiseTrajectories || {}).map (([ctId]) => {
      return (state.cruiseList || []).find ((c) => {
        return parseInt(c.ID, 10) === parseInt(ctId, 10);
      })
    })
  });

  const dispatch = useDispatch ();

  const thereAreTrajectoriesToRender = cruiseTrajectories &&
    Object.entries(cruiseTrajectories).length > 0;

  // If No Data, Remove Layer and Return Camera to Default
  useEffect(() => {
    if (!thereAreTrajectoriesToRender) {
      trajectoryLayer.removeAll();
    }
  }, [thereAreTrajectoriesToRender]);

  useEffect(() => {
    if (globeUIRef.current) {
      console.log('setting dock disable');
      console.log(globeUIRef.current);
      globeUIRef.current.props.view.popup.dockEnabled = false;
    }
  }, [globeUIRef.current]);


  const idToCruise = (id) => {
    let result = (renderedCruises || []).find (c =>
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
  function renderTrajectory (trajectoryData, color, cruiseId) {
    const newColor = color;

    const cruise = idToCruise (cruiseId);

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

    const { lons, lats, times } = downsample(trajectoryData);

    // draw point

    lons.forEach((lon, i) => {
      let lat = lats[i];
      let time = new Date(times[i]);
      let pointGraphic = new esriModules.Graphic({
        geometry: {
          type: 'point',
          x: lon,
          y: lat,
        },
        symbol: markerSymbol,
        attributes: {
          cruiseId,
          lon,
          lat,
          time,
          name: cruise && cruise.Name,
          nick: cruise && cruise.Nickname,
          ship: cruise && cruise.Ship_Name,
          start: cruise && cruise.Start_Time,
          end: cruise && cruise.End_Time,
          chief: cruise && cruise.Chief,
        },
        popupTemplate: {
          title: "Cruise Trajectory Point for {name}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: 'lon',
                  label: 'Longitude',
                },
                {
                  fieldName: 'lat',
                  label: 'Latitude',
                },
                {
                  fieldName: 'time',
                  label: 'Time',
                },
                {
                  fieldName: 'name',
                  label: 'Cruise Name',
                },
                {
                  fieldName: 'nick',
                  label: 'Nickname',
                },
                {
                  fieldName: "cruiseId",
                  label: 'Cruise ID',
                },
                {
                  fieldName: 'ship',
                  label: 'Ship Name',
                },
                {
                  fieldName: 'start',
                  label: 'Cruise Start Time',
                },
                {
                  fieldName: 'end',
                  label: 'Cruise End Time',
                },
                {
                  fieldName: 'chief',
                  label: 'Chief Scientist',
                }
              ]
            }
          ]
        }
      });
      trajectoryLayer.add(pointGraphic);
    });
  }

  // Call RenderTrajectory for each Trajectory
  useEffect(() => {
    if (thereAreTrajectoriesToRender) {
      const numberOfTrajectories = Object.entries(cruiseTrajectories).length;
      const colors = palette('rainbow', numberOfTrajectories).map((hex) => `#${hex}`)

      Object.entries(cruiseTrajectories)
        .map(([id, data], index) => renderTrajectory(data, colors[index], id));

      // Try to Center the Camera on First Trajectory
      const [firstTrajectoryId] = Object.entries(cruiseTrajectories)[0];

      dispatch(cruiseTrajectoryZoomTo(firstTrajectoryId));
    }
  }, [
    thereAreTrajectoriesToRender,
    cruiseTrajectories
  ]);

};


export default React.memo(TrajectoryController);

import React from 'react';
import { makeStyles } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import {
  TableRowTextPair,
  TableRowImagePair,
} from './ContentComponents/TableRowPair';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%',
    width: '100%',
  },
  group: {
    height: '100%',
    '& table': {
      tableLayout: 'fixed',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
}));

const Meta = (props) => {
  const cl = useStyles();
  const { dataset } = props;
  const {
    Acknowledgement,
    Data_Source,
    Depth_Max,
    Distributor,
    Icon_URL,
    Lat_Max,
    Lat_Min,
    Lon_Max,
    Lon_Min,
    Regions,
    Sensors,
    Spatial_Resolution,
    Table_Name,
    Temporal_Resolution,
    Time_Max,
    Time_Min,
  } = dataset;

  // Safely format time values, only if they're strings
  const min = typeof Time_Min === 'string' ? Time_Min.slice(0, 10) : Time_Min;
  const max = typeof Time_Max === 'string' ? Time_Max.slice(0, 10) : Time_Max;
  const dateRange = `${min} – ${max}`;
  const latRange = `${Lat_Min?.toFixed(2)}°S – ${Lat_Max?.toFixed(2)}°N`;
  const lonRange = `${Lon_Min?.toFixed(2)}°W – ${Lon_Max?.toFixed(2)}°E`;

  // Safely format Regions, only if it's a string
  const formattedRegions =
    typeof Regions === 'string' ? Regions.split(',').join(', ') : Regions;

  // Safely format Sensors, only if it's an array
  const formattedSensors = Array.isArray(Sensors)
    ? Sensors.join(', ')
    : Sensors;

  const depthLevels = Depth_Max
    ? 'Multiple Depth Levels'
    : 'Surface Level Data';
  return (
    <React.Fragment>
      <div className={cl.container}>
        <div className={cl.group}>
          <TableContainer size="small">
            <Table>
              <TableBody>
                <TableRowTextPair
                  label={'Table Name'}
                  value={Table_Name}
                  mono={true}
                  copyable={true}
                />
                <TableRowTextPair
                  label={'Temporal Resolution'}
                  value={Temporal_Resolution}
                />
                <TableRowTextPair
                  label={'Spatial Resolution'}
                  value={Spatial_Resolution}
                />
                <TableRowTextPair label={'Depth'} value={depthLevels} />
                <TableRowTextPair label={'Source'} value={Data_Source} />
                <TableRowTextPair label={'Regions'} value={formattedRegions} />
                <TableRowTextPair label={'Distributor'} value={Distributor} />
                <TableRowTextPair label={'Sensors'} value={formattedSensors} />
                <TableRowTextPair label={'Date Range'} value={dateRange} />
                <TableRowTextPair label={'Latitude Range'} value={latRange} />
                <TableRowTextPair label={'Longitude Range'} value={lonRange} />
                <TableRowTextPair
                  label={'Acknowledgment'}
                  value={Acknowledgement}
                  copyable={true}
                />
                {Icon_URL && (
                  <TableRowImagePair
                    label={'Preview Image'}
                    imageUrl={dataset.Icon_URL}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Meta;

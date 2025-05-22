import React from 'react';
import { makeStyles } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableRowTextPair from './ContentComponents/TableRowPair';

const useStyles = makeStyles(() => ({
  gridContainer: {
    // arrange the 3 metadata columns
    height: '235px',
    width: '100%',
    display: 'inline-grid',
    gridTemplateColumns: '3fr 1fr 1fr',
    columnGap: '2em',

    '@media (max-width: 2400px)': {
      // sensors and regions column is hidden
      gridTemplateColumns: '2fr 1fr',
    },
    '@media (max-width: 1960px)': {
      // spatial and temporal extent column is hidden
      gridTemplateColumns: 'unset',
      gridAutoFlow: 'column',
    },
    '@media (max-width: 1570px)': {
      // graphic is hidden
      gridTemplateColumns: 'unset',
      gridAutoFlow: 'column',
    },
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
    Regions,
    Sensors,
    Spatial_Resolution,
    Table_Name,
    Temporal_Resolution,
    Time_Max,
    Time_Min,
    Lat_Min,
    Lat_Max,
    Lon_Min,
    Lon_Max,
  } = dataset;
  if (typeof Time_Min !== 'string' || typeof Time_Max !== 'string') {
    return '';
  }

  const min = Time_Min.slice(0, 10);
  const max = Time_Max.slice(0, 10);

  const depthLevels = Depth_Max
    ? 'Multiple Depth Levels'
    : 'Surface Level Data';

  const latitudeRange = `${Lat_Min.toFixed(2)}°S – ${Lat_Max.toFixed(2)}°N`;
  const longitudeRange = `${Lon_Min.toFixed(2)}°W – ${Lon_Max.toFixed(2)}°E`;

  return (
    <React.Fragment>
      <div className={cl.gridContainer}>
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
                <TableRowTextPair
                  label={'Regions'}
                  value={Regions.split(',').join(', ')}
                />
                <TableRowTextPair label={'Distributor'} value={Distributor} />
                <TableRowTextPair
                  label={'Sensors'}
                  value={Sensors.join(', ')}
                />
                <TableRowTextPair
                  label={'Date Range'}
                  value={`${min} – ${max}`}
                />
                <TableRowTextPair
                  label={'Latitude Range'}
                  value={latitudeRange}
                  mono={true}
                />
                <TableRowTextPair
                  label={'Longitude Range'}
                  value={longitudeRange}
                  mono={true}
                />
                <TableRowTextPair
                  label={'Acknowledgment'}
                  value={Acknowledgement}
                  copyable={true}
                />
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Meta;

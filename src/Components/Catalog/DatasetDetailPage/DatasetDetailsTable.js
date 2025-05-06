import React from 'react';

import {
  withStyles,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';

const styles = (theme) => ({
  sampleTableRow: {
    '& td': {
      padding: '10px 24px 10px 16px',
    },
  },
  tableHead: {
    fontWeight: 600,
  },
});

const DetailsTable = ({ dataset, sensors, classes }) => {
  if (!dataset) {
    return '';
  }

  const {
    Depth_Max,
    Depth_Min,
    Lat_Max,
    Lat_Min,
    Lon_Max,
    Lon_Min,
    Short_Name,
    Table_Name,
    Time_Max,
    Time_Min,
    Make,
    Process_Level,
    Spatial_Resolution,
    Temporal_Resolution,
  } = dataset;

  return (
    <Table size="small" style={{ marginTop: '24px' }}>
      <TableBody>
        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Make</TableCell>
          <TableCell>{Make}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>
            Sensor{sensors && sensors.length > 1 ? 's' : ''}
          </TableCell>
          <TableCell>{sensors ? sensors.join(', ') : ''}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Process Level</TableCell>
          <TableCell>{Process_Level}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>
            Database Table Name
          </TableCell>
          <TableCell>{Table_Name}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>
            Database Dataset Name
          </TableCell>
          <TableCell>{Short_Name}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>
            Temporal Resolution
          </TableCell>
          <TableCell>{Temporal_Resolution}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Date Start*</TableCell>
          <TableCell>{Time_Min ? Time_Min.slice(0, 10) : 'NA'}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Date End*</TableCell>
          <TableCell>{Time_Max ? Time_Max.slice(0, 10) : 'NA'}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>
            Spatial Resolution
          </TableCell>
          <TableCell>{Spatial_Resolution}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Lat Min*</TableCell>
          <TableCell>{Lat_Min}&deg;</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Lat Max*</TableCell>
          <TableCell>{Lat_Max}&deg;</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Lon Min*</TableCell>
          <TableCell>{Lon_Min}&deg;</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Lon Max*</TableCell>
          <TableCell>{Lon_Max}&deg;</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Depth Min*</TableCell>
          <TableCell>{Depth_Max ? Depth_Min + 'm' : 'Surface Only'}</TableCell>
        </TableRow>

        <TableRow className={classes.sampleTableRow}>
          <TableCell className={classes.tableHead}>Depth Max*</TableCell>
          <TableCell>{Depth_Max ? Depth_Max + 'm' : 'Surface Only'}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default withStyles(styles)(DetailsTable);

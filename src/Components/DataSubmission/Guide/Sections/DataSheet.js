import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';

import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Table size="small" style={{ marginBottom: '12px' }}>
        <TableHead>
          <TableRow className={cl.sampleTableRow}>
            <TableCell>time</TableCell>
            <TableCell>lat</TableCell>
            <TableCell>lon</TableCell>
            <TableCell>depth[if exists]</TableCell>
            <TableCell>
              var<sub>1</sub>
            </TableCell>
            <TableCell>...</TableCell>
            <TableCell>
              var<sub>n</sub>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow className={cl.sampleTableRow}>
            <TableCell>2016-5-01T15:02:00</TableCell>
            <TableCell>25</TableCell>
            <TableCell>-158</TableCell>
            <TableCell>5</TableCell>
            <TableCell>value</TableCell>
            <TableCell>...</TableCell>
            <TableCell>value</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography>
        All data points are stored in the “Data” sheet. Each data point
        must have time and location information. The exact name and order
        of the time and location columns are shown in the table above. If
        a dataset does not have depth values (e.g., sea surface
        measurements), you may remove the depth column. If your dataset
        represents results of a Laboratory study (see dataset_make) fill
        these fields with the time of study and the location of your
        laboratory. The columns var<sub>1</sub>...var<sub>n</sub>{' '}
        represent the dataset variables (measurements). Please rename var
        <sub>1</sub>...var<sub>n</sub> to names appropriate to your data.
        The format of “time”, “lat”, “lon”, and “depth” columns are
        described in the following sections. Please review the example
        datasets listed under&nbsp;
        <Link href="#resources">resources</Link> for more detailed
        information.
      </Typography>

    </div>
  );
};

export default Content;

import React from 'react';

import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';

const styles = theme => ({

})

const TableStatsDialog = (props) => {
    const { classes, data } = props;

    if(!data) return '';

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
        >
            <DialogTitle>{data.Variable}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {data.Long_Name}
                </DialogContentText>
                <Table size='small'>
                    <TableBody>
                            <TableRow>
                                <TableCell>Sensor</TableCell>
                                <TableCell>{data.Sensor}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Spatial Resolution</TableCell>
                                <TableCell>{data.Spatial_Resolution}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Resolution</TableCell>
                                <TableCell>{data.Temporal_Resolution}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Coverage Begin</TableCell>
                                <TableCell>{data.Time_Min ? data.Time_Min.slice(0,10) : 'Irregular'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Coverage End</TableCell>
                                <TableCell>{data.Time_Max ? data.Time_Max.slice(0,10) : 'Irregular'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lat Coverage Begin</TableCell>
                                <TableCell>{data.Lat_Min}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Lat Coverage End</TableCell>
                                <TableCell>{data.Lat_Max}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage Begin</TableCell>
                                <TableCell>{data.Lon_Min}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage End</TableCell>
                                <TableCell>{data.Lon_Max}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage Begin</TableCell>
                                <TableCell>{data.Depth_Min || 'Surface Only'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage End</TableCell>
                                <TableCell>{data.Depth_Max || 'Surface Only'}</TableCell>
                            </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}

export default withStyles(styles)(TableStatsDialog);
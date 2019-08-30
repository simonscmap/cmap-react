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
    const { classes, variableInfo, tableStats } = props;

    if(!variableInfo || !tableStats) return '';

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
        >
            <DialogTitle>{variableInfo.variable}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {variableInfo.longName}
                </DialogContentText>
                <Table size='small'>
                    <TableBody>
                            <TableRow>
                                <TableCell>Sensor</TableCell>
                                <TableCell>{variableInfo.sensor}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Spatial Resolution</TableCell>
                                <TableCell>{variableInfo.spatialResolution}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Resolution</TableCell>
                                <TableCell>{variableInfo.temporalResolution}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Coverage Begin</TableCell>
                                <TableCell>{tableStats.time && tableStats.time.min ? tableStats.time.min.slice(0,10) : 'Irregular'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Temporal Coverage End</TableCell>
                                <TableCell>{tableStats.time && tableStats.time.max ? tableStats.time.max.slice(0,10) : 'Irregular'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lat Coverage Begin</TableCell>
                                <TableCell>{tableStats.lat.min}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Lat Coverage End</TableCell>
                                <TableCell>{tableStats.lat.max}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage Begin</TableCell>
                                <TableCell>{tableStats.lon.min}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage End</TableCell>
                                <TableCell>{tableStats.lon.max}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage Begin</TableCell>
                                <TableCell>{tableStats.depth.min === null ? 'Surface Only' : tableStats.depth.min}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage End</TableCell>
                                <TableCell>{tableStats.depth.min === null ? 'Surface Only' : tableStats.depth.max}</TableCell>
                            </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}

export default withStyles(styles)(TableStatsDialog);
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
    const { data } = props;

    if(!data) return '';

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
        >
            <DialogTitle>{data.Long_Name}</DialogTitle>
            <DialogContent>
                { data.Comment &&
                    <DialogContentText>
                        {data.Comment}
                    </DialogContentText>
                }
                <Table size='small'>
                    <TableBody>
                            <TableRow>
                                <TableCell>Dataset</TableCell>
                                <TableCell title={data.Dataset_Name}>{data.Dataset_Name.length > 25 ? data.Dataset_Name.slice(0,23) + '...' : data.Dataset_Name}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Table Name</TableCell>
                                <TableCell title={data.Table_Name}>{data.Table_Name > 25 ? data.Table_Name.slice(0,23) + '...' : data.Table_Name}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Source</TableCell>
                                <TableCell title={data.Data_Source}>{data.Data_Source > 25 ? data.Data_Source.slice(0,23) + '...' : data.Data_Source}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Distributor</TableCell>
                                <TableCell title={data.Distributor}>{data.Distributor.length > 25 ? data.Distributor.slice(0,23) + '...' : data.Distributor}</TableCell>
                            </TableRow>

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
                                <TableCell>{`${data.Lat_Min}\xB0`}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Lat Coverage End</TableCell>
                                <TableCell>{`${data.Lat_Max}\xB0`}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage Begin</TableCell>
                                <TableCell>{`${data.Lon_Min}\xB0`}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Lon Coverage End</TableCell>
                                <TableCell>{`${data.Lon_Max}\xB0`}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage Begin</TableCell>
                                <TableCell>{data.Depth_Min ? `${data.Depth_Min}(m)` : 'Surface Only'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Depth Coverage End</TableCell>
                                <TableCell>{data.Depth_Max ? `${data.Depth_Max}(m)` : 'Surface Only'}</TableCell>
                            </TableRow>

                            {data.Variable_Min &&
                                <TableRow>
                                    <TableCell>Minimum Value({data.Unit})</TableCell>
                                    <TableCell>{data.Variable_Min}</TableCell>
                                </TableRow>                            
                            }

                            {data.Variable_Max &&
                                <TableRow>
                                    <TableCell>Maximum Value({data.Unit})</TableCell>
                                    <TableCell>{data.Variable_Max}</TableCell>
                                </TableRow>                            
                            }

                            {data.Variable_Mean && 
                                <TableRow>
                                    <TableCell>Mean Value({data.Unit})</TableCell>
                                    <TableCell>{data.Variable_Mean}</TableCell>
                                </TableRow>                            
                            }

                            {data.Variable_Std &&
                                <TableRow>
                                    <TableCell>Standard Deviation({data.Unit})</TableCell>
                                    <TableCell>{data.Variable_Std}</TableCell>
                                </TableRow>                            
                            }
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    )
}

export default withStyles(styles)(TableStatsDialog);

// Variable_Max: "4.999"
// Variable_Mean: "-0.0000008547"
// Variable_Min: "-4.9956"
// Variable_Std: "0.1428013424"
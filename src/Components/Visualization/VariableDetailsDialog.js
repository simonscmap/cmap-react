// Popup showing table stats for selected variable on viz page

import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Close } from '@material-ui/icons';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { variableFetch } from '../../Redux/actions/visualization';

import colors from '../../enums/colors';
import z from '../../enums/zIndex';

const styles = (theme) => ({
  dialogPaper: {
    backgroundColor: colors.backgroundGray,
    width: '700px',
  },

  closeIcon: {
    display: 'inline',
    float: 'right',
    cursor: 'pointer',
  },
});

const mapStateToProps = (state, ownProps) => ({
  data: state.variableDetails,
});

const mapDispatchToProps = {
  variableFetch,
};

const VariableDetailsDialog = (props) => {
  const {
    data,
    classes,
    variableFetch,
    variableDetailsID,
    handleSetVariableDetailsID,
  } = props;

  React.useEffect(() => {
    variableFetch(variableDetailsID);
  }, [variableDetailsID, variableFetch]);

  const handleClose = (e) => {
    e.stopPropagation();
    handleSetVariableDetailsID(null);
    variableFetch(null);
  };

  return variableDetailsID ? (
    <Dialog
      // style={{zIndex: 5000}}
      style={{ zIndex: z.NON_HELP_DIALOG }}
      open={Boolean(variableDetailsID)}
      onClose={handleClose}
      PaperProps={{
        className: classes.dialogPaper,
      }}
    >
      <DialogTitle>
        {data ? data.Long_Name : <Skeleton />}{' '}
        <Close
          className={classes.closeIcon}
          color="primary"
          onClick={handleClose}
        />
      </DialogTitle>
      <DialogContent>
        {data ? (
          <>
            <DialogContentText>
              {data.Comment ? data.Comment : ''}
            </DialogContentText>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Dataset</TableCell>
                  <TableCell title={data.Dataset_Name}>
                    {data.Dataset_Name.length > 25
                      ? data.Dataset_Name.slice(0, 23) + '...'
                      : data.Dataset_Name}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Table Name</TableCell>
                  <TableCell title={data.Table_Name}>
                    {data.Table_Name > 25
                      ? data.Table_Name.slice(0, 23) + '...'
                      : data.Table_Name}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Source</TableCell>
                  <TableCell title={data.Data_Source}>
                    {data.Data_Source > 25
                      ? data.Data_Source.slice(0, 23) + '...'
                      : data.Data_Source}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Distributor</TableCell>
                  <TableCell title={data.Distributor}>
                    {data.Distributor.length > 25
                      ? data.Distributor.slice(0, 23) + '...'
                      : data.Distributor}
                  </TableCell>
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
                  <TableCell>
                    {data.Time_Min ? data.Time_Min.slice(0, 10) : 'Irregular'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Temporal Coverage End</TableCell>
                  <TableCell>
                    {data.Time_Max ? data.Time_Max.slice(0, 10) : 'Irregular'}
                  </TableCell>
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
                  <TableCell>
                    {data.Depth_Max ? `${data.Depth_Min}(m)` : 'Surface Only'}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Depth Coverage End</TableCell>
                  <TableCell>
                    {data.Depth_Max ? `${data.Depth_Max}(m)` : 'Surface Only'}
                  </TableCell>
                </TableRow>

                {data.Variable_Min !== undefined ? (
                  <TableRow>
                    <TableCell>Minimum Value({data.Unit})</TableCell>
                    <TableCell>{data.Variable_Min}</TableCell>
                  </TableRow>
                ) : (
                  ''
                )}

                {data.Variable_Max !== undefined ? (
                  <TableRow>
                    <TableCell>Maximum Value({data.Unit})</TableCell>
                    <TableCell>{data.Variable_Max}</TableCell>
                  </TableRow>
                ) : (
                  ''
                )}

                {data.Variable_Mean !== undefined ? (
                  <TableRow>
                    <TableCell>Mean Value({data.Unit})</TableCell>
                    <TableCell>{data.Variable_Mean}</TableCell>
                  </TableRow>
                ) : (
                  ''
                )}

                {data.Variable_Std !== undefined ? (
                  <TableRow>
                    <TableCell>Standard Deviation({data.Unit})</TableCell>
                    <TableCell>{data.Variable_Std}</TableCell>
                  </TableRow>
                ) : (
                  ''
                )}
              </TableBody>
            </Table>{' '}
          </>
        ) : (
          <>
            <Typography variant="h1">
              {' '}
              <Skeleton />{' '}
            </Typography>
            <Skeleton width={500} height={600}></Skeleton>
          </>
        )}
      </DialogContent>
    </Dialog>
  ) : (
    ''
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(VariableDetailsDialog));

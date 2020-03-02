import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Table, TableBody, TableCell, TableRow, TableHead } from '@material-ui/core';

import { tableStatsRequestSend, csvDownloadRequestSend } from '../../Redux/actions/visualization';

import colors from '../../Enums/colors';
import temporalResolutions from '../../Enums/temporalResolutions';
import depthUtils from '../../Utility/depthCounter';

const styles = (theme) => ({
    tableFooter: {
        fontSize: '11px',
        margin: '5px 0px 0px 10px'
    },

    table: {
        marginTop: '9px'
    },

    dialogPaper: {
        backgroundColor: colors.backgroundGray
    }
})

const mapStateToProps = (state, ownProps) => ({
    datasets: state.datasets,
    catalog: state.catalog
})

const mapDispatchToProps = {
    tableStatsRequestSend,
    csvDownloadRequestSend
}

class DownloadConfirmationDialog extends Component {

    componentDidUpdate = () => {
        const { downloadTarget, datasets, catalog, tableStatsRequestSend } = this.props;
        if(downloadTarget && datasets && !datasets[downloadTarget.dataset].tableStats){
            const firstMember = catalog.find(item => item.Dataset_Name === downloadTarget.dataset);
            tableStatsRequestSend(firstMember.Table_Name, downloadTarget.dataset);
        }
    }

    handleFullDatasetDownload = (tableName) => {
        let query = `select%20*%20from%20${tableName}`;
        const fileName = this.props.downloadTarget.variable || this.props.downloadTarget.dataset;
        this.props.csvDownloadRequestSend(query, fileName, tableName);
    }

    handleSubsetDownload = (tableName, dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2) => {
        const sampleMember = this.props.catalog.find(item => item.Dataset_Name === this.props.downloadTarget.dataset);
        let isMonthyClimatology = Boolean(sampleMember.Temporal_Resolution === temporalResolutions.monthlyClimatology);

        const timeUnit = isMonthyClimatology ? 'month' : 'time';
        const timeStart = isMonthyClimatology ? new Date(dt1).getMonth() + 1 : dt1;
        const timeEnd = isMonthyClimatology ? new Date(dt2).getMonth() + 1 : dt2;

        let query = `select * from ${tableName} where ${timeUnit} between '${timeStart}' and '${timeEnd}' and ` +
            `lat between ${lat1} and ${lat2} and ` +
            `lon between ${lon1} and ${lon2}`;

        if(Boolean(sampleMember.Depth_Max)){
            query += `and depth between ${depth1} and ${depth2}`
        }

        const fileName = this.props.downloadTarget.variable || this.props.downloadTarget.dataset;
        this.props.csvDownloadRequestSend(query, fileName, tableName);
    }

    render() {
        const { classes, datasets, downloadTarget, lat1, lat2, lon1, lon2, dt1, dt2, depth1, depth2, catalog } = this.props;

        if(!downloadTarget || ! datasets ||  !catalog) return '';
        
        const tableStats = datasets[downloadTarget.dataset].tableStats;

        if(!tableStats) return '';

        const sampleMember = catalog.find(item => item.Dataset_Name === downloadTarget.dataset);
        const { Lat_Min, Lat_Max, Lon_Min, Lon_Max, Time_Min, Time_Max, Depth_Min, Depth_Max, Table_Name } = sampleMember;
        const latMin = parseFloat(Lat_Min);
        const latMax = parseFloat(Lat_Max);
        const lonMin = parseFloat(Lon_Min);
        const lonMax = parseFloat(Lon_Max);
        const timeMin = Date.parse(Time_Min);
        const timeMax = Date.parse(Time_Max);

        const subsetLat1 = lat1 < latMin ? latMin :
            lat1 > latMax ? latMax :
            lat1;

        const subsetLat2 = lat2 < latMin ? latMin :
        lat2 > latMax ? latMax :
        lat2;

        const subsetLon1 = lon1 < lonMin ? lonMin :
            lon1 > lonMax ? lonMax :
            lon1;

        const subsetLon2 = lon2 < lonMin ? lonMin :
            lon2 > lonMax ? lonMax :
            lon2;

        const subsetTime1 = dt1 < timeMin ? timeMin :
            dt1 > timeMax ? timeMax :
            dt1;

        const subsetTime2 = dt2 < timeMin ? timeMin :
            dt2 > timeMax ? timeMax:
            dt2;

        if(Depth_Max){
            var depthMin = parseFloat(Depth_Min);
            var depthMax = parseFloat(Depth_Max);

            var subsetDepth1 = depth1 < depthMin ? depthMin : 
                depth1 > depthMax ? depthMax : 
                depth1;

            var subsetDepth2 = depth2 < depthMin ? depthMin : 
                depth2 > depthMax ? depthMax : 
                depth2;
        }        

        const tableName = sampleMember.Table_Name;
        
        const totalRows = tableStats.lat.count;
        const variableColumns = datasets[downloadTarget.dataset].Variables && datasets[downloadTarget.dataset].Variables.split(',').length;
        const depthColumns = tableStats.depth ? 1 : 0;
        const fixedColumns = 3;

        const totalColumns = variableColumns + depthColumns + fixedColumns;

        const totalDataPoints = totalRows * totalColumns;
        const fullDataAvailable = totalDataPoints < 20000000;

        var dateRatio;

        if(sampleMember.Temporal_Resolution === temporalResolutions.monthlyClimatology){
            const subsetMonths = new Date(subsetTime2).getMonth() - new Date(subsetTime1).getMonth();
            dateRatio = (subsetMonths + 1) / 12;
        } else {
            var totalDays = (timeMax - timeMin) / 86400000 || 1;
            var subsetDays = (subsetTime2 - subsetTime1) / 86400000 || 1;
            dateRatio = totalDays > subsetDays ? subsetDays / totalDays : 1;
        }

        const totalLatSize = (latMax - latMin) || 1;
        const subsetLatSize = (subsetLat2 - subsetLat1) || 1;
        const latRatio = totalLatSize > subsetLatSize ? subsetLatSize / totalLatSize : 1;

        const totalLonSize = (lonMax - lonMin) || 1;
        const subsetLonSize = subsetLon2 > subsetLon1 ? (subsetLon2 - subsetLon1) || 1 : (subsetLon2 + 360 - subsetLon1) || 1;
        const lonRatio = totalLonSize > subsetLonSize ? subsetLonSize / totalLonSize : 1;

        var depthRatio = 1;

        if(sampleMember.Depth_Max) {
            if(depthUtils.piscesTable.has(sampleMember.Table_Name)){
                let depthCount = depthUtils.count({data: sampleMember}, subsetDepth1, subsetDepth2);
                depthRatio = depthCount / depthUtils.piscesDepths.length || 1;
            } else if (depthUtils.darwinTable.has(sampleMember.Table_Name)){
                let depthCount = depthUtils.count({data: sampleMember}, subsetDepth1, subsetDepth2);
                depthRatio = depthCount / depthUtils.darwinDepths.length || 1;
            } else {
                var totalDepthSize = depthMax - depthMin || 1;
                var subsetDepthSize = subsetDepth2 - subsetDepth1 || 1;
                depthRatio = subsetDepthSize > totalDepthSize ? 1 : subsetDepthSize / totalDepthSize;
            }
        }

        const subsetDataPoints = Math.floor(totalDataPoints * dateRatio * latRatio * lonRatio * depthRatio);

        const subsetAvailable = subsetDataPoints <= 20000000;

        const timeString1 = new Date(subsetTime1).toISOString().slice(0,10);
        const timeString2 = new Date(subsetTime2).toISOString().slice(0,10);
        const timeStringMin = sampleMember.Temporal_Resolution === temporalResolutions.monthlyClimatology ? 
            'Monthly' : new Date(timeMin).toISOString().slice(0,10);
        const timeStringMax = sampleMember.Temporal_Resolution === temporalResolutions.monthlyClimatology ? 
            'Monthly' : new Date(timeMax).toISOString().slice(0,10);
        
        return (
            <React.Fragment>
                <Dialog
                    PaperProps={{
                        className:classes.dialogPaper
                    }}
                    open={Boolean(downloadTarget)} 
                    onClose={() => this.props.handleSetDownloadTarget(null)} 
                    maxWidth={false}
                >
                    <DialogTitle>Downloading {downloadTarget.variable && `${downloadTarget.variable} from `} {downloadTarget.dataset}</DialogTitle>
                    
                    <DialogContent>
                        {fullDataAvailable ? 
                            `The full dataset is available for download.` :
                            `The full dataset is too large for download.`
                        }
                    </DialogContent>
                    
                    <DialogContent>
                        <Typography>
                            {subsetAvailable ? 
                                'The described subset is available for download' :
                                `The described subset contains approximately ${subsetDataPoints} data points. Maximum download size is 20000000. Please reduce subset size.`
                            }
                        </Typography>

                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell>Subset Start</TableCell>
                                    <TableCell>Subset End</TableCell>
                                    <TableCell>Dataset Min</TableCell>
                                    <TableCell>Dataset Max</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>{timeString1}</TableCell>
                                    <TableCell>{timeString2}</TableCell>
                                    <TableCell>{timeStringMin}</TableCell>
                                    <TableCell>{timeStringMax}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>Latitude[{'\xb0'}]</TableCell>
                                    <TableCell>{subsetLat1}</TableCell>
                                    <TableCell>{subsetLat2}</TableCell>
                                    <TableCell>{latMin}</TableCell>
                                    <TableCell>{latMax}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>Longitude[{'\xb0'}]</TableCell>
                                    <TableCell>{subsetLon1}</TableCell>
                                    <TableCell>{subsetLon2}</TableCell>
                                    <TableCell>{lonMin}</TableCell>
                                    <TableCell>{lonMax}</TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell>Depth[m]</TableCell>
                                    <TableCell>{isNaN(subsetDepth1) ? 'NA' : subsetDepth1}</TableCell>
                                    <TableCell>{isNaN(subsetDepth2) ? 'NA' : subsetDepth2}</TableCell>
                                    <TableCell>{isNaN(depthMin) ? 'NA' : depthMin}</TableCell>
                                    <TableCell>{isNaN(depthMax) ? 'NA' : depthMax}</TableCell>
                                </TableRow>
                            </TableBody>
                                
                        </Table>

                        <Typography className={classes.tableFooter}>
                            *Subset start and end values may automatically adjust to fit dataset boundaries.
                        </Typography>

                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => this.props.handleSetDownloadTarget(null)}>
                            Cancel
                        </Button>

                        {subsetAvailable &&
                            <Button onClick={() => this.handleSubsetDownload(tableName, timeString1, timeString2, subsetLat1, subsetLat2, subsetLon1, subsetLon2, subsetDepth1, subsetDepth2)}>
                                Download Subset
                            </Button>                            
                        }

                        {fullDataAvailable && 
                            <Button onClick={() => this.handleFullDatasetDownload(tableName)}>
                                Download Full Dataset
                            </Button>
                        }
                    </DialogActions>
                </Dialog> 
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DownloadConfirmationDialog));
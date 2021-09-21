// Pop-up dialog for downloading data on catalog pages

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Slider } from '@material-ui/core';

import HelpButtonAndDialog from '../Help/HelpButtonAndDialog';
import DownloadingDataHelpContents from './DownloadingDataHelpContents';

import { csvDownloadRequestSend } from '../../Redux/actions/visualization';

import colors from '../../enums/colors';
import temporalResolutions from '../../enums/temporalResolutions';
import depthUtils from '../../Utility/depthCounter';

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: colors.solidPaper,
        '@media (max-width: 600px)': {
            width: '100vw',
            margin: '12px'
        },
        width: '60vw'
    },

    sliderValueLabel: {
        top: -22,
        '& *': {
            background: 'transparent',
            color: theme.palette.primary.main,
        },
        left: -14
    },

    slider: {
        margin: '4px 8px 8px 0px'
    },

    sliderThumb: {
        borderRadius: '0px',
        height: '16px',
        width: '3px',
        marginLeft: 0,
        marginTop: '-7px'
    },

    dialogRoot: {
        overflowY: 'visible'
    },

    markLabel: {
        top: 30,
        fontSize: '.7rem'
    },

    input: {
        fontSize: '13px',
        padding: '2px 0'
    },

    formGrid: {
        marginTop: '16px'
    },

    formLabel: {
        marginTop: '13px',
        fontSize: '.92rem'
    },

    helpButton: {
        marginTop: '-2px'
    },

    closeDialogIcon: {
        float: 'right',
        marginTop: '-12px',
        marginRight: '-8px'
    }
})

const mapStateToProps = (state, ownProps) => ({
    datasets: state.datasets,
    catalog: state.catalog
})

const mapDispatchToProps = {
    csvDownloadRequestSend
}

const dayToDate = (min, days) => {
    let value = new Date(min);
    value.setDate(value.getDate() + days);

    let month = value.getMonth() + 1;
    month = month > 9 ? month : '0' + month;

    let day = value.getDate();
    day = day > 9 ? day : '0' + day;

    return `${value.getFullYear()}-${month}-${day}`;
}

const dateToDay = (min, date) => Math.ceil((new Date(date).getTime() - new Date(min).getTime()) / 86400000);

class DownloadDialog extends Component {

    constructor(props) {
        super(props);
        const maxDays = Math.ceil((new Date(this.props.dataset.Time_Max).getTime() - new Date(this.props.dataset.Time_Min).getTime()) / 86400000);

        this.state = {
            lat: [
                Math.floor(this.props.dataset.Lat_Min * 10) / 10,
                Math.ceil(this.props.dataset.Lat_Max * 10) / 10
            ],
            lon: [
                Math.floor(this.props.dataset.Lon_Min * 10) / 10,
                Math.ceil(this.props.dataset.Lon_Max * 10) / 10
            ],
            time: this.props.dataset.Time_Min ? [
                0,
                maxDays
            ]
                : [1, 12],
            depth: [
                Math.floor(this.props.dataset.Depth_Min),
                Math.ceil(this.props.dataset.Depth_Max)
            ],
            maxDays
        }
    }

    handleSetStartDate = (e) => {
        if(!e.target.value) return;
        let parts = e.target.value.split('-');
        const targetDate = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
        let min = new Date(this.props.dataset.Time_Min);
        let max = new Date(this.props.dataset.Time_Max);
        const target = targetDate < min ? min : targetDate > max ? max : targetDate;
        this.setState({...this.state, time: [dateToDay(this.props.dataset.Time_Min, target), this.state.time[1]]});
    }

    handleSetEndDate = (e) => {
        if(!e.target.value) return;
        let parts = e.target.value.split('-');
        const targetDate = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
        let min = new Date(this.props.dataset.Time_Min);
        let max = new Date(this.props.dataset.Time_Max);
        const target = targetDate < min ? min : targetDate > max ? max : targetDate;
        this.setState({...this.state, time: [this.state.time[0], dateToDay(this.props.dataset.Time_Min, target)]});
    }

    handleFullDatasetDownload = (tableName) => {
        let query = `select%20*%20from%20${tableName}`;
        const fileName = this.props.dataset.Long_Name;
        this.props.csvDownloadRequestSend(query, fileName, tableName);
    }

    handleSubsetDownload = (tableName, dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2) => {
        let isMonthyClimatology = Boolean(this.props.dataset.Temporal_Resolution === temporalResolutions.monthlyClimatology);
        const timeUnit = isMonthyClimatology ? 'month' : 'time';
        const timeStart = isMonthyClimatology ? new Date(dt1).getMonth() + 1 : dt1;
        const timeEnd = isMonthyClimatology ? new Date(dt2).getMonth() + 1 : dt2;
        // + 'T23:59:59Z'
        let query = `select * from ${tableName} where ${timeUnit} between '${timeStart}' and '${timeEnd}' and ` +
            `lat between ${lat1} and ${lat2} and ` +
            `lon between ${lon1} and ${lon2}`;

        if(Boolean(this.props.dataset.Depth_Max)){
            query += ` and depth between ${depth1} and ${depth2}`
        }

        const fileName = this.props.dataset.Long_Name;
        this.props.csvDownloadRequestSend(query, fileName, tableName);
    }

    handleSliderChange = (key, value) => {
        this.setState({...this.state, [key]: value});
    }

    render() {
        const { dataset, dialogOpen, handleClose, classes } = this.props;
        const {
            Lat_Min,
            Lat_Max,
            Lon_Min,
            Lon_Max,
            Time_Min,
            Time_Max,
            Depth_Min,
            Depth_Max,
            Spatial_Resolution,
            Temporal_Resolution,
            Table_Name,
            Row_Count
        } = dataset;

        const { lat, lon, time, depth } = this.state;

        const latMin = parseFloat(Lat_Min);
        const latMax = parseFloat(Lat_Max);
        const lonMin = parseFloat(Lon_Min);
        const lonMax = parseFloat(Lon_Max);
        const timeMin = Date.parse(Time_Min);
        const timeMax = Date.parse(Time_Max);

        const subsetLat1 = lat[0];
        const subsetLat2 = lat[1];
        const subsetLon1 = lon[0];
        const subsetLon2 = lon[1];
        const subsetTime1 = time[0];
        const subsetTime2 = time[1];

        const datasetIsMonthlyClimatology = Temporal_Resolution === temporalResolutions.monthlyClimatology;

        if(Depth_Max){
            var depthMin = parseFloat(Depth_Min);
            var depthMax = parseFloat(Depth_Max);

            var subsetDepth1 = depth[0]

            var subsetDepth2 = depth[1];
        }

        const variableColumns = dataset.Variables && dataset.Variables.length;
        const depthColumns = dataset.Depth_Max ? 1 : 0;
        const fixedColumns = 3;

        const totalColumns = variableColumns + depthColumns + fixedColumns;

        const totalDataPoints = Row_Count * totalColumns;
        const fullDataAvailable = totalDataPoints < 20000000;

        var dateRatio;

        if(Temporal_Resolution === temporalResolutions.monthlyClimatology){
            dateRatio = (time[1] - time[0] + 1) / 12;
        } else {
            var totalDays = (timeMax - timeMin) / 86400000 || 1;
            var subsetDays = subsetTime2 - subsetTime1 < 1 ? 1 : subsetTime2 - subsetTime1;
            dateRatio = totalDays > subsetDays ? subsetDays / totalDays : 1;
        }

        const totalLatSize = (latMax - latMin) || 1;
        const subsetLatSize = subsetLat2 - subsetLat1 || 1 / totalLatSize;
        const latRatio = subsetLatSize / totalLatSize;

        const totalLonSize = (lonMax - lonMin) || 1;
        const subsetLonSize = subsetLon2 - subsetLon1 || 1 / totalLonSize;
        const lonRatio = subsetLonSize / totalLonSize;

        var depthRatio = 1;

        if(Depth_Max) {
            if(depthUtils.piscesTable.has(Table_Name)){
                let depthCount = depthUtils.count({data: dataset}, subsetDepth1, subsetDepth2);
                depthRatio = depthCount / depthUtils.piscesDepths.length || 1;
            } else if (depthUtils.darwinTable.has(Table_Name)){
                let depthCount = depthUtils.count({data: dataset}, subsetDepth1, subsetDepth2);
                depthRatio = depthCount / depthUtils.darwinDepths.length || 1;
            } else {
                var totalDepthSize = depthMax - depthMin || 1;
                var subsetDepthSize = subsetDepth2 - subsetDepth1 || 1;
                depthRatio = subsetDepthSize > totalDepthSize ? 1 : subsetDepthSize / totalDepthSize;
            }
        }

        const subsetDataPoints = Math.floor(totalDataPoints * dateRatio * latRatio * lonRatio * depthRatio);

        const subsetAvailable = subsetDataPoints <= 20000000;

        const timeString1 = datasetIsMonthlyClimatology ? time[0] : dayToDate(Time_Min, subsetTime1);
        const timeString2 = datasetIsMonthlyClimatology ? time[1] : dayToDate(Time_Min, subsetTime2);

        return (
            <React.Fragment>
                <Dialog
                    PaperProps={{
                        className:classes.dialogPaper
                    }}
                    open={dialogOpen}
                    onClose={handleClose}
                    maxWidth={false}
                >
                    {/* <IconButton className={classes.closeDialogIcon} color="inherit" onClick={handleClose} disableFocusRipple disableRipple>
                        <Close/>
                    </IconButton> */}
                    <DialogTitle>Downloading {dataset.Long_Name}
                        <HelpButtonAndDialog
                            title='Downloading Data'
                            content={<DownloadingDataHelpContents/>}
                            buttonClass={classes.helpButton}
                        />
                    </DialogTitle>

                    <DialogContent style={{padding: '0px 40px'}} classes={{root: classes.dialogRoot}}>
                        <Typography>
                            {fullDataAvailable ?
                                `The full dataset is available for download.` :
                                `The full dataset is too large for download.`
                            }
                        </Typography>
                        <Typography>
                            {subsetAvailable ?
                                'The subset described below is available for download.' :
                                `The subset described below contains approximately ${subsetDataPoints} data points. Maximum download size is 20000000. Please reduce the range of one or more parameters.`
                            }
                        </Typography>

                        {
                            datasetIsMonthlyClimatology ?

                            <>
                            <Grid container className={classes.formGrid}>
                                    <Grid item xs={12} md={4}>
                                        <Typography className={classes.formLabel}>
                                            Month
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="Start"
                                            type="number"
                                            inputProps={{
                                                min: 1,
                                                max: 12,
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={time[0]}
                                            onChange={e => this.handleSliderChange('time', [e.target.value === '' ? '' : Number(e.target.value), time[1]])}
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="End"
                                            type="number"
                                            inputProps={{
                                                min: 1,
                                                max: 12,
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={time[1]}
                                            onChange={e => this.handleSliderChange('time', [time[0], e.target.value === '' ? '' : Number(e.target.value)])}
                                        />
                                    </Grid>
                                </Grid>

                                <Slider
                                    min={1}
                                    max={12}
                                    value={[typeof time[0] === 'number' ? time[0] : 1, typeof time[1] === 'number' ? time[1] : 12]}
                                    value={this.state.time}
                                    onChange={(e, value) => this.handleSliderChange('time', value)}
                                    classes={{
                                        valueLabel: classes.sliderValueLabel,
                                        thumb: classes.sliderThumb,
                                        markLabel: classes.markLabel
                                    }}
                                    className={classes.slider}
                                    marks={[
                                        {
                                            value: 1,
                                            label: '1'
                                        },
                                        {
                                            value: 12,
                                            label: '12'
                                        }
                                    ]}
                                />
                            </>

                            :

                            <>
                                <Grid container className={classes.formGrid}>
                                    <Grid item xs={12} md={4}>
                                        <Typography className={classes.formLabel}>
                                            Date
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="Start"
                                            type="date"
                                            inputProps={{
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={dayToDate(Time_Min, this.state.time[0])}
                                            onChange={this.handleSetStartDate}
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="End"
                                            type="date"
                                            inputProps={{
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={dayToDate(Time_Min, this.state.time[1])}
                                            onChange={this.handleSetEndDate}
                                        />
                                    </Grid>
                                </Grid>

                                <Slider
                                    min={0}
                                    max={this.state.maxDays}
                                    value={this.state.time}
                                    onChange={(e, value) => this.handleSliderChange('time', value)}
                                    classes={{
                                        valueLabel: classes.sliderValueLabel,
                                        thumb: classes.sliderThumb,
                                        markLabel: classes.markLabel
                                    }}
                                    className={classes.slider}
                                    marks={[
                                        {
                                            value: 0,
                                            label: dayToDate(Time_Min, 0)
                                        },
                                        {
                                            value: this.state.maxDays,
                                            label: dayToDate(Time_Min, this.state.maxDays)
                                        }
                                    ]}
                                />
                            </>
                        }

                        <Grid container className={classes.formGrid}>
                            <Grid item xs={12} md={4}>
                                <Typography className={classes.formLabel}>
                                    Latitude[{'\xB0'}]
                                </Typography>
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <TextField
                                    label="Start"
                                    type="number"
                                    inputProps={{
                                        step: .1,
                                        min: Math.floor(Lat_Min * 10) / 10,
                                        max: Math.ceil(Lat_Max * 10) / 10,
                                        className: classes.input
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lat[0]}
                                    onChange={e => this.handleSliderChange('lat', [e.target.value === '' ? '' : Number(e.target.value), lat[1]])}
                                />
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <TextField
                                    label="End"
                                    type="number"
                                    inputProps={{
                                        step: .1,
                                        min: Math.floor(Lat_Min * 10) / 10,
                                        max: Math.ceil(Lat_Max * 10) / 10,
                                        className: classes.input
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lat[1]}
                                    onChange={e => this.handleSliderChange('lat', [lat[0], e.target.value === '' ? '' : Number(e.target.value)])}
                                />
                            </Grid>
                        </Grid>

                        <Slider
                            min={Math.floor(Lat_Min * 10) / 10}
                            max={Math.ceil(Lat_Max * 10) / 10}
                            step={.1}
                            value={[typeof lat[0] === 'number' ? lat[0] : -90, typeof lat[1] === 'number' ? lat[1] : 90]}
                            onChange={(e, value) => this.handleSliderChange('lat', value)}
                            classes={{
                                valueLabel: classes.sliderValueLabel,
                                thumb: classes.sliderThumb,
                                markLabel: classes.markLabel
                            }}
                            className={classes.slider}
                            disabled={Lat_Min === Lat_Max}
                            marks={[
                                {
                                    value: Math.floor(Lat_Min * 10) / 10,
                                    label: `${Math.floor(Lat_Min * 10) / 10}`
                                },
                                {
                                    value: Math.ceil(Lat_Max * 10) / 10,
                                    label: `${Math.ceil(Lat_Max * 10) / 10}`
                                }
                            ]}
                        />

                        <Grid container className={classes.formGrid}>
                            <Grid item xs={12} md={4}>
                                <Typography className={classes.formLabel}>
                                    Longitude[{'\xB0'}]
                                </Typography>
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <TextField
                                    label="Start"
                                    type="number"
                                    inputProps={{
                                        step: .1,
                                        min: Math.floor(Lon_Min * 10) / 10,
                                        max: Math.ceil(Lon_Max * 10) / 10,
                                        className: classes.input
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lon[0]}
                                    onChange={e => this.handleSliderChange('lon', [e.target.value === '' ? '' : Number(e.target.value), lon[1]])}
                                />
                            </Grid>

                            <Grid item xs={6} md={4}>
                                <TextField
                                    label="End"
                                    type="number"
                                    inputProps={{
                                        step: .1,
                                        min: Math.floor(Lon_Min * 10) / 10,
                                        max: Math.ceil(Lon_Max * 10) / 10,
                                        className: classes.input
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lon[1]}
                                    onChange={e => this.handleSliderChange('lon', [lon[0], e.target.value === '' ? '' : Number(e.target.value)])}
                                />
                            </Grid>
                        </Grid>

                        <Slider
                            min={Math.floor(Lon_Min * 10) / 10}
                            max={Math.ceil(Lon_Max * 10) / 10}
                            step={.1}
                            value={[typeof lon[0] === 'number' ? lon[0] : -90, typeof lon[1] === 'number' ? lon[1] : 90]}
                            onChange={(e, value) => this.handleSliderChange('lon', value)}
                            classes={{
                                valueLabel: classes.sliderValueLabel,
                                thumb: classes.sliderThumb,
                                markLabel: classes.markLabel
                            }}
                            className={classes.slider}
                            disabled={Lon_Min === Lon_Max}
                            marks={[
                                {
                                    value: Math.floor(Lon_Min * 10) / 10,
                                    label: `${Math.floor(Lon_Min * 10) / 10}`
                                },
                                {
                                    value: Math.ceil(Lon_Max * 10) / 10,
                                    label: `${Math.ceil(Lon_Max * 10) / 10}`
                                }
                            ]}
                        />

                        {
                            Depth_Max ?
                            <>
                                <Grid container className={classes.formGrid}>
                                    <Grid item xs={12} md={4}>
                                        <Typography className={classes.formLabel}>
                                            Depth[m]
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="Start"
                                            type="number"
                                            inputProps={{
                                                min: Math.floor(Depth_Min),
                                                max: Math.ceil(Depth_Max),
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={depth[0]}
                                            onChange={e => this.handleSliderChange('depth', [e.target.value === '' ? '' : Number(e.target.value), depth[1]])}
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={4}>
                                        <TextField
                                            label="End"
                                            type="number"
                                            inputProps={{
                                                min: Math.floor(Depth_Min),
                                                max: Math.ceil(Depth_Max),
                                                className: classes.input
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            value={depth[1]}
                                            onChange={e => this.handleSliderChange('depth', [lat[0], e.target.value === '' ? '' : Number(e.target.value)])}
                                        />
                                    </Grid>
                                </Grid>

                                <Slider
                                    min={Math.floor(Depth_Min)}
                                    max={Math.ceil(Depth_Max)}
                                    value={[typeof depth[0] === 'number' ? depth[0] : -90, typeof depth[1] === 'number' ? depth[1] : 90]}
                                    onChange={(e, value) => this.handleSliderChange('depth', value)}
                                    classes={{
                                        valueLabel: classes.sliderValueLabel,
                                        thumb: classes.sliderThumb,
                                        markLabel: classes.markLabel
                                    }}
                                    className={classes.slider}
                                    marks={[
                                        {
                                            value: Math.floor(Depth_Min),
                                            label: `${Math.floor(Depth_Min)}`
                                        },
                                        {
                                            value: Math.ceil(Depth_Max),
                                            label: `${Math.ceil(Depth_Max)}`
                                        }
                                    ]}
                                />
                            </>
                            : ''
                        }

                    </DialogContent>

                    <DialogActions style={{marginTop: '8px'}}>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>

                        {subsetAvailable &&
                            <Button onClick={() => this.handleSubsetDownload(Table_Name, timeString1, timeString2, subsetLat1, subsetLat2, subsetLon1, subsetLon2, subsetDepth1, subsetDepth2)}>
                                Download Subset
                            </Button>
                        }

                        {fullDataAvailable &&
                            <Button onClick={() => this.handleFullDatasetDownload(Table_Name)}>
                                Download Full Dataset
                            </Button>
                        }
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DownloadDialog));

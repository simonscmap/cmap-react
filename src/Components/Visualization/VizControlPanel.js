import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { ButtonGroup, Grid, IconButton, MenuItem, Drawer, TextField, FormControl, InputLabel, Button, Tooltip} from '@material-ui/core';
import MUISelect from '@material-ui/core/Select';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { Cached, LibraryBooks, ChevronLeft, ChevronRight, InsertChartOutlined, Language, Delete, } from '@material-ui/icons';

import vizSubTypes from '../../Enums/visualizationSubTypes';
import colors from '../../Enums/colors';
import validation from '../../Enums/validation';
import TableStatsDialog from './TableStatsDialog';
import mapTemporalResolutionToNumber from '../../Utility/mapTemporalResolutionToNumber';
import mapSpatialResolutionToNumber from '../../Utility/mapSpatialResolutionToNumber';
import spatialResolutions from '../../Enums/spatialResolutions';

import { cruiseTrajectoryRequestSend, clearCharts } from '../../Redux/actions/visualization';
import { snackbarOpen } from '../../Redux/actions/ui';

import utcDateStringToLocal from '../../Utility/utcDateStringToLocal';
import depthUtils from '../../Utility/depthCounter';
import countWebGLContexts from '../../Utility/countWebGLContexts';
import tooltips from '../../Utility/tooltips';

import ConnectedTooltip from '../UI/ConnectedTooltip';
import VizSelectWrapper from './VizSelectWrapper';

const navDrawerWidth = 320;

const errorHeightAdjust = 23;

const styles = theme => ({
    drawer: {
        width: navDrawerWidth,
        top: 32,
        bottom: 'auto',
        overflow: 'visible'
    },

    drawerPaper: {
        width: navDrawerWidth,
        height: '540px',
        top: 'calc(50% - 270px)',
        borderRadius: '0 4px 4px 0',
        boxShadow: '2px 2px  2px 2px #242424',
        border: 'none',
        overflow: 'visible',
        backgroundColor: colors.backgroundGray
    },

    drawerPaperError1: {
        height: `${540 + errorHeightAdjust}px`
    },

    drawerPaperError2: {
        height: `${540 + errorHeightAdjust * 2}px`
    },

    drawerPaperError3: {
        height: `${540 + errorHeightAdjust * 3}px`
    },

    drawerPaperError4: {
        height: `${540 + errorHeightAdjust * 4}px`
    },

    drawerPaperError5: {
        height: `${540 + errorHeightAdjust * 5}px`
    },

  openPanelChevron: {
    position: 'fixed',
    left: '5px',
    top: 'calc(50% - 8px)',
    zIndex: 1100
  },

  closePanelChevron: {
    position: 'fixed',
    left: navDrawerWidth + 5,
    top: 'calc(50% - 8px)',
    zIndex: 1100
  },

  groupedButtons: {
      width: '50%',
      border: '1px solid #313131',
      borderRadius: 0,
      backgroundColor: '#3c3c3c'
  },

  controlPanelForm: {
      marginTop: theme.spacing(1)
  },

  tableStatsButton: {
      borderRadius: 0,
      paddingTop: '11px',
      backgroundColor: colors.backgroundGray,
      border: '1px solid #313131'
  },

    formGridItem: {
        borderLeft: '1px solid #313131',
        backgroundColor: colors.backgroundGray
    },

  vizTypeSelectFormControl: {
      width: '100%',
      '&:disabled': {
        backgroundColor: 'transparent'
    }
  },

  depressed: {
      boxShadow: 'inset 1px 1px 5px #1c1c1c'
  },

  padLeft: {
      padding: '6px 0 2px 7px'
  },

  visualizeButton: {
      height: '56px',
      borderRadius: 0,
      backgroundColor: colors.backgroundGray,
      color: theme.palette.primary.main,
      fontVariant: 'normal',
      '&:disabled': {
        backgroundColor: 'transparent'
    },
      '&:hover': {
          backgroundColor: colors.greenHover,
            color: 'white'
        }
  },

  helperText: {
    color: 'yellow'
  },

  vizButtonTooltip: {
    color: 'yellow'
  },

  datePickerInputAdornment: {
      padding: 0
  },

  clearChartsButton: {
      borderRadius: 0,
      backgroundColor: '#3c3c3c',
      width: '100%',
      borderRight: '1px solid #313131'

  },

  resetSPParamsButton: {
    borderRadius: 0,
    backgroundColor: '#3c3c3c',
    width: '100%',
  },

  datePicker: {
      width: '100%'
  },

  singleValueReplacement: {
      display: 'inline',
      position: 'relative',
      width: 0,
      height: 0
  },

  vizTypeMenu: {
      backgroundColor: colors.backgroundGray
  },

  vizTypeMenuItem: {
    '&:hover': {backgroundColor: colors.greenHover}
  }
});

const overrideDisabledStyle = {
    backgroundColor: 'transparent'
}

const mapStateToProps = (state, ownProps) => ({
    storedProcedureRequestState: state.storedProcedureRequestState,
    cruiseTrajectory: state.cruiseTrajectory,
    showHelp: state.showHelp,
    datasets: state.datasets,
    charts: state.charts
})

const mapDispatchToProps = {
    cruiseTrajectoryRequestSend,
    clearCharts,
    snackbarOpen
}

const getDatePlaceholder = (date) => {
    if(isNaN(new Date(date)).valueOf()) return 'yyyy-MM-dd';
    
    let month  = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    return [year, month < 10 ? '0' + month : month, day < 10 ? '0' + day : day].join('-');
}

const selectRef = React.createRef();
const controlPanelRef = React.createRef();

class VizControlPanel extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            tableStatsDialogIsOpen: false,
            showControlPanel: true
        }
    }

    handleOpenControlPanel = () => {
        this.setState({...this.state, showControlPanel: true})
    }

    handleCloseControlPanel = () => {
        this.setState({...this.state, showControlPanel: false})
    }      
    
    handleTableStatsDialogClose = () => {
        this.setState({...this.state, tableStatsDialogIsOpen: false})
    }

    handleTableStatsDialogOpen = (event) => {
        event.stopPropagation();
        this.setState({...this.state, tableStatsDialogIsOpen: true});
    }

    handleResetSPParams = () => {
        this.props.resetSPParams();
        this.setState({...this.state, searchField: ''});
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') {
            this.setState({...this.state, searchField: searchString});
            selectRef.current.select.setState({focusedOption: -1})
        }

        if(action.action === 'escape-clear'){
            this.setState({...this.state, searchField: searchString});
            selectRef.current.select.setState({focusedOption: -1})
        }
        // if(action.action ==='set-value') this.setState({...this.state, searchField: ''});
    }

    estimateDataSize = () => {
        const { dt1, dt2, lat1, lat2, lon1, lon2, fields, depth1, depth2, selectedVizType } = this.props;
        if(!fields) return 0;
        if(fields.data.Spatial_Resolution === spatialResolutions.irregular) return 0;
        if(selectedVizType === vizSubTypes.timeSeries || selectedVizType === vizSubTypes.depthProfile) return 0;

        const date1 = Date.parse(dt1);
        const date2 = Date.parse(dt2);
        
        const dayDiff = (date2 - date1) / 86400000;
        
        const res = mapSpatialResolutionToNumber(fields.data.Spatial_Resolution);
        
        const dateCount = Math.floor(dayDiff / mapTemporalResolutionToNumber(fields.data.Temporal_Resolution)) || 1;
        const depthCount = depthUtils.count(fields, depth1, depth2) || 1;
        
        const latCount = (lat2 - lat1) / res;
        const lonCount = (lon2 - lon1) / res;

        const pointCount = lonCount * latCount * depthCount * dateCount;
        return pointCount;
    }

    checkStartDepth = () => {
        if(this.props.surfaceOnly) return '';
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.depth1)) return validation.generic.invalid;
        if(parseFloat(this.props.depth1) < 0) return validation.depth.negative;
        if(parseFloat(this.props.depth1) > parseFloat(this.props.depth2)) return validation.depth.depthOneIsLower;
        if(parseFloat(this.props.depth1) > parseFloat(this.props.fields.data.Depth_Max)) return validation.depth.depthOneOutOfBounds.replace('$', parseFloat(this.props.fields.data.Depth_Max).toFixed(2));
        return ''; 
    }

    checkEndDepth = () => {
        if(this.props.surfaceOnly) return '';
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.depth2)) return validation.generic.invalid;
        if(parseFloat(this.props.depth2) < 0) return validation.depth.negative;
        if(parseFloat(this.props.depth1) > parseFloat(this.props.depth2)) return validation.depth.depthOneIsLower;
        if(parseFloat(this.props.depth2) < parseFloat(this.props.fields.data.Depth_Min)) return validation.depth.depthTwoOutOfBounds.replace('$', parseFloat(this.props.fields.data.Depth_Min).toFixed(2));
        return ''; 
    }

    checkStartDateValid = () => {
        if(isNaN(new Date(this.props.dt1)).valueOf() || !this.props.dt1) return 'Start date is invalid';
    }

    checkEndDateValid = () => {
        if(isNaN(new Date(this.props.dt2)).valueOf() || !this.props.dt1) return 'End date is invalid';
    }

    checkStartDate = () => {
        if(this.props.dt1 > this.props.dt2) return validation.date.dateOneIsLater;
        if(this.props.dt1 > this.props.fields.data.Time_Max) return validation.date.dateOneOutOfBounds.replace('$', this.props.fields.data.Time_Max);
        return '';
    }

    checkEndDate = () => {
        if(this.props.dt2 < this.props.fields.data.Time_Min) return validation.date.dateTwoOutOfBounds.replace('$', this.props.fields.data.Time_Min);
        return '';
    }

    checkStartLat = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lat1)) return validation.generic.invalid;
        if(parseFloat(this.props.lat1) < -90 || parseFloat(this.props.lat1) > 90) return validation.generic.invalid;
        if(parseFloat(this.props.lat1) > parseFloat(this.props.lat2)) return validation.lat.latOneIsHigher;
        if(parseFloat(this.props.lat1) > parseFloat(this.props.fields.data.Lat_Max)) return validation.lat.latOneOutOfBounds.replace('$', this.props.fields.data.Lat_Max);
        return '';
    }

    checkEndLat = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lat2)) return validation.generic.invalid;
        if(parseFloat(this.props.lat2) < -90 || parseFloat(this.props.lat2) > 90) return validation.generic.invalid;
        if(parseFloat(this.props.lat2) < parseFloat(this.props.fields.data.Lat_Min)) return validation.lat.latTwoOutOfBounds.replace('$', this.props.fields.data.Lat_Min);
        return '';
    }

    checkStartLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon1)) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) < -180 || parseFloat(this.props.lon1) > 180) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) > parseFloat(this.props.fields.data.Lon_Max)) return validation.lon.lonOneOutOfBounds.replace('$', this.props.fields.data.Lon_Max);
        return '';
    }

    checkEndLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon2)) return validation.generic.invalid;
        if(parseFloat(this.props.lon2) < -180 || parseFloat(this.props.lon2) > 180) return validation.generic.invalid;
        if(parseFloat(this.props.lon2) < parseFloat(this.props.fields.data.Lon_Min)) return validation.lon.lonTwoOutOfBounds.replace('$', this.props.fields.data.Lon_Max);
        return '';
    }

    checkHeatmap = () => {
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Heatmap');
        return '';
    }

    checkContour = () => {
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Contour');
        return '';
    }

    checkSection = () => {
        if(this.props.surfaceOnly) return validation.type.surfaceOnlyDataset.replace('$', this.props.fields.value);
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Section Map');
        if(this.props.depth1 === this.props.depth2) return validation.type.depthRangeRequired.replace('$', "Section Map");
        return '';
    }

    checkHistogram = () => {
        return '';
    }
    
    checkTimeSeries = () => {
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Time Series');
        if(this.props.dt1 === this.props.dt2) return validation.type.dateRangeRequired.replace('$', 'Time Series');
        return '';
    }

    checkDepthProfile = () => {
        if(this.props.surfaceOnly) return validation.type.surfaceOnlyDataset.replace('$', this.props.fields.value);
        if(this.props.depth1 === this.props.depth2) return validation.type.depthRangeRequired.replace('$', 'Depth Profile');
        return '';
    }

    checkSparseMap = () => {
        if(!this.props.irregularSpatialResolution) return validation.type.irregularOnly;
        return '';
    }

    checkGeneralWarn = (dataSize) => {
        if(!this.props.selectedVizType) return '';
        if(dataSize > 1200000) return validation.generic.dataSizeWarning;
        return ''
    }

    checkGeneralPrevent = (dataSize) => {
        const webGLCount = countWebGLContexts(this.props.charts);
        if(this.props.selectedVizType === vizSubTypes.heatmap && webGLCount > 14) return validation.type.webGLContextLimit;
        if(this.props.selectedVizType === vizSubTypes.sparse && webGLCount > 11) return validation.type.webGLContextLimit;

        if(this.props.selectedVizType === vizSubTypes.heatmap){
            let availableContexts = 16 - webGLCount;
            const depthCount = depthUtils.count(this.props.fields, this.props.depth1, this.props.depth2) || 1;
            if(availableContexts - depthCount < 1) return 'Too many distinct depths to render heatmap. Please reduce depth range or select section map.';
        }
        if(this.props.selectedVizType !== vizSubTypes.histogram && this.props.selectedVizType !== vizSubTypes.heatmap && dataSize > 1200000){
            return validation.generic.dataSizePrevent;
        }
        if(dataSize > 6000000) return validation.generic.dataSizePrevent;
        if(!this.props.fields) return validation.generic.variableMissing;
        if(!this.props.selectedVizType) return validation.generic.vizTypeMissing;
        return ''}

    handleShowChartsAndResize = () => {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 30);
        this.props.handleShowCharts();     
    }
    
    render() {      
        const { showControlPanel } = this.state;
        
        const { classes, 
            fields, 
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            selectedVizType,
            showCharts,
            handleShowGlobe,
            handleChange,
            handleLatLonChange
        } = this.props;

        let validations;

        const dataSize = this.estimateDataSize();

        var catalogMinDate = fields && utcDateStringToLocal(fields.data.Time_Min).setHours(0,0,0,0);
        var catalogMaxDate = fields && utcDateStringToLocal(fields.data.Time_Max).setHours(0,0,0,0);
        var zeroedDT1 = dt1.setHours(0,0,0,0);
        var zeroedDT2 = dt2.setHours(0,0,0,0);
        
        var minDate = fields ? catalogMinDate : '';

        let minDateMessage = fields && zeroedDT2 < catalogMinDate ? 'End cannot be before dataset start date' : '';
        var maxDateMessage;
        var maxDate;

        if(!fields){
            maxDate = zeroedDT2;
            maxDateMessage = zeroedDT1 > maxDate ? 'Start cannot be after end' : '';
        } else {           
            if(catalogMaxDate < zeroedDT2){
                maxDate = catalogMaxDate;
                maxDateMessage = zeroedDT1 > maxDate ? 'Start cannot be after dataset end date' : '';
            } else {
                maxDate = zeroedDT2;
                maxDateMessage = zeroedDT1 > maxDate ? 'Start cannot be after end' : '';
            }
        }

        if(fields) {
            validations = [
                this.checkStartDepth(),
                this.checkEndDepth(),
                this.checkStartLat(),
                this.checkEndLat(),
                this.checkStartLon(),
                this.checkEndLon(),
                this.checkHeatmap(),
                this.checkContour(),
                this.checkSection(),
                this.checkHistogram(),
                this.checkTimeSeries(),
                this.checkDepthProfile(),
                this.checkSparseMap(),
                this.checkGeneralWarn(dataSize),
                this.checkGeneralPrevent(dataSize),
                this.checkStartDateValid(),
                this.checkEndDateValid()
            ];
        } else validations = Array(16).fill('');

        const [
            startDepthMessage,
            endDepthMessage,
            startLatMessage,
            endLatMessage,
            startLonMessage,
            endLonMessage,
            heatmapMessage,
            contourMessage,
            sectionMapMessage,
            histogramMessage,
            timeSeriesMessage,
            depthProfileMessage,
            sparseMapMessage,
            generalWarnMessage,
            generalPreventMessage,
            startDateValidMessage,
            endDateValidMessage
        ] = validations;

        const checkDisableVisualizeList = [
            startDepthMessage,
            endDepthMessage,
            startLatMessage,
            endLatMessage,
            startLonMessage,
            endLonMessage,
            generalPreventMessage,
            minDateMessage,
            maxDateMessage,
            startDateValidMessage,
            endDateValidMessage
        ];

        let cdvl = checkDisableVisualizeList;
        let errorCount = 0;
        
        if(cdvl[0] || cdvl[1]) errorCount ++;
        if(cdvl[2] || cdvl[3]) errorCount ++;
        if(cdvl[4] || cdvl[5]) errorCount ++;
        if(cdvl[7] || cdvl[9]) errorCount ++;
        if(cdvl[8] || cdvl[10]) errorCount ++;

        const errorSizeAdjust = errorCount > 0 ? 'drawerPaperError' + errorCount : '';

        const checkDisableVisualize = () => {
            for(let i = 0; i < checkDisableVisualizeList.length; i++){
                if(checkDisableVisualizeList[i]) return checkDisableVisualizeList[i];
            }

            return false;
        }

        const disableVisualizeMessage = checkDisableVisualize();

        const visualizeButtonTooltip = disableVisualizeMessage ? disableVisualizeMessage : generalWarnMessage ? generalWarnMessage : '';

        return (
            <div>
                <TableStatsDialog
                    open={this.state.tableStatsDialogIsOpen}
                    onClose={this.handleTableStatsDialogClose}
                    data={fields && fields.data}
                />

                { showControlPanel ? 
                    <ConnectedTooltip title={tooltips.visualization.controlPanel} placement='right'>
                        <IconButton 
                            className={classes.closePanelChevron} 
                            aria-label="toggle-panel" 
                            color="primary" 
                            onClick={this.handleCloseControlPanel}>
                            <ChevronLeft />
                        </IconButton>
                    </ConnectedTooltip>
                :
                    <ConnectedTooltip title={tooltips.visualization.controlPanel} placement='right'>
                        <IconButton 
                            className={classes.openPanelChevron} 
                            aria-label="toggle-panel" 
                            color="primary" 
                            onClick={this.handleOpenControlPanel}>
                            <ChevronRight />
                        </IconButton>
                    </ConnectedTooltip>
                }

                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    open={showControlPanel}
                    classes={{
                        paper: `${classes.drawerPaper} ${classes[errorSizeAdjust]}`,
                    }}
                    anchor="left"
                    PaperProps={{
                        ref: controlPanelRef
                    }}
                >
                    <ButtonGroup>
                        <Tooltip title='Show Globe' placement='top'>
                            <IconButton 
                                className={`${classes.groupedButtons} ${!showCharts && classes.depressed}`} 
                                onClick={handleShowGlobe}
                                color='inherit'
                            >
                                <Language/>
                            </IconButton>
                        </Tooltip>
                        
                        <Tooltip title='Show Charts' placement='top'>
                            <IconButton 
                                className={`${classes.groupedButtons} ${showCharts && classes.depressed}`}
                                onClick={this.handleShowChartsAndResize}
                                color='inherit'
                            >
                                <InsertChartOutlined/>
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                    
                    <Grid container>
                        <Grid item xs={6}>
                            <Tooltip title='Clear Charts' placement='bottom'>
                                <IconButton color='inherit' onClick={this.props.clearCharts} className={classes.clearChartsButton}>
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item xs={6}>
                            <Tooltip title='Reset Parameters' placement='right'>
                                <IconButton color='inherit' onClick={this.handleResetSPParams} className={classes.resetSPParamsButton}>
                                    <Cached/>
                                </IconButton>
                            </Tooltip>                            
                        </Grid>
                    </Grid>

                    <form>
                        <Grid container>
                            <Grid item xs={10}>
                                {/* <ConnectedTooltip placement='top' title='Enter one or more search terms.'> */}
                                    <VizSelectWrapper
                                        updateFields={this.props.updateFields}
                                        handleSetDownloadTarget={this.props.handleSetDownloadTarget}
                                        controlPanelRef={controlPanelRef}
                                        fields={fields}
                                    />
                                {/* </ConnectedTooltip> */}
                            </Grid>
                            <Grid item xs={2} className={classes.tableStatsButton}>
                                <IconButton 
                                    size='small' 
                                    onClick={this.handleTableStatsDialogOpen}                                     
                                    disabled={!fields}
                                >
                                    <LibraryBooks/>
                                </IconButton>
                            </Grid>

                            <Grid item xs={12}>
                                <KeyboardDatePicker
                                    className={classes.datePicker}
                                    placeholder={getDatePlaceholder(dt1)}
                                    id="startDate"
                                    label="Start Date"
                                    name="dt1"
                                    format='yyyy-MM-dd'
                                    maxDate={maxDate}
                                    minDate={null}
                                    maxDateMessage={maxDateMessage}
                                    autoOk
                                    value={dt1}
                                    onChange={this.props.handleStartDateChange}
                                    inputVariant='filled'
                                    variant='inline'
                                    KeyboardButtonProps={{
                                        className: classes.datePickerInputAdornment
                                    }}
                                    // disabled={!fields}
                                />
                            </Grid>  

                            <Grid item xs={12}>
                                <KeyboardDatePicker
                                    className={classes.datePicker}
                                    placeholder={getDatePlaceholder(dt2)}
                                    id="endDate"
                                    label="End Date"
                                    name="dt2"
                                    format='yyyy-MM-dd'
                                    minDate={minDate}
                                    maxDate={null}
                                    minDateMessage={minDateMessage}
                                    autoOk
                                    value={dt2}
                                    onChange={this.props.handleEndDateChange}
                                    inputVariant='filled'
                                    variant='inline'
                                    KeyboardButtonProps={{
                                        className: classes.datePickerInputAdornment
                                    }}
                                    // disabled={!fields}
                                />
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="lat1-input"
                                    error={Boolean(startLatMessage)}
                                    label={"Start Lat(\xB0)"}
                                    className={classes.textField}
                                    value={lat1}
                                    onChange={handleLatLonChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={startLatMessage}
                                    name='lat1'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="lat2-input"
                                    error={Boolean(endLatMessage)}
                                    label={"End Lat(\xB0)"}
                                    className={classes.textField}
                                    value={lat2}
                                    onChange={handleLatLonChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={endLatMessage}
                                    name='lat2'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="lon1-input"
                                    error={Boolean(startLonMessage)}
                                    label={"Start Lon(\xB0)"}
                                    className={classes.textField}
                                    value={lon1}
                                    onChange={handleLatLonChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={startLonMessage}
                                    name='lon1'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="lon2-input"
                                    error={Boolean(endLonMessage)}
                                    label={"End Lon(\xB0)"}
                                    className={classes.textField}
                                    value={lon2}
                                    onChange={handleLatLonChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={endLonMessage}
                                    name='lon2'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="depth1-input"
                                    error={Boolean(startDepthMessage)}
                                    label="Start Depth(m)"
                                    className={classes.textField}
                                    value={depth1}
                                    onChange={handleChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={startDepthMessage}
                                    name='depth1'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    id="depth2-input"
                                    error={Boolean(endDepthMessage)}
                                    label="End Depth(m)"
                                    className={classes.textField}
                                    value={depth2}
                                    onChange={handleChange}
                                    FormHelperTextProps={{className: classes.helperText}}
                                    helperText={endDepthMessage}
                                    name='depth2'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl variant='filled' className={classes.vizTypeSelectFormControl} disabled={!fields}>
                                    <InputLabel shrink htmlFor="vizSelector" >Type</InputLabel>
                                    <MUISelect
                                        className={classes.vizTypeSelectFormControl}
                                        style={overrideDisabledStyle}
                                        value={selectedVizType}
                                        variant='filled'
                                        onChange={this.props.handleChange}
                                        inputProps={{
                                            name: 'selectedVizType',
                                            id: 'vizSelector',
                                            variant: 'filled'
                                        }}
                                        MenuProps={{
                                            MenuListProps: {
                                                className: classes.vizTypeMenu
                                            }
                                        }}
                                        >
                                        {!heatmapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.heatmap} title={heatmapMessage}>Heatmap</MenuItem>}
                                        {!contourMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.contourMap}>Contour Heatmap</MenuItem>}
                                        {!sectionMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.sectionMap}>Section Map</MenuItem>}
                                        {!sectionMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.contourSectionMap}>Contour Section Map</MenuItem>}
                                        {!histogramMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.histogram}>Histogram</MenuItem>}                      
                                        {!timeSeriesMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.timeSeries}>Time Series</MenuItem>}
                                        {!depthProfileMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.depthProfile}>Depth Profile</MenuItem>}
                                        {!sparseMapMessage && <MenuItem className={classes.vizTypeMenuItem} value={vizSubTypes.sparse}>Sparse Map</MenuItem>}
                                    </MUISelect>
                                </FormControl>
                            </Grid>

                            <Tooltip placement='right' title={visualizeButtonTooltip} className={classes.vizButtonTooltip}>
                                <Grid item xs={12}>
                                    <Button
                                        className={classes.visualizeButton}
                                        variant='contained'
                                        onClick={() => this.props.onVisualize()}
                                        disabled={Boolean(disableVisualizeMessage) || !fields || !selectedVizType}
                                        fullWidth
                                    >
                                        Visualize
                                    </Button>
                                </Grid>
                            </Tooltip>
                        </Grid>
                    </form>                    
                </Drawer>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VizControlPanel));
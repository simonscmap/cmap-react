import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { throttle } from 'throttle-debounce';

import { withStyles, Collapse, Paper, Badge, ButtonGroup, Grid, IconButton, Icon, ListItem, MenuItem, Typography, Drawer, TextField, FormControl, InputLabel, Button, Tooltip, ClickAwayListener, Slide} from '@material-ui/core';
import { Edit, PlayArrow, ControlCamera , Settings, Fastfood, ShowChart, Search, Cached, LibraryBooks, ArrowRight, ChevronLeft, ChevronRight, InsertChartOutlined, Language, Delete, ShoppingCart, Info, DirectionsBoat } from '@material-ui/icons';
import { KeyboardDatePicker } from "@material-ui/pickers";

import { cruiseTrajectoryRequestSend, clearCharts, csvDownloadRequestSend, vizPageDataTargetSetAndFetchDetails, storedProcedureRequestSend } from '../../Redux/actions/visualization';
import { snackbarOpen } from '../../Redux/actions/ui';

import colors from '../../Enums/colors';
import vizSubTypes from '../../Enums/visualizationSubTypes';
import validation from '../../Enums/validation';
import spatialResolutions from '../../Enums/spatialResolutions';
import temporalResolutions from '../../Enums/temporalResolutions';

import mapTemporalResolutionToNumber from '../../Utility/mapTemporalResolutionToNumber';
import mapSpatialResolutionToNumber from '../../Utility/mapSpatialResolutionToNumber';
import utcDateStringToLocal from '../../Utility/utcDateStringToLocal';
import depthUtils from '../../Utility/depthCounter';
import countWebGLContexts from '../../Utility/countWebGLContexts';
import mapVizType from '../../Utility/Visualization/mapVizType';
import cleanSPParams from '../../Utility/Visualization/cleanSPParams'

import DataSearch from './DataSearch';
import ChartControl from './ChartControl';
import VariableDetailsDialog from './VariableDetailsDialog';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
    cruiseTrajectory: state.cruiseTrajectory,
    showHelp: state.showHelp,
    datasets: state.datasets,
    charts: state.charts,
    cart: state.cart,
    dataTarget: state.vizPageDataTarget,
    vizPageDataTargetDetails: state.vizPageDataTargetDetails,
})

const mapDispatchToProps = {
    cruiseTrajectoryRequestSend,
    clearCharts,
    csvDownloadRequestSend,
    snackbarOpen,
    vizPageDataTargetSetAndFetchDetails,
    storedProcedureRequestSend
}

const drawerWidth = 300;

const overrideDisabledStyle = {
    backgroundColor: 'transparent'
}

const polygonSymbol = {
    type: "polygon-3d",
    symbolLayers: [
        {
            type: "fill",
            material: {
            color: [0, 255, 255, .3]
            },
            outline: {
                color: [0, 255, 255, 1],
                size: '2px'
            }
        }
    ]
};

// const getDatePlaceholder = (date) => {
//     if(isNaN(new Date(date)).valueOf()) return 'yyyy-MM-dd';
    
//     let month  = date.getMonth() + 1;
//     let day = date.getDate();
//     let year = date.getFullYear();
//     return [year, month < 10 ? '0' + month : month, day < 10 ? '0' + day : day].join('-');
// }

const styles = (theme) => ({
    drawerPaper: {
        width: drawerWidth,
        height: 'auto',
        // minHeight: 400,
        top: 180,
        borderRadius: '0 4px 4px 0',
        boxShadow: '2px 2px  2px 2px #242424',
        border: 'none',
        overflow: 'visible',
        backgroundColor: colors.backgroundGray
    },

    dataSearchMenuPaper: {
        position: 'fixed',
        top: 120,
        bottom: 60,
        left: 0,
        width: '98vw',
        height: 'auto',
        zIndex: 1500,
        backgroundColor: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(5px)',
    },

    controlPanelForm: {
        marginTop: theme.spacing(1)
    },
    
    formGridItem: {
        border: '1px solid #313131',
        borderBottom: 'none',
        borderTop: 'none',
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

  dateTimeInput: {
    padding: '6px 0 2px 7px',
    alignItems: 'start'
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

  vizTypeMenu: {
      backgroundColor: colors.backgroundGray
  },

  vizTypeMenuItem: {
    '&:hover': {backgroundColor: colors.greenHover}
  },

    controlPanelItem: {
        textTransform: 'none',
        textAlign: 'left',
        fontSize: '17px',
        fontWeight: 200,
        color: colors.primary,
        justifyContent: 'flex-start',
        height: '56px'
    },

    controlPanelItemLabel: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-block'
    },

    controlPanelItemStartIcon: {
        display: 'inline-block'
    },

    textField: {
        width: '100%'
    },

    drawHelpText: {
        position: 'fixed',
        top: 120,
        margin: '0 calc(50vw - 226px)',
        zIndex: 1500,
        color: 'white',
        fontSize: '18px',
        backgroundColor: 'rgba(0, 0, 0, .6)',
        padding: '8px',
        backdropFilter: 'blur(5px)',
        borderRadius: '4px'
    },

    popoutButtonPaper: {
        position: 'absolute',
        display: 'flex',
        borderRadius: '2px',
        boxShadow: '2px 2px  2px 2px #242424',
        backgroundColor: colors.backgroundGray
    },

    popoutButtonIcon: {
        width: '24px',
        height: '24px'
    },

    popoutButtonBase: {
        padding: '9px'
    }
});

class NewVizControlPanel extends React.Component {

    state = {
        variableDetailsID: null,
        showControlPanel: true,
        dataSearchMenuOpen: false,
        tableName: '',
        depth1: 0,
        depth2: 0,
        dt1: '1900-01-01',
        dt2: new Date().toISOString().slice(0,10),
        lat1: 0,
        lat2: 0,
        lon1: 0,
        lon2: 0,
        selectedVizType: '',
        surfaceOnly: false,
        irregularSpatialResolution: false,
        addedGlobeUIListeners: false,
        showDrawHelp: false
    }

    componentDidUpdate = (prevProps, prevState) => {
        if((this.props.mapContainerRef.current) && (prevState.lat1 !== this.state.lat1 || prevState.lat2 !== this.state.lat2 || prevState.lon1 !== this.state.lon1 || prevState.lon2 !== this.state.lon2)){
            
            const lat1 = parseFloat(this.state.lat1);
            const lat2 = parseFloat(this.state.lat2);
            const lon1 = parseFloat(this.state.lon1);
            let _lon2 = parseFloat(this.state.lon2);
            const lon2 = _lon2 < lon1 ? _lon2 + 360 : _lon2;

            this.props.mapContainerRef.current.regionLayer.removeAll();
            var polygon = {
                type: 'polygon', 
                rings: [
                    [lon1, lat1],
                    [lon2, lat1],
                    [lon2, lat2],
                    [lon1, lat2],
                    [lon1, lat1]
                ]
            };

            let regionGraphic = new this.props.mapContainerRef.current.props.esriModules.Graphic({
                geometry: polygon,
                symbol: polygonSymbol
            })

            this.props.mapContainerRef.current.regionLayer.add(regionGraphic);
        }

        if(this.props.vizPageDataTargetDetails && this.props.vizPageDataTargetDetails !== prevProps.vizPageDataTargetDetails){

            let data = this.props.vizPageDataTargetDetails;
            let surfaceOnly = !data.Depth_Max;
            let irregularSpatialResolution = data.Spatial_Resolution === 'Irregular';

            let dt1 = data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                1 : data.Time_Min.slice(0, 10);
            let dt2 = data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                1 : data.Time_Max.slice(0, 10);

            let lat1 = irregularSpatialResolution ? Math.floor(data.Lat_Min * 1000) /1000 : this.state.lat1;
            let lat2 = irregularSpatialResolution ? Math.ceil(data.Lat_Max * 1000) /1000 : this.state.lat2;
            let lon1 = irregularSpatialResolution ? Math.floor(data.Lon_Min * 1000) /1000 : this.state.lon1;
            let lon2 = irregularSpatialResolution ? Math.ceil(data.Lon_Max * 1000) /1000 : this.state.lon2;

            let depth1 = surfaceOnly ? 0 : irregularSpatialResolution ? data.Depth_Min || 0 : this.state.depth1;

            let depth2 = surfaceOnly ? 0 : irregularSpatialResolution ? data.Depth_Max || 0 : 
                depthUtils.piscesTable.has(data.Table_Name) ? ((depthUtils.piscesDepths[0] + depthUtils.piscesDepths[1]) / 2).toFixed(2) :
                depthUtils.darwinTable.has(data.Table_Name) ? ((depthUtils.darwinDepths[0] + depthUtils.darwinDepths[1]) / 2).toFixed(2) : 
                this.state.depth2;

            if(irregularSpatialResolution){
                this.props.globeUIRef.current.props.view.goTo({
                    target: [(parseFloat(lon1) + parseFloat(lon2)) / 2, (parseFloat(lat1) + parseFloat(lat2)) / 2],
                    zoom: 3
                }, {
                    maxDuration: 2500,
                    speedFactor: .5
                }); 
            }

            
            this.setState({...this.state,
                surfaceOnly,
                irregularSpatialResolution,
                dt1,
                dt2,
                lat1,
                lat2,
                lon1,
                lon2,
                depth1,
                depth2,
                selectedVizType: ''
            });
        }
    }

    updateDomainFromGraphicExtent = (extent) => {
        var _lon1 = extent.xmin;

        while(_lon1 < -180) _lon1 += 360;
        while (_lon1 > 180) _lon1 -= 360;

        var _lon2 = extent.xmax;

        while(_lon2 < -180) _lon2 += 360;
        while(_lon2 > 180) _lon2 -= 360;

        var newCoordinates = {
            lat1: extent.ymin.toFixed(3),
            lat2: extent.ymax.toFixed(3),
            lon1: _lon1.toFixed(3),
            lon2: _lon2.toFixed(3)
        };

        this.setState({...this.state, ...newCoordinates});
    }

    handleShowChartsClick = () => {
        if(this.props.showCharts){
            this.props.handleShowGlobe();
        }

        else {
            this.props.handleShowCharts();
        }
    }

    handleVisualize = () => {
        const { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2, selectedVizType } = this.state;

        let mapping = mapVizType(selectedVizType);
        let parameters = cleanSPParams({
            depth1,
            depth2,
            dt1: this.props.vizPageDataTargetDetails.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                dt1 + '-01-1900' :
                dt1,
            dt2: this.props.vizPageDataTargetDetails.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                dt2 + '-01-1900' :
                dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            fields: this.props.vizPageDataTargetDetails.Variable,
            tableName: this.props.vizPageDataTargetDetails.Table_Name,
            spName: mapping.sp
        });

        let payload = {
            parameters,
            subType: mapping.subType,
            metadata: this.props.vizPageDataTargetDetails
        }
    
        this.props.storedProcedureRequestSend(payload);
    }

    handleDrawClick = () => {
        const { esriModules, regionLayer } = this.props.globeUIRef.current.props;
        var { sketchModel } = this.props.globeUIRef.current;

        if(!this.state.addedGlobeUIListeners){
            const throttledUpdate = throttle(75, (event) => {
                if(event.state === 'active'){
                    this.updateDomainFromGraphicExtent(esriModules.Utils.webMercatorToGeographic(event.graphic.geometry.extent));
                }
            })
    
            sketchModel.on("create", (event) => {
                if(event.state === 'active' && event.toolEventInfo && event.toolEventInfo.type === 'vertex-add'){
                    sketchModel.complete();
                }
    
                if(event.graphic && event.graphic.visible) {
                    event.graphic.visible = false;
                }

                if(event.state === 'cancel'){
                    sketchModel.cancel();
                    this.setState({...this.state, showDrawHelp: false});
                }

                if(event.state === 'start'){
                    regionLayer.removeAll();
                }
    
                if(event.state === "complete") {
                    this.setState({...this.state, showDrawHelp: false});
                    this.updateDomainFromGraphicExtent(esriModules.Utils.webMercatorToGeographic(event.graphic.geometry.extent));
                }
            });
    
            sketchModel.on('create', throttledUpdate)
    
            sketchModel.on('update', (event) => {
                if(event.toolEventInfo && event.toolEventInfo.type === 'move-stop'){
                    if(event.state === 'cancel') return;
                    this.updateDomainFromGraphicExtent(event.graphics[0].geometry.extent);
                }
            });          
        }
                
        this.setState({...this.state, showDrawHelp: true, addedGlobeUIListeners: true});

        if(this.state.showDrawHelp) sketchModel.cancel();

        else {
            sketchModel.create('polyline', {
                mode:'click'            
            });
        }
    }

    handleSelectDataTarget = (target) => {
        this.setState({...this.state, dataSearchMenuOpen: false});
        this.props.vizPageDataTargetSetAndFetchDetails(target);
    }

    handleCloseDataSearch = () => {
        if(this.state.dataSearchMenuOpen){
            this.setState({...this.state, dataSearchMenuOpen: false});
        }
    }

    handleSetVariableDetailsID = (variableDetailsID) => {
        this.setState({...this.state, variableDetailsID})
    }

    handleChangeInputValue = (e) => {
        this.setState({...this.state, [e.target.name]: e.target.value});
    }

    handleToggleCharts = () => {

    }

    estimateDataSize = () => {
        const { vizPageDataTargetDetails } = this.props;
        const { dt1, dt2, lat1, lat2, lon1, lon2, depth1, depth2, selectedVizType } = this.state;

        if(!vizPageDataTargetDetails) return 0;
        if(vizPageDataTargetDetails.Spatial_Resolution === spatialResolutions.irregular) return 0;
        if(selectedVizType === vizSubTypes.timeSeries || selectedVizType === vizSubTypes.depthProfile) return 0;

        const date1 = Date.parse(dt1);
        const date2 = Date.parse(dt2);
        
        const dayDiff = (date2 - date1) / 86400000;
        
        const res = mapSpatialResolutionToNumber(vizPageDataTargetDetails.Spatial_Resolution);
        
        const dateCount = Math.floor(dayDiff / mapTemporalResolutionToNumber(vizPageDataTargetDetails.Temporal_Resolution)) || 1;
        const depthCount = depthUtils.count({data: vizPageDataTargetDetails}, depth1, depth2) || 1;
        
        const latCount = (lat2 - lat1) / res;
        const lonCount = (lon2 - lon1) / res;

        const pointCount = lonCount * latCount * depthCount * dateCount;
        return pointCount;
    }

    checkStartDepth = () => {
        if(this.state.surfaceOnly) return '';
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.depth1)) return validation.generic.invalid;
        if(parseFloat(this.state.depth1) < 0) return validation.depth.negative;
        if(parseFloat(this.state.depth1) > parseFloat(this.state.depth2)) return validation.depth.depthOneIsLower;
        if(parseFloat(this.state.depth1) > parseFloat(this.props.vizPageDataTargetDetails.Depth_Max)) return validation.depth.depthOneOutOfBounds.replace('$', parseFloat(this.props.vizPageDataTargetDetails.Depth_Max).toFixed(2));
        return ''; 
    }

    checkEndDepth = () => {
        if(this.state.surfaceOnly) return '';
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.state.depth2)) return validation.generic.invalid;
        if(parseFloat(this.state.depth2) < 0) return validation.depth.negative;
        if(parseFloat(this.state.depth1) > parseFloat(this.state.depth2)) return validation.depth.depthOneIsLower;
        if(parseFloat(this.state.depth2) < parseFloat(this.props.vizPageDataTargetDetails.Depth_Min)) return validation.depth.depthTwoOutOfBounds.replace('$', parseFloat(this.props.vizPageDataTargetDetails.Depth_Min).toFixed(2));
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
        if(this.props.dt1 > this.props.vizPageDataTargetDetails.Time_Max) return validation.date.dateOneOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Time_Max);
        return '';
    }

    checkEndDate = () => {
        if(this.props.dt2 < this.props.vizPageDataTargetDetails.Time_Min) return validation.date.dateTwoOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Time_Min);
        return '';
    }

    checkStartLat = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lat1)) return validation.generic.invalid;
        if(parseFloat(this.props.lat1) < -90 || parseFloat(this.props.lat1) > 90) return validation.generic.invalid;
        if(parseFloat(this.props.lat1) > parseFloat(this.props.lat2)) return validation.lat.latOneIsHigher;
        if(parseFloat(this.props.lat1) > parseFloat(this.props.vizPageDataTargetDetails.Lat_Max)) return validation.lat.latOneOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Lat_Max);
        return '';
    }

    checkEndLat = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lat2)) return validation.generic.invalid;
        if(parseFloat(this.props.lat2) < -90 || parseFloat(this.props.lat2) > 90) return validation.generic.invalid;
        if(parseFloat(this.props.lat2) < parseFloat(this.props.vizPageDataTargetDetails.Lat_Min)) return validation.lat.latTwoOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Lat_Min);
        return '';
    }

    checkStartLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon1)) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) < -180 || parseFloat(this.props.lon1) > 180) return validation.generic.invalid;
        if(this.props.lon1 > this.props.lon2) return '';
        if(parseFloat(this.props.lon1) > parseFloat(this.props.vizPageDataTargetDetails.Lon_Max)) return validation.lon.lonOneOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Lon_Max);
        return '';
    }

    checkEndLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon2)) return validation.generic.invalid;
        if(parseFloat(this.props.lon2) < -180 || parseFloat(this.props.lon2) > 180) return validation.generic.invalid;
        if(parseFloat(this.props.lon2) < parseFloat(this.props.vizPageDataTargetDetails.Lon_Min)) return validation.lon.lonTwoOutOfBounds.replace('$', this.props.vizPageDataTargetDetails.Lon_Max);
        return '';
    }

    checkHeatmap = () => {
        if(this.state.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Heatmap');
        return '';
    }

    checkContour = () => {
        if(this.state.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Contour');
        return '';
    }

    checkSection = () => {
        if(this.state.surfaceOnly) return validation.type.surfaceOnlyDataset.replace('$', 'variable');
        if(this.state.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Section Map');
        if(this.state.depth1 === this.props.depth2) return validation.type.depthRangeRequired.replace('$', "Section Map");
        return '';
    }

    checkHistogram = () => {
        return '';
    }
    
    checkTimeSeries = () => {
        if(this.state.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Time Series');
        if(this.state.dt1 === this.state.dt2) return validation.type.dateRangeRequired.replace('$', 'Time Series');
        return '';
    }

    checkDepthProfile = () => {
        if(this.state.surfaceOnly) return validation.type.surfaceOnlyDataset.replace('$', 'variable');
        // if(this.state.depth1 === this.state.depth2) return validation.type.depthRangeRequired.replace('$', 'Depth Profile');
        return '';
    }

    checkSparseMap = () => {
        if(!this.state.irregularSpatialResolution) return validation.type.irregularOnly;
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
            const depthCount = depthUtils.count({data: this.props.vizPageDataTargetDetails}, this.props.depth1, this.props.depth2) || 1;
            if(availableContexts - depthCount < 1) return 'Too many distinct depths to render heatmap. Please reduce depth range or select section map.';
        }
        if(this.props.selectedVizType !== vizSubTypes.histogram && this.props.selectedVizType !== vizSubTypes.heatmap && dataSize > 1200000){
            return validation.generic.dataSizePrevent;
        }
        if(dataSize > 6000000) return validation.generic.dataSizePrevent;
        if(!this.props.vizPageDataTargetDetails) return validation.generic.variableMissing;
        if(!this.state.selectedVizType) return validation.generic.vizTypeMissing;
        return ''
    }

    render = () => {
        const { 
            classes,            
            showCharts,
            handleShowGlobe,
            handleChange,
            handleLatLonChange,
            datasets,
            dataTarget,
            vizPageDataTargetDetails,
            globeUIRef,
            charts
        } = this.props;

        const {
            variableDetailsID,
            showControlPanel,
            dataSearchMenuOpen,
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            selectedVizType
        } = this.state;

        let details = vizPageDataTargetDetails;

        let validations;

        const dataSize = this.estimateDataSize();

        // review these
        let minDateMessage = '';
        let maxDateMessage = '';

        if(details) {
            validations = [
                // this.checkStartDepth(),
                // this.checkEndDepth(),
                // this.checkStartLat(),
                // this.checkEndLat(),
                // this.checkStartLon(),
                // this.checkEndLon(),
                '','','','','','',
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
        } else 
        validations = Array(16).fill('');
        
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
            // startDepthMessage,
            // endDepthMessage,
            // startLatMessage,
            // endLatMessage,
            // startLonMessage,
            // endLonMessage,
            generalPreventMessage,
            // minDateMessage,
            // maxDateMessage,
            // startDateValidMessage,
            // endDateValidMessage
        ];

        const checkDisableVisualize = () => {
            for(let i = 0; i < checkDisableVisualizeList.length; i++){
                if(checkDisableVisualizeList[i]) return checkDisableVisualizeList[i];
            }

            return false;
        }

        const disableVisualizeMessage = checkDisableVisualize();

        const visualizeButtonTooltip = disableVisualizeMessage ? disableVisualizeMessage : generalWarnMessage ? generalWarnMessage : '';

        return (
            <React.Fragment>

                <VariableDetailsDialog variableDetailsID={variableDetailsID} handleSetVariableDetailsID={this.handleSetVariableDetailsID}/>
                    {
                        this.state.showDrawHelp ? 

                        <Typography className={classes.drawHelpText}>
                            Click on the globe to start drawing, and again to finish.
                        </Typography>

                        : ''
                    }
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    // open={showControlPanel}
                    classes={{
                        paper: `${classes.drawerPaper}`,
                    }}
                    open={showControlPanel}
                    anchor="left"
                >
                    {/* <Button
                        fullWidth={true}
                        // startIcon={<Search/>}
                        className={classes.controlPanelItem}
                        style={{borderBottom: '1px solid black'}}
                        startIcon={dataTarget ?
                            <Tooltip title='Show Product Information' placement='top'>
                                <Info 
                                    style={{fontSize: '22px', margin: '0 0 -5px 4px'}}
                                    onClick={(e) => {
                                        this.handleSetVariableDetailsID(dataTarget.ID);
                                        e.stopPropagation();
                                    }}
                                />
                            </Tooltip>  : 
                            <Search style={{fontSize: '22px', margin: '0 0 -6px 4px'}}/>
                        }
                        onClick={() => this.setState({...this.state, dataSearchMenuOpen: true})}
                        classes={{
                            label: classes.controlPanelItemLabel,
                            startIcon: classes.controlPanelItemStartIcon
                        }}
                    >
                        { dataTarget ? (dataTarget.Name || dataTarget.Long_Name) : 'Select a Variable to Begin'}
                    </Button> */}

                    {
                        dataTarget ? 
                            <Grid container style={{borderBottom: '1px solid black'}}>
                                <Grid item xs={10}>
                                    <Button
                                        fullWidth={true}
                                        className={classes.controlPanelItem}                                        
                                        startIcon={<Search style={{fontSize: '22px', margin: '0 0 -6px 4px'}}/>}
                                        onClick={() => this.setState({...this.state, dataSearchMenuOpen: true})}
                                        classes={{
                                            label: classes.controlPanelItemLabel,
                                            startIcon: classes.controlPanelItemStartIcon
                                        }}
                                        disabled={this.state.showDrawHelp}
                                    >
                                        <span style={{color: this.state.showDrawHelp ? 'rgba(0, 0, 0, 0.38)' : 'white'}}>{dataTarget.Long_Name}</span>
                                    </Button>
                                </Grid>

                                <Grid item xs={2} style={{borderLeft: '1px solid black'}}>
                                    <Tooltip title='Show Product Information' placement='top'>
                                        <IconButton 
                                            onClick={(e) => {
                                                this.handleSetVariableDetailsID(dataTarget.ID);
                                                e.stopPropagation();
                                            }}
                                            disabled={this.state.showDrawHelp}
                                        >
                                            <Info style={{fontSize: '26px', marginTop: '3px'}}/>
                                        </IconButton>                                            
                                    </Tooltip>
                                </Grid>
                            </Grid> 
                    
                    :

                    <Button
                        fullWidth={true}
                        className={classes.controlPanelItem}
                        style={{borderBottom: '1px solid black'}}
                        startIcon={<Search style={{fontSize: '22px', margin: '0 0 -6px 4px'}}/>}
                        onClick={() => this.setState({...this.state, dataSearchMenuOpen: true})}
                        classes={{
                            label: classes.controlPanelItemLabel,
                            startIcon: classes.controlPanelItemStartIcon
                        }}
                        disabled={this.state.showDrawHelp}
                    >
                        Select a Variable to Begin
                    </Button>
                    }                    

                    <Collapse in={Boolean(dataTarget && details)} timeout={900}>

                    {
                        dataTarget && details ?

                            <Grid container>
                                {
                                    details.Temporal_Resolution === temporalResolutions.monthlyClimatology ? 
                                    <>
                                        <Grid item xs={6} className={classes.formGridItem}>
                                            <TextField
                                                name='dt1'
                                                className={classes.textField}
                                                id="dt1"
                                                label="Start Month"
                                                type="number"
                                                value={dt1}
                                                // error={Boolean(startDateValidMessage)}
                                                FormHelperTextProps={{className: classes.helperText}}
                                                // helperText={startDateValidMessage}
                                                InputProps={{
                                                    className:classes.dateTimeInput,
                                                    inputProps: {
                                                        min: 1,
                                                        max: 12
                                                    },
                                                }}
                                                InputLabelProps={{className:classes.padLeft}}
                                                onChange={this.handleChangeInputValue}
                                                disabled={this.state.showDrawHelp}
                                            />
                                        </Grid>

                                        <Grid item xs={6} className={classes.formGridItem}>
                                            <TextField
                                                name='dt2'
                                                className={classes.textField}
                                                id="dt2"
                                                label="End Month"
                                                type="number"
                                                min={1}
                                                max={12}
                                                step={1}
                                                // InputLabelProps={{
                                                //     shrink: true,
                                                // }}
                                                value={dt2}
                                                // error={Boolean(startDateValidMessage)}
                                                FormHelperTextProps={{className: classes.helperText}}
                                                // helperText={startDateValidMessage}
                                                InputProps={{
                                                    className:classes.dateTimeInput,
                                                    inputProps: {
                                                        min: 1,
                                                        max: 12,
                                                    }
                                                }}
                                                InputLabelProps={{className:classes.padLeft}}
                                                onChange={this.handleChangeInputValue}
                                                disabled={this.state.showDrawHelp}
                                            />
                                        </Grid>
                                    </>

                                    :

                                    <>
                                        <Grid item xs={6} className={classes.formGridItem}>
                                            <TextField
                                                name='dt1'
                                                className={classes.textField}
                                                id="dt1"
                                                label="Start Date(m/d/y)"
                                                step={1}
                                                type="date"
                                                value={dt1}
                                                error={Boolean(startDateValidMessage)}
                                                FormHelperTextProps={{className: classes.helperText}}
                                                helperText={startDateValidMessage}
                                                InputProps={{
                                                    className:classes.dateTimeInput,
                                                    inputProps: {
                                                        min: details.Time_Min.slice(0,10),
                                                        max: details.Time_Max.slice(0,10)
                                                    }
                                                }}
                                                InputLabelProps={{className:classes.padLeft}}
                                                onChange={this.handleChangeInputValue}
                                                disabled={this.state.showDrawHelp}
                                            />
                                        </Grid>  

                                        <Grid item xs={6} className={classes.formGridItem}>
                                            <TextField
                                                name='dt2'
                                                className={classes.textField}
                                                id="dt2"
                                                label="End Date(m/d/y)"
                                                type="date"
                                                value={dt2}
                                                error={Boolean(endDateValidMessage)}
                                                FormHelperTextProps={{className: classes.helperText}}
                                                helperText={endDateValidMessage}
                                                InputProps={{
                                                    className:classes.dateTimeInput,
                                                    inputProps: {
                                                        min: details.Time_Min.slice(0,10),
                                                        max: details.Time_Max.slice(0,10)
                                                    }
                                                }}
                                                InputLabelProps={{className:classes.padLeft}}
                                                onChange={this.handleChangeInputValue}
                                                disabled={this.state.showDrawHelp}
                                            />
                                        </Grid>
                                    </>

                                }
                                

                                <Grid item xs={6} className={classes.formGridItem}>
                                    <TextField
                                        type='number'
                                        id="lat1-input"
                                        label={"Start Lat(\xB0)"}
                                        className={classes.textField}
                                        value={lat1}
                                        onChange={handleLatLonChange}
                                        error={Boolean(startLatMessage)}
                                        FormHelperTextProps={{className: classes.helperText}}
                                        helperText={startLatMessage}
                                        InputProps={{
                                            className:classes.padLeft,
                                            inputProps: {
                                                min: -90,
                                                max: 90,
                                                step: .001
                                            }
                                        }}
                                        InputLabelProps={{className:classes.padLeft}}
                                        name='lat1'
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
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
                                        InputProps={{
                                            className:classes.padLeft,
                                            inputProps: {
                                                min: -90,
                                                max: 90,
                                                step: .001
                                            }
                                        }}
                                        InputLabelProps={{className:classes.padLeft}}
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
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
                                        InputProps={{
                                            className:classes.padLeft,
                                            inputProps: {
                                                min: -180,
                                                max: 180,
                                                step: .001
                                            }
                                        }}
                                        InputLabelProps={{className:classes.padLeft}}
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
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
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
                                    >
                                    </TextField>
                                    <Paper className={classes.popoutButtonPaper} style={{left: '301px', top: '146px'}}>
                                        <Tooltip title='Draw Region on Globe'>
                                            <IconButton className={classes.popoutButtonBase} onClick={this.handleDrawClick}><Edit className={classes.popoutButtonIcon}/></IconButton>
                                        </Tooltip>
                                    </Paper>
                                </Grid>

                                <Grid item xs={6} className={classes.formGridItem}>
                                    <TextField
                                        id="depth1-input"
                                        error={Boolean(startDepthMessage)}
                                        label="Start Depth(m)"
                                        className={classes.textField}
                                        value={isNaN(Math.floor(depth1 * 1000) / 1000) ? depth1 : Math.ceil(depth1 * 1000) / 1000}
                                        onChange={handleChange}
                                        FormHelperTextProps={{className: classes.helperText}}
                                        helperText={startDepthMessage}
                                        name='depth1'
                                        InputProps={{className:classes.padLeft}}
                                        InputLabelProps={{className:classes.padLeft}}
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
                                    >
                                    </TextField>
                                </Grid>

                                <Grid item xs={6} className={classes.formGridItem}>
                                    <TextField
                                        id="depth2-input"
                                        error={Boolean(endDepthMessage)}
                                        label="End Depth(m)"
                                        className={classes.textField}
                                        value={isNaN(Math.ceil(depth2 * 1000) / 1000) ? depth2 : Math.ceil(depth2 * 1000) / 1000}
                                        onChange={handleChange}
                                        FormHelperTextProps={{className: classes.helperText}}
                                        helperText={endDepthMessage}
                                        name='depth2'
                                        InputProps={{className:classes.padLeft}}
                                        InputLabelProps={{className:classes.padLeft}}
                                        onChange={this.handleChangeInputValue}
                                        disabled={this.state.showDrawHelp}
                                    >
                                    </TextField>
                                </Grid>

                                <ChartControl
                                    overrideDisabledStyle={overrideDisabledStyle}
                                    heatmapMessage={heatmapMessage}
                                    contourMessage={contourMessage}
                                    sectionMapMessage={sectionMapMessage}
                                    histogramMessage={histogramMessage}
                                    timeSeriesMessage={timeSeriesMessage}
                                    depthProfileMessage={depthProfileMessage}
                                    sparseMapMessage={sparseMapMessage}
                                    visualizeButtonTooltip={visualizeButtonTooltip}
                                    disableVisualizeMessage={disableVisualizeMessage}
                                    selectedVizType={selectedVizType}
                                    handleChangeInputValue={this.handleChangeInputValue}
                                    onVisualize={this.handleVisualize}
                                    showChartControl={this.state.showChartControl}
                                    variableDetails={this.props.vizPageDataTargetDetails}
                                    handleVisualize={this.handleVisualize}
                                    disabled={this.state.showDrawHelp}
                                />  

                                {
                                    charts.length ?
                                    
                                    <Paper className={classes.popoutButtonPaper} style={{left: '301px', top: '343px'}}>
                                        <Tooltip title='Open Charts'>
                                            <IconButton disabled={this.state.showDrawHelp} className={classes.popoutButtonBase} onClick={this.handleShowChartsClick}>
                                                <Badge badgeContent={charts.length} color='primary'>
                                                    <ShowChart className={classes.popoutButtonIcon} style={{color:colors.primary}}/>
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                    </Paper>

                                    : ''
                                }                                    
                            </Grid>
                                : ''
                            }
                            </Collapse>

                </Drawer>
                    <Paper className={classes.dataSearchMenuPaper} style={dataSearchMenuOpen ? {} : {display: 'none'}}>
                        <DataSearch
                            handleSelectDataTarget={this.handleSelectDataTarget}
                            handleSetVariableDetailsID={this.handleSetVariableDetailsID}
                            handleCloseDataSearch={this.handleCloseDataSearch}
                        />
                    </Paper>
            </React.Fragment>
        )

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewVizControlPanel));
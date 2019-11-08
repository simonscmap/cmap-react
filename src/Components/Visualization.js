import React, { Component } from 'react';
import { connect } from 'react-redux';

import vizSubTypes from '../Enums/visualizationSubTypes';
import storedProcedures from '../Enums/storedProcedures';

import { withStyles } from '@material-ui/core/styles';

import LoginRequiredPrompt from './LoginRequiredPrompt';
// import VisualizationController from './VisualizationController';
import LoadingSpinner from './LoadingSpinner';
import DataRetrievalForm from './DataRetrievalForm';
import VizControlPanel from './VizControlPanel';

import { showLoginDialog, snackbarOpen } from '../Redux/actions/ui';
import { queryRequestSend, storedProcedureRequestSend, cruiseListRequestSend, triggerShowCharts, completedShowCharts } from '../Redux/actions/visualization';
import { retrievalRequestSend } from '../Redux/actions/catalog';

import states from '../asyncRequestStates';

import { loadModules } from 'esri-loader';

// import {COORDINATE_SYSTEM} from '@deck.gl/core';
// import DeckGL, {GeoJsonLayer, ColumnLayer, GridLayer, PointCloudLayer} from 'deck.gl';
// import {AmbientLight, LightingEffect} from '@deck.gl/core';
// import {HexagonLayer} from '@deck.gl/aggregation-layers';

import Charts from './Charts';
import MapContainer from './MapContainer';
import colors from '../Enums/colors'
import cleanSPParams from '../Utility/cleanSPParams';
import localDateToString from '../Utility/localDateToString';
import utcDateStringToLocal from '../Utility/utcDateStringToLocal';
import TopNavBar from './TopNavBar';
import temporalResolutions from '../Enums/temporalResolutions';
// import subTypes from '../Enums/visualizationSubTypes';

const mapVizType = (vizType) => {
    const mapping = {
        [vizSubTypes.sectionMap]: {
            sp: storedProcedures.sectionMap,
            subType: vizSubTypes.sectionMap
        },
        [vizSubTypes.contourSectionMap]: {
            sp: storedProcedures.sectionMap,
            subType: vizSubTypes.contourSectionMap
        },
        [vizSubTypes.timeSeries]: {
            sp: storedProcedures.timeSeries,
            subType: vizSubTypes.timeSeries
        },
        [vizSubTypes.histogram]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.histogram
        },
        [vizSubTypes.depthProfile]: {
            sp: storedProcedures.depthProfile,
            subType: vizSubTypes.depthProfile
        },
        [vizSubTypes.heatmap]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.heatmap
        },
        [vizSubTypes.contourMap]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.contourMap
        },
        [vizSubTypes.sparse]: {
            sp: storedProcedures.spaceTime,
            subType: vizSubTypes.sparse
        }
    }

    return mapping[vizType];
}

const mapStateToProps = (state, ownProps) => ({
    user: state.user,
    sampleData: state.sampleData,
    queryRequestState: state.queryRequestState,
    maps: state.maps,
    charts: state.charts,
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    loadingMessage: state.loadingMessage,
    cruiseTrajectory: state.cruiseTrajectory,
    cruiseList: state.cruiseList,
    showChartsOnce: state.showChartsOnce
})

const mapDispatchToProps = {
    showLoginDialog,
    queryRequestSend,
    retrievalRequestSend,
    storedProcedureRequestSend,
    snackbarOpen,
    cruiseListRequestSend,
    completedShowCharts
}

const styles = (theme) => ({
    displayNone: {
        display: 'none'
    },

    background: {
        backgroundColor: colors.backgroundGray
    },

    showCharts: {
        display: 'inline-block'
    }
})

class Visualization extends Component {
    globeUIRef = React.createRef();

    state = {
        filteredData: [],
        opacity: 1,
        showCharts: false,
        showUI: false,
        surfaceOnly: false,
        irregularSpatialResolution: false,

        spParams: {
            tableName: '',
            fields: null,
            depth1: 0,
            depth2: 0,
            dt1: new Date(),
            dt2: new Date(),
            lat1: 0,
            lat2: 0,
            lon1: 0,
            lon2: 0,
            selectedVizType: ''
        }
    }
    
    async componentDidMount(){
        if(!this.props.catalog) this.props.retrievalRequestSend();
        if(!this.props.cruiseList) this.props.cruiseListRequestSend();

        const esriModuleNames = [
            'AreaMeasurement3D',
            'Search',
            'GraphicsLayer',
            'SketchViewModel',
            'Utils',
            'Graphic',
        ];

        var loadedModules = await loadModules([
            'esri/widgets/AreaMeasurement3D',
            'esri/widgets/Search',
            'esri/layers/GraphicsLayer',
            'esri/widgets/Sketch/SketchViewModel',
            'esri/geometry/support/webMercatorUtils',
            'esri/Graphic',
        ], {version: 'next'});

        var esriModules = esriModuleNames.reduce((accumulator, currentValue, currentIndex) => {
            accumulator[currentValue] = loadedModules[currentIndex];
            return accumulator;
        }, {});

        this.setState({...this.state, esriModules});
    }

    componentDidUpdate(prevProps){
        if(this.props.showChartsOnce) {
            this.props.completedShowCharts();
            this.setState({...this.state, showCharts: true})
        }
    }

    handleChange = (event) => {
        this.setState({...this.state, spParams: {...this.state.spParams, [event.target.name]: event.target.value}})
    };

    handleLatLonChange = (event) => {
        this.setState({
            ...this.state, 
            spParams: {...this.state.spParams, [event.target.name]: event.target.value},
        })
    }

    handleStartDateChange = (date) => {
        if(date){
            let newDate = new Date();
            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            this.setState({...this.state, spParams: {...this.state.spParams, dt1:newDate}});
        }
    }

    handleEndDateChange = (date) => {
        if(date){
            let newDate = new Date();
            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            this.setState({...this.state, spParams: {...this.state.spParams, dt2:newDate}});
        }
    }

    onVisualize = () => {
        const { depth1, depth2, dt1, dt2, lat1, lat2, lon1, lon2, selectedVizType } = this.state.spParams;

        let mapping = mapVizType(selectedVizType);
        let parameters = cleanSPParams({
            depth1,
            depth2,
            dt1: localDateToString(dt1),
            dt2: localDateToString(dt2),
            lat1,
            lat2,
            lon1,
            lon2,
            fields: this.state.spParams.fields && this.state.spParams.fields.value,
            tableName: this.state.spParams.fields && this.state.spParams.tableName,
            spName: mapping.sp
        });

        let payload = {
            parameters,
            subType: mapping.subType,
            metadata: this.state.spParams.fields && this.state.spParams.fields.data
        }
    
        this.props.storedProcedureRequestSend(payload);
    }

    // Update the "fields" state piece when the variables input changes
    // Field in this case refers to a react-select option, which contains catalog metadata
    updateFields = (fields) => {
        if(fields) {
            let surfaceOnly = !fields.data.Depth_Min;
            let irregularSpatialResolution = fields.data.Spatial_Resolution === 'Irregular';

            let dt1 = fields.data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                this.state.spParams.dt1 : utcDateStringToLocal(fields.data.Time_Min);
            let dt2 = fields.data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                this.state.spParams.dt2 : 
                irregularSpatialResolution ? utcDateStringToLocal(fields.data.Time_Max) :
                utcDateStringToLocal(fields.data.Time_Min);

            let lat1 = irregularSpatialResolution ? fields.data.Lat_Min : this.state.spParams.lat1;
            let lat2 = irregularSpatialResolution ? fields.data.Lat_Max : this.state.spParams.lat2;
            let lon1 = irregularSpatialResolution ? fields.data.Lon_Min : this.state.spParams.lon1;
            let lon2 = irregularSpatialResolution ? fields.data.Lon_Max : this.state.spParams.lon2;
            let depth1 = irregularSpatialResolution ? fields.data.Depth_Min : this.state.spParams.depth1;
            let depth2 = irregularSpatialResolution ? fields.data.Depth_Max : this.state.spParams.depth2;

            if(irregularSpatialResolution){
                this.globeUIRef.current.props.view.goTo({
                    target: [(parseFloat(lon1) + parseFloat(lon2)) / 2, (parseFloat(lat1) + parseFloat(lat2)) / 2],
                    zoom: 3
                }, {
                    maxDuration: 2500,
                    speedFactor: .5
                }); 
            }

            let tableName = fields.data.Table_Name;
            
            this.setState({...this.state,
                surfaceOnly,
                irregularSpatialResolution,
                spParams: {...this.state.spParams, 
                    fields,
                    dt1,
                    dt2,
                    lat1,
                    lat2,
                    lon1,
                    lon2,
                    depth1,
                    depth2,
                    tableName,
                    selectedVizType: ''
                }
            });
        } else {
            this.setState({...this.state, spParams: {...this.state.spParams, fields, tableName: ''}})
        }
    }

    handleShowCharts = () => {
        this.setState({...this.state, showCharts: true})
    }

    handleShowGlobe = () => {
        this.setState({...this.state, showCharts: false})
    }

    toggleShowUI = () => {
        this.setState({...this.state, showUI: !this.state.showUI});
    }

    updateDomainFromGraphicExtent = (extent) => {
        var _lon1 = extent.xmin > -180 ? extent.xmin : extent.xmin + 360;
        var _lon2 = extent.xmax < 180 ? extent.xmax : extent.xmax - 360;

        var newCoordinates = {
            lat1: extent.ymin.toFixed(3),
            lat2: extent.ymax.toFixed(3),
            lon1: _lon1.toFixed(3),
            lon2: _lon2.toFixed(3)
        };

        this.setState({...this.state, spParams: {...this.state.spParams, ...newCoordinates}});
    }

    render(){
        const { classes } = this.props;

        if(!this.props.user) return <LoginRequiredPrompt/>

        return (
            <div>
                <TopNavBar/>
                <DataRetrievalForm 
                    handleChange={this.handleChange}
                    handleLatLonChange={this.handleLatLonChange}
                    handleStartDateChange={this.handleStartDateChange} 
                    handleEndDateChange={this.handleEndDateChange} 
                    showUI={this.state.showUI}
                    onVisualize={this.onVisualize}
                    updateFields={this.updateFields}
                   {...this.state.spParams}
                   surfaceOnly={this.state.surfaceOnly}
                   irregularSpatialResolution={this.state.irregularSpatialResolution}
                />
                <VizControlPanel
                    toggleChartView={this.toggleChartView}
                    toggleShowUI={this.toggleShowUI}
                    showCharts={this.state.showCharts}
                    handleChange={this.handleChange}
                    handleLatLonChange={this.handleLatLonChange}
                    handleStartDateChange={this.handleStartDateChange} 
                    handleEndDateChange={this.handleEndDateChange} 
                    showUI={this.state.showUI}
                    onVisualize={this.onVisualize}
                    updateFields={this.updateFields}
                    {...this.state.spParams}
                    surfaceOnly={this.state.surfaceOnly}
                    irregularSpatialResolution={this.state.irregularSpatialResolution}
                    showCharts={this.state.showCharts}
                    handleShowCharts={this.handleShowCharts}
                    handleShowGlobe={this.handleShowGlobe}
                />
                { this.state.esriModules &&
                    <div className={`${this.state.showCharts ? classes.displayNone : ''}`}>
                        <MapContainer
                            globeUIRef={this.globeUIRef}
                            updateDomainFromGraphicExtent={this.updateDomainFromGraphicExtent}
                            esriModules={this.state.esriModules}
                            spParams={this.state.spParams}
                            cruiseTrajectory={this.props.cruiseTrajectory}
                        />
                    </div>
                }

                <div className={this.state.showCharts ? classes.showCharts : classes.displayNone}>
                    <Charts/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Visualization));
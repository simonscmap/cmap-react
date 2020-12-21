import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import vizSubTypes from '../../Enums/visualizationSubTypes';
import storedProcedures from '../../Enums/storedProcedures';

import { withStyles } from '@material-ui/core/styles';

import LoginRequiredPrompt from '../User/LoginRequiredPrompt';
// import VisualizationController from './VisualizationController';
import VizControlPanel from './VizControlPanel';
import NewVizControlPanel from './NewVizControlPanel';

import { showLoginDialog, snackbarOpen } from '../../Redux/actions/ui';
import { queryRequestSend, storedProcedureRequestSend, cruiseListRequestSend, completedShowCharts } from '../../Redux/actions/visualization';
import { retrievalRequestSend, datasetRetrievalRequestSend } from '../../Redux/actions/catalog';

import { loadModules } from 'esri-loader';

import depthUtils from '../../Utility/depthCounter';

import Charts from './Charts';
import MapContainer from './MapContainer';
import colors from '../../Enums/colors'
import cleanSPParams from '../../Utility/cleanSPParams';
import localDateToString from '../../Utility/localDateToString';
import utcDateStringToLocal from '../../Utility/utcDateStringToLocal';
import temporalResolutions from '../../Enums/temporalResolutions';
import stars from '../../Utility/starsBase64';
import metaTags from '../../Enums/metaTags';
import ModuleSelector from './ModuleSelector';

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
    showChartsOnce: state.showChartsOnce,
    datasets: state.datasets,
    catalog: state.catalog
})

const mapDispatchToProps = {
    showLoginDialog,
    queryRequestSend,
    retrievalRequestSend,
    storedProcedureRequestSend,
    snackbarOpen,
    cruiseListRequestSend,
    completedShowCharts,
    datasetRetrievalRequestSend
}

const styles = (theme) => ({
    displayNone: {
        display: 'none'
    },

    background: {
        backgroundColor: colors.backgroundGray
    },

    showCharts: {
        display: 'inline-block',
        paddingTop: theme.spacing(6)
        // width: '90%'
    },

    vizWrapper: {
        minHeight: '100vh',
        // overflow: 'hidden',
        // width: '100vw',
        background: `url(${stars})`
    }
})

const baseSPParams = {
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

class Visualization extends Component {
    globeUIRef = React.createRef();

    state = {
        filteredData: [],
        opacity: 1,
        showCharts: false,
        showUI: false,
        surfaceOnly: false,
        irregularSpatialResolution: false,
        showCruiseControl: false,

        spParams: baseSPParams
    }
    
    async componentDidMount(){
        document.title = metaTags.visualization.title;
        document.description = metaTags.visualization.description;
        
        // if(!this.props.catalog) this.props.retrievalRequestSend();
        // if(!this.props.cruiseList) this.props.cruiseListRequestSend();
        // if(!this.props.datasets) this.props.datasetRetrievalRequestSend();

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
        ], {version: '4.14'});

        var esriModules = esriModuleNames.reduce((accumulator, currentValue, currentIndex) => {
            accumulator[currentValue] = loadedModules[currentIndex];
            return accumulator;
        }, {});

        this.setState({...this.state, esriModules});        
    }

    componentWillUnmount = () => {
        document.title = metaTags.default.title;
        document.description = metaTags.default.description;
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

            let sparseMaxDate = utcDateStringToLocal(fields.data.Time_Max);
            sparseMaxDate.setDate(sparseMaxDate.getDate() + 1);

            let dt1 = fields.data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                this.state.spParams.dt1 : utcDateStringToLocal(fields.data.Time_Min);
            let dt2 = fields.data.Temporal_Resolution === temporalResolutions.monthlyClimatology ?
                this.state.spParams.dt2 : 
                irregularSpatialResolution ? sparseMaxDate :
                utcDateStringToLocal(fields.data.Time_Min);
            
            let latMin = Math.floor(fields.data.Lat_Min * 1000) /1000;
            let latMax = Math.ceil(fields.data.Lat_Max * 1000) /1000;
            let lonMin = Math.floor(fields.data.Lon_Min * 1000) /1000;
            let lonMax = Math.ceil(fields.data.Lon_Max * 1000) /1000;

            let lat1 = irregularSpatialResolution ? latMin : this.state.spParams.lat1;
            let lat2 = irregularSpatialResolution ? latMax : this.state.spParams.lat2;
            let lon1 = irregularSpatialResolution ? lonMin : this.state.spParams.lon1;
            let lon2 = irregularSpatialResolution ? lonMax : this.state.spParams.lon2;
            let depth1 = irregularSpatialResolution ? fields.data.Depth_Min || 0 : 
                depthUtils.piscesTable.has(fields.data.Table_Name) ? 0 :
                depthUtils.darwinTable.has(fields.data.Table_Name) ? 0 : 
                this.state.spParams.depth1;

            let depth2 = irregularSpatialResolution ? fields.data.Depth_Max || 0 : 
                depthUtils.piscesTable.has(fields.data.Table_Name) ? ((depthUtils.piscesDepths[0] + depthUtils.piscesDepths[1]) / 2).toFixed(2) :
                depthUtils.darwinTable.has(fields.data.Table_Name) ? ((depthUtils.darwinDepths[0] + depthUtils.darwinDepths[1]) / 2) : 
                this.state.spParams.depth2;

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

    updateParametersFromCruiseBoundary = (cruise) => {
        if(cruise && this.state.spParams.fields){
            this.props.snackbarOpen('Setting chart parameters to cruise boundaries.');
            let lat1 = Math.floor(cruise.data.Lat_Min * 1000) / 1000;
            let lat2 = Math.ceil(cruise.data.Lat_Max * 1000) / 1000;
            let lon1 = Math.floor(cruise.data.Lon_Min * 1000) / 1000;
            let lon2 = Math.ceil(cruise.data.Lon_Max * 1000) / 1000;

            this.setState({...this.state,
                spParams: {...this.state.spParams,
                    lat1,
                    lat2,
                    lon1,
                    lon2,
                    dt1: utcDateStringToLocal(cruise.data.Start_Time),
                    dt2: utcDateStringToLocal(cruise.data.End_Time)
                }
            })
        }
    }

    handleShowCharts = () => {
        this.setState({...this.state, showCharts: true})
    }

    handleShowGlobe = () => {
        this.setState({...this.state, showCharts: false})
    }

    handleShowCruiseControl = () => {
        this.setState({...this.state, showCruiseControl: !this.state.showCruiseControl});
    }

    toggleShowUI = () => {
        this.setState({...this.state, showUI: !this.state.showUI});
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

        this.setState({...this.state, spParams: {...this.state.spParams, ...newCoordinates}});
    }

    resetSPParams = () => {
        this.setState({...this.state, spParams: baseSPParams})
    }

    render(){
        const { classes } = this.props;

        if(!this.props.user) return <LoginRequiredPrompt/>

        return (
            <div className={classes.vizWrapper}>

                {/* <VizControlPanel
                    toggleChartView={this.toggleChartView}
                    toggleShowUI={this.toggleShowUI}
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
                    resetSPParams={this.resetSPParams}
                    handleShowCruiseControl={this.handleShowCruiseControl}
                    showCruiseControl={this.state.showCruiseControl}
                /> */}

                { this.state.esriModules &&
                    <div className={`${this.state.showCharts ? classes.displayNone : ''}`}>
                        <MapContainer
                            globeUIRef={this.globeUIRef}
                            updateDomainFromGraphicExtent={this.updateDomainFromGraphicExtent}
                            updateParametersFromCruiseBoundary={this.updateParametersFromCruiseBoundary}
                            esriModules={this.state.esriModules}
                            spParams={this.state.spParams}
                            cruiseTrajectory={this.props.cruiseTrajectory}
                            showCruiseControl={this.state.showCruiseControl}
                        />
                    </div>
                }

                <Switch>          
                    <Route exact path='/visualization' component={ModuleSelector} />
                    <Route path='/visualization/charts' component={NewVizControlPanel}
                            // <NewVizControlPanel
                            toggleChartView={this.toggleChartView}
                            toggleShowUI={this.toggleShowUI}
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
                            resetSPParams={this.resetSPParams}
                            handleShowCruiseControl={this.handleShowCruiseControl}
                            showCruiseControl={this.state.showCruiseControl}
                    //     />
                    // }
                    />
                    <Route path='/visualization/cruises' component={''}/>
                </Switch>              

                <div className={this.state.showCharts ? classes.showCharts : classes.displayNone}>
                    <Charts/>
                </div>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Visualization));
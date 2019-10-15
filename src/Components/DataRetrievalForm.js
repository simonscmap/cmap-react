import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';
import { FixedSizeList as ReactWindowList } from "react-window";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MUISelect from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Tooltip from '@material-ui/core/Tooltip';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { ArrowDropDown, LibraryBooks } from '@material-ui/icons';
import { Typography } from '@material-ui/core';

import vizSubTypes from '../Enums/visualizationSubTypes';
import states from '../asyncRequestStates';
import colors from '../Enums/colors';
import validation from '../Enums/validation';
import TableStatsDialog from './TableStatsDialog';
import mapTemporalResolutionToNumber from '../Utility/mapTemporalResolutionToNumber';
import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import spatialResolutions from '../Enums/spatialResolutions';

import { cruiseTrajectoryRequestSend } from '../Redux/actions/visualization';


const styles = (theme) => ({
    dataRetrievalFormPaper: {
        width: '1000px',
        height: '260px',
        padding: theme.spacing(2.5),
        position:'fixed',
        top: '10px',
        left: '50%',
        marginLeft: '-600px',
        zIndex: 2,
        paddingTop: theme.spacing(1.5),
    },

    dataRetrievalFormField: {
        padding:`0px ${theme.spacing(1)}`
    },

    retrieveDataButton: {
        margin:'10px auto'
    },

    variableSelect: {
        margin: '0 30px 20px 30px'
    },

    visualizationSpeedDial: {
        position: 'relative',
        top: '5px',
        left: '30px'
    },

    visualizeButton: {
        borderRadius:'10%',
        width: '100px',
        height:'40px',
        margin: 'auto 0',
        backgroundColor: theme.palette
    },

    visualizeButtonText: {
        dominantBaseline: "middle",
        textAnchor: "middle"
    },

    displayNone: {
        display: 'none'
    },

    datePickerGridSection: {
        paddingLeft: '40px !important',
        paddingRight: '40px !important'
    },

    shortenHeight: {
        height: '60px'
    },

    vizSelect: {
        minWidth: 120
    },

    gridItem: {
        height: '48px'
    },

    generalMessage: {
        textAlign: 'left'
    },

    vizTypeSelectFormControl: {
        width: 150
    }
})

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
    cruiseTrajectory: state.cruiseTrajectory
})

const mapDispatchToProps = {
    cruiseTrajectoryRequestSend
}

// Replace react-select menulist with react-window (virtualized) fixed size list
const height = 35;
const reactWindowListRef = React.createRef();
class MenuList extends Component {

    componentDidUpdate = (prevProps, prevState) => {
        if(!(this.props.children && this.props.children.length)) return;
        let index = this.props.children.findIndex(child => child.props && child.props.isFocused);
        reactWindowListRef.current.scrollToItem(index);
    }

    render() {
        const { options, children, maxHeight, getValue } = this.props;
        const [value] = getValue();
        const initialOffset = options.indexOf(value) * height;
        
        return (
            <ReactWindowList
                style={{backgroundColor: colors.backgroundGray}}
                height={(options.length === 0 ? 35 : maxHeight > height * options.length ? height * options.length : maxHeight) || 35}
                itemCount={children.length}
                itemSize={height}
                initialScrollOffset={initialOffset || 0}
                ref={reactWindowListRef}
            >
                {({ index, style }) => <div style={style}>{children[index]}</div>}
            </ReactWindowList>
        );
    }
}

// Replace react-select dropdown area with material version
const DropdownIndicator = (props) => {
    return (
      <components.DropdownIndicator {...props}>
        <ArrowDropDown />
      </components.DropdownIndicator>
    );
  };

// Replace react-select selected option
const SingleValue = (props) => {
    return (
        <components.SingleValue {...props} className={props.className + ' fa-icon-cmap'}/>
    )
}

// Replace react-select option
const Option = (props) => {
    return (
        <components.Option {...props} className={props.className + ' fa-icon-cmap'}/>
    )
}

class DataRetrievalForm extends Component {
    constructor(props){
        super(props);

        var search = new JsSearch.Search('Variable');
        search.searchIndex = new JsSearch.UnorderedSearchIndex();
        search.addIndex('Variable');
        search.addIndex('Make');
        search.addIndex('Sensor');
        search.addIndex('Data_Source');
        search.addIndex('Process_Level');
        search.addIndex('Long_Name');
        search.addIndex('Keywords');
        if(props.catalog) search.addDocuments(props.catalog);

        this.state = {
            visualizationSpeedDialOpen: false,
            tableStatsDialogIsOpen: false,
            search,
            searchField: ''
        }
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.catalog && prevProps.catalog.length) && (this.props.catalog && this.props.catalog.length)){
            this.state.search.addDocuments(this.props.catalog);
            this.setState({search: this.state.search})
        }
    }

    handleTableStatsDialogClose = () => {
        this.setState({...this.state, tableStatsDialogIsOpen: false})
    }

    handleTableStatsDialogOpen = () => {
        this.setState({...this.state, tableStatsDialogIsOpen: true});
    }

    handleVisualizationSpeedDialClose = () => {
        this.setState({visualizationSpeedDialOpen: false});
    }

    handleVisualizationSpeedDialOpen = () => {
        this.setState({visualizationSpeedDialOpen: true});
    }

    handleVisualizationSpeedDialClick = () => {
        this.setState({visualizationSpeedDialOpen: !this.state.visualizationSpeedDialOpen});
    }

    getSelectOptionsFromCatalogItems = (items) => {
        return items.map(item => ({
            value: item.Variable,
            label: item.Variable === item.Long_Name ? (item.Variable.length > 48 ? item.Variable.slice(0,45) + '...' : item.Variable) : (item.Variable.length > 23 ? item.Variable.slice(0,23) : item.Variable) + ' : ' + (item.Long_Name.length > 38 ? item.Long_Name.slice(0,35) + '...' : item.Long_Name),
            data: item
        })) || []
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') this.setState({...this.state, searchField: searchString});
        if(action.action ==='set-value' || action.action === 'menu-close') this.setState({...this.state, searchField: ''});
    }

    estimateDataSize = () => {
        const { dt1, dt2, lat1, lat2, lon1, lon2, fields, selectedVizType } = this.props;
        if(!fields) return 0;
        if(fields.data.Spatial_Resolution === spatialResolutions.irregular) return 0;
        if(selectedVizType === vizSubTypes.timeSeries || selectedVizType === vizSubTypes.depthProfile) return 0;

        const date1 = Date.parse(dt1);
        const date2 = Date.parse(dt2);
        const res = mapSpatialResolutionToNumber(fields.data.Spatial_Resolution);

        const dayDiff = (date2 - date1) / 86400000;

        const dateCount = Math.floor(dayDiff / mapTemporalResolutionToNumber(fields.data.Temporal_Resolution)) || 1;
        const latCount = (lat2 - lat1) / res;
        const lonCount = (lon2 - lon1) / res;

        const pointCount = lonCount * latCount * dateCount;
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

    checkStartDate = () => {
        if(this.props.dt1 < this.props.dt2) return validation.date.dateOneIsLater;
        if(this.props.dt1 > this.props.fields.data.Time_Max) return validation.date.dateOneOutOfBounds.replace('$', this.props.fields.data.Time_Max);
        return '';
    }

    checkEndDate = () => {
        if(this.props.dt1 < this.props.dt2) return validation.date.dateOneIsLater;
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
        if(parseFloat(this.props.lat1) > parseFloat(this.props.lat2)) return validation.lat.latOneIsHigher;
        if(parseFloat(this.props.lat2) < parseFloat(this.props.fields.data.Lat_Min)) return validation.lat.latTwoOutOfBounds.replace('$', this.props.fields.data.Lat_Max);
        return '';
    }

    checkStartLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon1)) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) < -180 || parseFloat(this.props.lon1) > 180) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) > parseFloat(this.props.lon2)) return validation.lon.lonOneIsHigher;
        if(parseFloat(this.props.lon1) > parseFloat(this.props.fields.data.Lon_Max)) return validation.lon.lonOneOutOfBounds.replace('$', this.props.fields.data.Lon_Max);
        return '';
    }

    checkEndLon = () => {
        if(!/^[-+]?[0-9]*\.?[0-9]+$/.test(this.props.lon2)) return validation.generic.invalid;
        if(parseFloat(this.props.lon2) < -180 || parseFloat(this.props.lon2) > 180) return validation.generic.invalid;
        if(parseFloat(this.props.lon1) > parseFloat(this.props.lon2)) return validation.lon.lonOneIsHigher;
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
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Histogram');
        return '';
    }

    checkTimeSeries = () => {
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Time Series');
        if(this.props.dt1 === this.props.dt2) return validation.type.dateRangeRequired.replace('$', 'Time Series');
        return '';
    }

    checkDepthProfile = () => {
        if(this.props.surfaceOnly) return validation.type.surfaceOnlyDataset.replace('$', this.props.fields.value);
        if(this.props.irregularSpatialResolution) return validation.type.dataIsIrregular.replace('$', 'Depth Profile');
        if(this.props.depth1 === this.props.depth2) return validation.type.depthRangeRequired.replace('$', 'Depth Profile');
        return '';
    }

    checkSparseMap = () => {
        if(!this.props.irregularSpatialResolution) return validation.type.irregularOnly;
        return '';
    }

    checkGeneralWarn = () => {
        if(this.estimateDataSize() > 1200000) return validation.generic.dataSizeWarning;
        return ''
    }

    checkGeneralPrevent = () => {
        if(this.estimateDataSize() > 50000000) return validation.generic.dataSizePrevent;
        return ''
    }
    
    render() {      
        const { search, searchField } = this.state;
        
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
            catalog,
            catalogRequestState,
            surfaceOnly
        } = this.props;

        const options = searchField && catalog ? this.getSelectOptionsFromCatalogItems(search.search(searchField)) 
            : catalog ? this.getSelectOptionsFromCatalogItems(catalog) 
            : []

        let validations;

        if(fields) {
            validations = [
                this.checkStartDepth(),
                this.checkEndDepth(),
                this.checkStartDate(),
                this.checkEndDate(),
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
                this.checkGeneralWarn(),
                this.checkGeneralPrevent()
            ];
        } else validations = Array(17).fill('');

        const [
            startDepthMessage,
            endDepthMessage,
            startDateMessage,
            endDateMessage,
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
            generalPreventMessage
        ] = validations;

        const parametersAreInvalid = [
            startDepthMessage,
            endDepthMessage,
            startLatMessage,
            endLatMessage,
            startLonMessage,
            endLonMessage,
            generalPreventMessage
        ].some(message => message.length);

        return (
            <div className={this.props.showUI ? '' : classes.displayNone} id='drf'>
                <TableStatsDialog
                    open={this.state.tableStatsDialogIsOpen}
                    onClose={this.handleTableStatsDialogClose}
                    data={fields && fields.data}
                />
                <Paper className={classes.dataRetrievalFormPaper}>
                    <Grid container spacing={2}>
                        <Grid item xs={11} className={classes.shortenHeight}>
                            <Select
                                isLoading = {catalogRequestState === states.inProgress}
                                components={{
                                    IndicatorSeparator:'',
                                    DropdownIndicator,
                                    Option,
                                    MenuList,
                                    SingleValue,
                                }}
                                isClearable
                                onInputChange={this.onAutoSuggestChange}
                                filterOption={null}
                                className={classes.variableSelect}
                                autoFocus
                                escapeClearsValue
                                name="fields"
                                label="Variables"
                                options={options}
                                onChange={this.props.updateFields}
                                value={fields}
                                placeholder="Variable Search"
                                styles={{
                                    menu: provided => ({ ...provided, zIndex: 9999 }),

                                    input: provided => ({...provided,
                                        color: 'white',
                                        fontFamily: '"Lato", sans-serif'
                                    }),

                                    control: provided => ({...provided,
                                        backgroundColor: '#424242',
                                        border: '1px solid #333333',
                                        '&:hover': { borderColor: 'white' },
                                        '&:focus-within': { borderColor: colors.orange },
                                    }),

                                    placeholder: provided => ({...provided,
                                        fontFamily: '"Lato", sans-serif',
                                        color: colors.orange,
                                        fontSize: '14px'
                                    }),

                                    noOptionsMessage: provided => ({...provided,
                                        fontFamily: '"Lato", sans-serif',
                                        color: colors.orange,
                                        backgroundColor: colors.backgroundGray
                                    }),

                                    option: (provided, { data, isFocused }) => {
                                        return ({...provided,
                                        backgroundColor: isFocused ? '#383838' : '#424242',
                                        color: data.data.Sensor === 'Satellite' ? '#1acf02' : data.data.Sensor === 'Blend' ? '#fce803' : '#009fd4',
                                        '&:hover': { backgroundColor: '#383838' },
                                        ':active': { backgroundColor: '#383838' },
                                        '&:after': { 
                                            content: data.data.Sensor === 'Satellite' ? "'\f7bf'" : data.data.Sensor === 'Blend' ? "'\f109'" : "'\f21a'",
                                            float: 'left'
                                        },
                                    })},

                                    singleValue: (provided, state) => ({...provided,
                                        fontFamily: state.data.data.Sensor === 'Satellite' ? 'Font Awesome 5 Free': '"Lato", sans-serif',
                                        color: state.data.data.Sensor === 'Satellite' ? '#1acf02' : state.data.data.Sensor === 'Blend' ? '#fce803' : '#009fd4',
                                        paddingRight: '20px',
                                        '&:after': { 
                                            content: state.data.data.Sensor === 'Satellite' ? "'\f7bf'" : state.data.data.Sensor === 'Blend' ? "'\f109'" : "'\f21a'",
                                            fontSize: '18px',
                                            position: 'relative',
                                            left: '8px',
                                            top: '3px'
                                        }
                                    })
                                }}
                                theme={theme => ({
                                    ...theme,
                                    colors: {
                                    ...theme.colors,
                                    // Background color of hovered options
                                    primary25: '#e0e0e0',
                                    primary: '#212121',
                                    },
                                })}
                            />
                        </Grid>
                        
                        <Grid item xs={1}>
                            <IconButton
                                disabled={!fields}
                                onClick={this.handleTableStatsDialogOpen}
                            >
                                <LibraryBooks/>
                            </IconButton>
                        </Grid>
                        
                            <Grid item xs={3} className={classes.datePickerGridSection}>
                                <KeyboardDatePicker
                                    placeholder='yyyy-MM-dd'
                                    id="startDate"
                                    label="Start Date"
                                    name="dt1"
                                    format='yyyy-MM-dd'
                                    minDate={fields ? fields.data.Time_Min : ''}
                                    maxDate={fields ? fields.data.Time_Max : ''}
                                    autoOk
                                    value={dt1}
                                    onChange={this.props.handleStartDateChange}
                                    inputVariant='outlined'
                                    variant='inline'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>  
                            <Grid item xs={3} className={classes.datePickerGridSection}>
                                <KeyboardDatePicker
                                    placeholder='yyyy-MM-dd'
                                    id="endDate"
                                    label="End Date"
                                    name="dt2"
                                    format='yyyy-MM-dd'
                                    minDate={fields ? fields.data.Time_Min : ''}
                                    maxDate={fields ? fields.data.Time_Max : ''}
                                    autoOk
                                    value={dt2}
                                    onChange={this.props.handleEndDateChange}
                                    inputVariant='outlined'
                                    variant='inline'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(startDepthMessage)} 
                                    disabled={!fields || surfaceOnly}
                                >
                                    <InputLabel htmlFor="depth1-input" >Start Depth(m)</InputLabel>
                                    <OutlinedInput
                                        id="depth1-input"
                                        value={depth1}
                                        onChange={this.props.handleChange}
                                        aria-describedby="depth1-error"
                                        labelWidth={105}
                                        name='depth1'
                                    />
                                    <FormHelperText id="depth1-error">{startDepthMessage}</FormHelperText>
                                </FormControl>
                            </Grid>  

                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(endDepthMessage)} 
                                    disabled={!fields || surfaceOnly}
                                >
                                    <InputLabel shrink htmlFor="depth2-input" >End Depth(m)</InputLabel>
                                    <OutlinedInput
                                        id="depth2-input"
                                        value={depth2}
                                        onChange={this.props.handleChange}
                                        aria-describedby="depth2-error"
                                        labelWidth={95}
                                        name='depth2'
                                    />
                                    <FormHelperText id="depth2-error">{endDepthMessage}</FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(startLatMessage)} 
                                >
                                    <InputLabel shrink htmlFor="lat1-input" >{'Start Lat(\xB0)'}</InputLabel>
                                    <OutlinedInput
                                        id="lat1-input"
                                        value={lat1}
                                        onChange={this.props.handleLatLonChange}
                                        aria-describedby="lat1-error"
                                        labelWidth={80}
                                        name='lat1'
                                    />
                                    <FormHelperText id="lat1-error">{startLatMessage}</FormHelperText>
                                </FormControl>
                            </Grid>  

                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(endLatMessage)} 
                                >
                                    <InputLabel shrink htmlFor="lat2-input" >{'End Lat(\xB0)'}</InputLabel>
                                    <OutlinedInput
                                        id="lat2-input"
                                        value={lat2}
                                        onChange={this.props.handleLatLonChange}
                                        aria-describedby="lat2-error"
                                        labelWidth={75}
                                        name='lat2'
                                    />
                                    <FormHelperText id="lat2-error">{endLatMessage}</FormHelperText>
                                </FormControl>
                            </Grid> 

                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(startLonMessage)} 
                                >
                                    <InputLabel shrink htmlFor="lon1-input" >{'Start Lon(\xB0)'}</InputLabel>
                                    <OutlinedInput
                                        id="lon1-input"
                                        value={lon1}
                                        onChange={this.props.handleLatLonChange}
                                        aria-describedby="lon1-error"
                                        labelWidth={80}
                                        name='lon1'
                                    />
                                    <FormHelperText id="lon1-error">{startLonMessage}</FormHelperText>
                                </FormControl>
                            </Grid>  

                            <Grid item xs={3}>
                                <FormControl variant='outlined'
                                    error={Boolean(endLonMessage)} 
                                >
                                    <InputLabel shrink htmlFor="lon2-input" >{'End Lon(\xB0)'}</InputLabel>
                                    <OutlinedInput
                                        id="lon2-input"
                                        value={lon2}
                                        onChange={this.props.handleLatLonChange}
                                        aria-describedby="lon2-error"
                                        labelWidth={75}
                                        name='lon2'
                                    />
                                    <FormHelperText id="lon2-error">{endLonMessage}</FormHelperText>
                                </FormControl>
                            </Grid> 

                            <Grid item xs={2}>
                                <FormControl variant='outlined' className={classes.vizTypeSelectFormControl}>
                                    <InputLabel shrink htmlFor="vizSelector" >Type</InputLabel>
                                    <MUISelect
                                        labelWidth={35}
                                        value={selectedVizType}
                                        variant='outlined'
                                        onChange={this.props.handleChange}
                                        inputProps={{
                                            name: 'selectedVizType',
                                            id: 'vizSelector',
                                            variant: 'outlined'
                                        }}
                                        >
                                        <MenuItem disabled={Boolean(heatmapMessage)} value={vizSubTypes.heatmap} title={heatmapMessage}>Heatmap</MenuItem>
                                        <MenuItem disabled={Boolean(contourMessage)} value={vizSubTypes.contourMap}>Contour</MenuItem>
                                        <MenuItem disabled={Boolean(sectionMapMessage)} value={vizSubTypes.sectionMap}>Section Map</MenuItem>
                                        <MenuItem disabled={Boolean(histogramMessage)} value={vizSubTypes.histogram}>Histogram</MenuItem>                                    
                                        <MenuItem disabled={Boolean(timeSeriesMessage)} value={vizSubTypes.timeSeries}>Time Series</MenuItem>
                                        <MenuItem disabled={Boolean(depthProfileMessage)} value={vizSubTypes.depthProfile}>Depth Profile</MenuItem>
                                        <MenuItem disabled={Boolean(sparseMapMessage)} value={vizSubTypes.sparse}>Sparse Map</MenuItem>
                                    </MUISelect>
                                </FormControl>
                            </Grid>

                            <Grid item xs={2}>
                                <Button
                                    variant='contained'
                                    color='secondary'
                                    onClick={() => this.props.onVisualize()}
                                    disabled={!selectedVizType || parametersAreInvalid || !fields}
                                >
                                    Visualize
                                </Button>
                            </Grid>

                            <Grid item xs={3}>
                                <Typography variant='caption' color='error' className={classes.generalMessage}>
                                    {generalPreventMessage || generalWarnMessage}
                                </Typography>
                            </Grid>
                        </Grid>
                </Paper>
            </div>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataRetrievalForm));
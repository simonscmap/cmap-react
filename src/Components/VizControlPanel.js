import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';
import { FixedSizeList as ReactWindowList } from "react-window";

import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MUISelect from '@material-ui/core/Select';
import Drawer from '@material-ui/core/Drawer';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { LibraryBooks, ArrowRight, ChevronLeft, ChevronRight, InsertChartOutlined, Language, Delete } from '@material-ui/icons';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import vizSubTypes from '../Enums/visualizationSubTypes';
import states from '../asyncRequestStates';
import colors from '../Enums/colors';
import validation from '../Enums/validation';
import TableStatsDialog from './TableStatsDialog';
import mapTemporalResolutionToNumber from '../Utility/mapTemporalResolutionToNumber';
import mapSpatialResolutionToNumber from '../Utility/mapSpatialResolutionToNumber';
import spatialResolutions from '../Enums/spatialResolutions';

import { cruiseTrajectoryRequestSend, clearCharts } from '../Redux/actions/visualization';

const navDrawerWidth = 230;

const styles = theme => ({
  drawer: {
    width: navDrawerWidth,
    // height: 'calc(100% - 120px)',
    top: 32,
    overflow: 'visible'
  },

  drawerPaper: {
    width: navDrawerWidth,
    height: '540px',
    top: 'calc(50% - 270px)',
    borderRadius: '0 4px 4px 0',
    boxShadow: '2px 2px  2px 2px #242424',
    border: 'none',
    overflow: 'visible'
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
      borderRadius: 0
  },

  controlPanelForm: {
      marginTop: theme.spacing(1)
  },

  tableStatsButton: {
      borderRadius: 0,
      paddingTop: '11px',
      backgroundColor: '#3C3C3C'
  },

    formGridItem: {
        borderLeft: '1px solid #313131',
        backgroundColor: '#3C3C3C'
    },

  vizTypeSelectFormControl: {
      width: '100%'
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
      backgroundColor: '#3C3C3C',
      color: theme.palette.primary.main,
      fontVariant: 'normal',
      '&:hover': {backgroundColor: '#874400'}
  },

  datePickerInputAdornment: {
      padding: 0
  },

  clearChartsButton: {
      borderRadius: 0
  }

});

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
    cruiseTrajectory: state.cruiseTrajectory
})

const mapDispatchToProps = {
    cruiseTrajectoryRequestSend,
    clearCharts
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
                height={(options.length == 0 ? 35 : maxHeight > height * options.length ? height * options.length : maxHeight) || 35}
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
        <ArrowRight/>
    </components.DropdownIndicator>
    );
};

// Replace react-select selected option
const SingleValue = (props) => {
    return (
        <components.SingleValue {...props} className={props.className + ' fa-icon-cmap'}></components.SingleValue>
    )
}

// Replace react-select option
const Option = (props) => {
    return (
        <components.Option {...props} className={props.className + ' fa-icon-cmap'}/>
    )
}

const formatOptionLabel = (option, meta) => {
    return meta.context === 'value' ? option.value : option.label;
}

class VizControlPanel extends React.Component {

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
            tableStatsDialogIsOpen: false,
            search,
            searchField: '',
            showControlPanel: true
        }
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.catalog && prevProps.catalog.length) && (this.props.catalog && this.props.catalog.length)){
            this.state.search.addDocuments(this.props.catalog);
            this.setState({search: this.state.search})
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
        const { search, searchField, showControlPanel } = this.state;
        
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
            surfaceOnly,
            showCharts,
            handleShowCharts,
            handleShowGlobe,
            handleChange,
            handleLatLonChange
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
            <div>
                <TableStatsDialog
                    open={this.state.tableStatsDialogIsOpen}
                    onClose={this.handleTableStatsDialogClose}
                    data={fields && fields.data}
                />

                { showControlPanel ? 

                        <IconButton 
                            className={classes.closePanelChevron} 
                            aria-label="toggle-panel" 
                            color="primary" 
                            onClick={this.handleCloseControlPanel}>
                            <ChevronLeft />
                        </IconButton>
                :
                    
                        <IconButton 
                            className={classes.openPanelChevron} 
                            aria-label="toggle-panel" 
                            color="primary" 
                            onClick={this.handleOpenControlPanel}>
                            <ChevronRight />
                        </IconButton>
                }

                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    open={showControlPanel}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="left"
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
                                onClick={handleShowCharts}
                                color='inherit'
                            >
                                <InsertChartOutlined/>
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Tooltip title='Clear Visualizations' placement='right'>
                        <IconButton color='inherit' onClick={this.props.clearCharts} className={classes.clearChartsButton}>
                            <Delete/>
                        </IconButton>
                    </Tooltip>

                    <form>
                        <Grid container>
                            <Grid item xs={10}>
                                <Select
                                    formatOptionLabel={formatOptionLabel}
                                    handleTableStatsDialogOpen={this.handleTableStatsDialogOpen}
                                    isLoading = {catalogRequestState === states.inProgress}
                                    components={{
                                        IndicatorSeparator:'',
                                        DropdownIndicator,
                                        Option,
                                        MenuList,
                                        SingleValue,
                                    }}
                                    onInputChange={this.onAutoSuggestChange}
                                    filterOption={null}
                                    className={classes.variableSelect}
                                    escapeClearsValue
                                    name="fields"
                                    label="Variables"
                                    options={options}
                                    onChange={this.props.updateFields}
                                    value={fields}
                                    placeholder="Variable Search"
                                    styles={{
                                        menu: provided => ({
                                            ...provided, 
                                            zIndex: 1300, 
                                            top: '-8px',
                                            left: '230px',
                                            width: '580px',
                                            borderRadius: '4px',
                                            boxShadow: '2px 2px  2px 2px #242424',
                                            overflow: 'hidden'                                
                                        }),

                                        valueContainer: provided => ({
                                            ...provided,
                                            padding: '0 0 0 6px',
                                            fontWeight: 100
                                        }),

                                        input: provided => ({...provided,
                                            color: 'white',
                                            fontFamily: '"Lato", sans-serif'
                                        }),

                                        control: provided => ({...provided,
                                            backgroundColor: '#3C3C3C',
                                            border: 'none',
                                            borderBottom: '1px solid #333333',
                                            borderRadius: 0,
                                            '&:hover': { borderColor: 'white' },
                                            '&:focus-within': { borderColor: colors.orange },
                                            height: '56px'
                                        }),

                                        placeholder: provided => ({...provided,
                                            fontFamily: '"Lato", sans-serif',
                                            color: colors.orange,
                                            fontSize: '14px',
                                            fontWeight: 300
                                        }),

                                        noOptionsMessage: provided => ({...provided,
                                            fontFamily: '"Lato", sans-serif',
                                            color: colors.orange,
                                            backgroundColor: colors.backgroundGray
                                        }),

                                        option: (provided, { data, isFocused }) => {
                                            return ({...provided,
                                                fontWeight: 400,
                                                fontSize: '16px',
                                                backgroundColor: isFocused ? '#383838' : '#424242',
                                                // color: data.data.Sensor === 'Satellite' ? '#1acf02' : data.data.Sensor === 'Blend' ? '#fce803' : '#009fd4',
                                                '&:hover': { backgroundColor: '#383838' },
                                                ':active': { backgroundColor: '#383838' },
                                                '&:after': { 
                                                    content: data.data.Sensor === 'Satellite' ? "'\f7bf'" : data.data.Sensor === 'Blend' ? "'\f109'" : "'\f21a'",
                                                    float: 'left'
                                                },
                                        })},

                                        singleValue: (provided, state) => ({...provided,
                                            color: 'white',
                                            fontWeight: 400
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
                                    inputVariant='filled'
                                    variant='inline'
                                    KeyboardButtonProps={{
                                        className: classes.datePickerInputAdornment
                                    }}
                                />
                            </Grid>  

                            <Grid item xs={12}>
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
                                    inputVariant='filled'
                                    variant='inline'
                                    KeyboardButtonProps={{
                                        className: classes.datePickerInputAdornment
                                    }}
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
                                    helperText={endLonMessage}
                                    name='lon2'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    disabled={!fields || surfaceOnly}
                                    id="depth1-input"
                                    error={Boolean(startDepthMessage)}
                                    label="Start Depth(m)"
                                    className={classes.textField}
                                    value={depth1}
                                    onChange={handleChange}
                                    helperText={startDepthMessage}
                                    name='depth1'
                                    InputProps={{className:classes.padLeft}}
                                    InputLabelProps={{className:classes.padLeft}}
                                >
                                </TextField>
                            </Grid>

                            <Grid item xs={6} className={classes.formGridItem}>
                                <TextField
                                    disabled={!fields || surfaceOnly}
                                    id="depth2-input"
                                    error={Boolean(endDepthMessage)}
                                    label="End Depth(m)"
                                    className={classes.textField}
                                    value={depth2}
                                    onChange={handleChange}
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
                                        value={selectedVizType}
                                        variant='filled'
                                        onChange={this.props.handleChange}
                                        inputProps={{
                                            name: 'selectedVizType',
                                            id: 'vizSelector',
                                            variant: 'filled'
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

                            <Grid item xs={12}>
                                <Button
                                    className={classes.visualizeButton}
                                    variant='contained'
                                    onClick={() => this.props.onVisualize()}
                                    disabled={!selectedVizType || parametersAreInvalid || !fields}
                                    fullWidth
                                >
                                    Visualize
                                </Button>
                            </Grid>
                        </Grid>
                    </form>                    
                </Drawer>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VizControlPanel));

// import { makeStyles, useTheme } from '@material-ui/core/styles';
// import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

// const useStyles = makeStyles(theme => ({
//   root: {
//     display: 'flex',
//   },
//   appBar: {
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//   },
//   appBarShift: {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   hide: {
//     display: 'none',
//   },
//   drawer: {
//     width: drawerWidth,
//     flexShrink: 0,
//   },
//   drawerPaper: {
//     width: drawerWidth,
//   },
//   drawerHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     padding: theme.spacing(0, 1),
//     ...theme.mixins.toolbar,
//     justifyContent: 'flex-end',
//   },
//   content: {
//     flexGrow: 1,
//     padding: theme.spacing(3),
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//     marginLeft: -drawerWidth,
//   },
//   contentShift: {
//     transition: theme.transitions.create('margin', {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//     marginLeft: 0,
//   },
// }));

// export default function PersistentDrawerLeft() {
//   const classes = useStyles();
//   const theme = useTheme();
//   const [open, setOpen] = React.useState(false);

//   const handleDrawerOpen = () => {
//     setOpen(true);
//   };

//   const handleDrawerClose = () => {
//     setOpen(false);
//   };

//   return (
//     <div className={classes.root}>
//       <Drawer
//         className={classes.drawer}
//         variant="persistent"
//         anchor="left"
//         open={open}
//         classes={{
//           paper: classes.drawerPaper,
//         }}
//       >
//         <div className={classes.drawerHeader}>
//           <IconButton onClick={handleDrawerClose}>
//             {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//           </IconButton>
//         </div>
//         <Divider />
//         <List>
//           {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//             <ListItem button key={text}>
//               <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItem>
//           ))}
//         </List>
//         <Divider />
//         <List>
//           {['All mail', 'Trash', 'Spam'].map((text, index) => (
//             <ListItem button key={text}>
//               <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItem>
//           ))}
//         </List>
//       </Drawer>
//     </div>
//   );
// }

// import React from 'react';
// import { connect } from 'react-redux';

// import { withStyles } from '@material-ui/core/styles';

// import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';
// import Tooltip from '@material-ui/core/Tooltip';
// import IconButton from '@material-ui/core/IconButton';
// import { InsertChartOutlined, Delete, Web, Language } from '@material-ui/icons';

// import { clearCharts } from '../Redux/actions/visualization';

// const mapStateToProps = (state, ownProps) => ({
//     charts: state.charts
// })

// const mapDispatchToProps = {
//     clearCharts
// }

// const styles = (theme) => ({

//     panelPaper: {
//         width: '27px',
//         // height: '240px',
//         padding: theme.spacing(0.3),
//         position:'fixed',
//         left: '80vw',
//         bottom: '15px',
//         zIndex: 2,
//         textDecoration:'none',
//         cursor: 'pointer',
//         borderRadius: '5%',
//         backgroundColor: 'transparent'
//     },

//     iconButton: {
//         padding: theme.spacing(0.4),
//         marginLeft: '-2px',
//         marginTop: '-1px'
//     }
// })

// const VizControlPanel = (props) => {
//     const { classes } = props;

//     return (
//         <div>
//             <Paper className={classes.panelPaper}>
//                 <Grid container direction='column'>

//                     <Tooltip title={props.showUI ? 'Hide UI' : 'Show UI'}>
//                         <IconButton color='secondary' onClick={props.toggleShowUI} className={classes.iconButton}>
//                             <Web/>
//                         </IconButton>
//                     </Tooltip>

//                     {props.showCharts? 
//                         <Tooltip title='Show Globe'>
//                             <IconButton color='secondary' onClick={props.toggleChartView} className={classes.iconButton}>
//                                 <Language/>
//                             </IconButton>
//                         </Tooltip>                
//                     :
//                         <Tooltip title='Show Charts'>
//                             <IconButton color={props.charts.length ? 'primary' : 'secondary'} onClick={props.toggleChartView} className={classes.iconButton}>
//                                 <InsertChartOutlined/>
//                             </IconButton>
//                         </Tooltip>            
//                     }

//                     <Tooltip title='Clear Visualizations'>
//                         <IconButton color='secondary' onClick={props.clearCharts} className={classes.iconButton}>
//                             <Delete/>
//                         </IconButton>
//                     </Tooltip>

//                 </Grid>
//             </Paper>
//         </div>
//     )
// }


// export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VizControlPanel));

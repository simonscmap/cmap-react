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

import utcDateStringToLocal from '../Utility/utcDateStringToLocal';
import depthCounter from '../Utility/depthCounter';

import ConnectedTooltip from './ConnectedTooltip';

const navDrawerWidth = 260;

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
    backgroundColor: '#424242'
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
      backgroundColor: '#424242'
  },

    formGridItem: {
        borderLeft: '1px solid #313131',
        backgroundColor: '#424242'
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
      backgroundColor: '#424242',
      color: theme.palette.primary.main,
      fontVariant: 'normal',
      '&:disabled': {
        backgroundColor: 'transparent'
    },
      '&:hover': {backgroundColor: '#874400'}
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
      backgroundColor: '#3c3c3c'
  },

  datePicker: {
      width: '100%'
  }

});

const overrideDisabledStyle = {
    backgroundColor: 'transparent'
}

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
    cruiseTrajectory: state.cruiseTrajectory,
    showHelp: state.showHelp
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

        var search = new JsSearch.Search('ID');
        search.searchIndex = new JsSearch.UnorderedSearchIndex();
        search.addIndex('Variable');
        search.addIndex('Make');
        search.addIndex('Sensor');
        search.addIndex('Data_Source');
        search.addIndex('Process_Level');
        search.addIndex('Long_Name');
        search.addIndex('Keywords');
        search.addIndex('Table_Name');
        search.addIndex('Dataset_Name');
        search.addIndex('Study_Domain');
        search.addIndex('Spatial_Resolution');
        search.addIndex('Temporal_Resolution');
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
            this.setState({search: this.state.search});
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
        // var options = {};

        // items.forEach(item => {
        //     if(!options[item.Dataset_Name]){
        //         options[item.Dataset_Name] = {
        //             label: item.Dataset_Name,
        //             options: []
        //         }
        //     }

        //     options[item.Dataset_Name].options.push({
        //         value: item.Variable,
        //         label: item.Long_Name.length < 80 ? item.Long_Name : item.Long_Name.slice(0,78) + '...',
        //         data: item
        //     })
        // });

        // return Object.values(options) || [];
        return items.map(item => ({
            value: item.Variable,
            label: item.Long_Name.length < 80 ? item.Long_Name : item.Long_Name.slice(0,78) + '...',
            data: item
        })) || []
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') this.setState({...this.state, searchField: searchString});
        if(action.action ==='set-value' || action.action === 'menu-close') this.setState({...this.state, searchField: ''});
    }

    estimateDataSize = () => {
        const { dt1, dt2, lat1, lat2, lon1, lon2, fields, depth1, depth2, selectedVizType } = this.props;
        if(!fields) return 0;
        if(fields.data.Spatial_Resolution === spatialResolutions.irregular) return 0;
        if(selectedVizType === vizSubTypes.timeSeries || selectedVizType === vizSubTypes.depthProfile) return 0;

        const date1 = Date.parse(dt1);
        const date2 = Date.parse(dt2);
        const res = mapSpatialResolutionToNumber(fields.data.Spatial_Resolution);

        const dayDiff = (date2 - date1) / 86400000;

        const dateCount = Math.floor(dayDiff / mapTemporalResolutionToNumber(fields.data.Temporal_Resolution)) || 1;
        const depthCount = depthCounter(fields, depth1, depth2) || 1;
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
            handleShowGlobe,
            handleChange,
            handleLatLonChange
        } = this.props;

        const options = searchField && catalog ? this.getSelectOptionsFromCatalogItems(search.search(searchField)) 
            : catalog ? this.getSelectOptionsFromCatalogItems(catalog) 
            : []

        let validations;

        const dataSize = this.estimateDataSize();

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
                this.checkGeneralWarn(dataSize),
                this.checkGeneralPrevent(dataSize)
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

        const checkDisableVisualizeList = [
            startDepthMessage,
            endDepthMessage,
            startLatMessage,
            endLatMessage,
            startLonMessage,
            endLonMessage,
            generalPreventMessage
        ];

        const checkDisableVisualize = () => {
            for(let i = 0; i < checkDisableVisualizeList.length; i++){
                if(checkDisableVisualizeList[i]) return checkDisableVisualizeList[i];
            }

            return false;
        }

        const disableVisualizeMessage = checkDisableVisualize();

        const visualizeButtonTooltip = disableVisualizeMessage ? disableVisualizeMessage : generalWarnMessage ? generalWarnMessage : '';

        let minDate = fields ? utcDateStringToLocal(fields.data.Time_Min) : '';
        let minDateMessage = 'End cannot be before dataset start date';
        var maxDateMessage;
        var maxDate;

        if(!fields){
            maxDate = dt2;
            maxDateMessage = 'Start cannot be after end';
        } else {
            var catalogMaxDate = utcDateStringToLocal(fields.data.Time_Max);

            if(catalogMaxDate < dt2){
                maxDate = catalogMaxDate;
                maxDateMessage = 'Start cannot be after dataset end date';
            } else {
                maxDate = dt2;
                maxDateMessage = 'Start cannot be after end'
            }
        }

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
                                onClick={this.handleShowChartsAndResize}
                                color='inherit'
                            >
                                <InsertChartOutlined/>
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>

                    <Tooltip title='Clear Charts' placement='right'>
                        <IconButton color='inherit' onClick={this.props.clearCharts} className={classes.clearChartsButton}>
                            <Delete/>
                        </IconButton>
                    </Tooltip>

                    <form>
                        <Grid container>
                            <Grid item xs={10}>
                                <ConnectedTooltip placement='top' title='Enter one or more search terms.'>
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
                                        isClearable
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
                                                left: navDrawerWidth,
                                                width: '980px',
                                                borderRadius: '4px',
                                                boxShadow: '2px 2px  2px 2px #242424',
                                                overflow: 'hidden',
                                                backgroundColor: 'rgba(0,0,0,.5)',
                                                backdropFilter: 'blur(5px)',
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
                                                backgroundColor: '#424242',
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
                                                    backgroundColor: 'transparent',
                                                    color: isFocused ? colors.orange : 'white',
                                                    // color: data.data.Sensor === 'Satellite' ? '#1acf02' : data.data.Sensor === 'Blend' ? '#fce803' : '#009fd4',
                                                    '&:hover': { color: colors.orange },
                                                    '&:active': { backgroundColor: 'rgba(0,0,0,.5)', color: colors.orange},
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
                                            },
                                        })}
                                    />
                                </ConnectedTooltip>
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
                                    placeholder='yyyy-MM-dd'
                                    id="startDate"
                                    label="Start Date"
                                    name="dt1"
                                    format='yyyy-MM-dd'
                                    maxDate={maxDate}
                                    maxDateMessage={maxDateMessage}
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
                                    className={classes.datePicker}
                                    placeholder='yyyy-MM-dd'
                                    id="endDate"
                                    label="End Date"
                                    name="dt2"
                                    format='yyyy-MM-dd'
                                    minDate={minDate}
                                    minDateMessage={minDateMessage}
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
                                    disabled={!fields || surfaceOnly}
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
                                    disabled={!fields || surfaceOnly}
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
                                        >
                                        {!heatmapMessage && <MenuItem value={vizSubTypes.heatmap} title={heatmapMessage}>Heatmap</MenuItem>}
                                        {!contourMessage && <MenuItem value={vizSubTypes.contourMap}>Contour Heatmap</MenuItem>}
                                        {!sectionMapMessage && <MenuItem value={vizSubTypes.sectionMap}>Section Map</MenuItem>}
                                        {!sectionMapMessage && <MenuItem value={vizSubTypes.contourSectionMap}>Contour Section Map</MenuItem>}
                                        {!histogramMessage && <MenuItem value={vizSubTypes.histogram}>Histogram</MenuItem>}                      
                                        {!timeSeriesMessage && <MenuItem value={vizSubTypes.timeSeries}>Time Series</MenuItem>}
                                        {!depthProfileMessage && <MenuItem value={vizSubTypes.depthProfile}>Depth Profile</MenuItem>}
                                        {!sparseMapMessage && <MenuItem value={vizSubTypes.sparse}>Sparse Map</MenuItem>}
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
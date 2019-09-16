import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';
import { FixedSizeList as List } from "react-window";

// import createFilterOptions from "react-select-fast-filter-options";

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/TextField';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import IconButton from '@material-ui/core/IconButton';

import { KeyboardDatePicker, DatePicker } from "@material-ui/pickers";

import { 
    BarChart,
    Map,
    Timeline,
    Waves,
    Language,
    LeakAdd,
    ArrowDropDown,
    LibraryBooks
} from '@material-ui/icons';

import vizSubTypes from '../Enums/visualizationSubTypes';
import states from '../asyncRequestStates';
import colors from '../Enums/colors';
import { Button } from '@material-ui/core';
import TableStatsDialog from './TableStatsDialog';

const styles = (theme) => ({
    dataRetrievalFormPaper: {
        width: '1200px',
        height: '205px',
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
    }
})

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    storedProcedureRequestState: state.storedProcedureRequestState,
    catalog: state.catalog,
    catalogRequestState: state.catalogRequestState,
})

const mapDispatchToProps = {
}

const visualizationSpeedDialActions = [
    {icon: <Map/>, name: vizSubTypes.sectionMap },
    {icon: <Timeline/>, name: vizSubTypes.timeSeries},
    {icon: <BarChart/>, name: vizSubTypes.histogram},
    {icon: <Waves/>, name: vizSubTypes.depthProfile},
    {icon: <Language/>, name: vizSubTypes.heatmap},
    {icon: <LeakAdd/>, name: vizSubTypes.contourMap}
];

// Replace react-select menulist with react-window (virtualized) fixed size list
const height = 35;
class MenuList extends Component {
    render() {
        const { options, children, maxHeight, getValue } = this.props;
        const [value] = getValue();
        const initialOffset = options.indexOf(value) * height;
        
        return (
            <List
                style={{backgroundColor: colors.backgroundGray}}
                height={(options.length === 0 ? 35 : maxHeight > height * options.length ? height * options.length : maxHeight) || 35}
                itemCount={children.length}
                itemSize={height}
                initialScrollOffset={initialOffset || 0}
            >
                {({ index, style }) => <div style={style}>{children[index]}</div>}
            </List>
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
            searchField: '',
        }
    }

    // When we get the catalog add them to the search
    // This is not reactive - it mutates the search piece of state in 
    // a way that is not visible to react and will not trigger a re-render.
    componentDidUpdate = (prevProps) => {
        if(!(prevProps.catalog && prevProps.catalog.length) && (this.props.catalog && this.props.catalog.length)){
            this.state.search.addDocuments(this.props.catalog);
            this.setState({search: this.state.search})
        }
    }

    // Includes every variable that returns true when filtering
    // variableWrapper parameter is {label, value, variable object}
    filterVariables = (variableWrapper, searchString) => {

        // Create one string from all column values (using Boolean to remove falsey elements)
        let values = Object.values(variableWrapper.data).filter(Boolean).join(' ');

        let searchTerms = searchString.split(' ');

        // array.some method will return a true as soon as we failed to
        // find one search term, which we negate.
        return !searchTerms.some(term => values.indexOf(term) === -1)
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
            label: item.Variable === item.Long_Name ? item.Variable : item.Variable + ' : ' + item.Long_Name,
            data: item
        })) || []
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') this.setState({...this.state, searchField: searchString});
        if(action.action ==='set-value' || action.action === 'menu-close') this.setState({...this.state, searchField: ''});
    }
    
    render() {      
        const { search, searchField } = this.state;
        
        const { classes, 
            tableName,
            fields, 
            depth1,
            depth2,
            dt1,
            dt2,
            lat1,
            lat2,
            lon1,
            lon2,
            catalog,
            depthIsInvalid,
            latIsInvalid,
            lonIsInvalid,
            catalogRequestState
        } = this.props;

        const options = searchField && catalog ? this.getSelectOptionsFromCatalogItems(search.search(searchField)) 
            : catalog ? this.getSelectOptionsFromCatalogItems(catalog) 
            : []

        return (
            <div className={this.props.showUI ? '' : classes.displayNone}>
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

                                    option: (provided, state) => ({...provided,
                                        backgroundColor: '#424242',
                                        color: state.data.data.Sensor === 'Satellite' ? '#1acf02' : state.data.data.Sensor === 'Blend' ? '#fce803' : '#009fd4',
                                        '&:hover': { backgroundColor: '#383838' },
                                        '&:after': { 
                                            content: state.data.data.Sensor === 'Satellite' ? "'\f7bf'" : state.data.data.Sensor === 'Blend' ? "'\f109'" : "'\f21a'",
                                            float: 'left'
                                        },
                                    }),

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
                                disabled={this.props.fields === null}
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
                                    disableFuture
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
                                    disableFuture
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
                                <TextField
                                    id="startDepth"
                                    label="Start Depth(m)"
                                    name="depth1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={depthIsInvalid(this.props.depth1)}
                                    value={depth1}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endDepth"
                                    label="End Depth(m)"
                                    name="depth2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={depthIsInvalid(this.props.depth2)}
                                    value={depth2}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id="startLat"
                                    label="Start Latitude(deg)"
                                    name="lat1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={latIsInvalid(lat1)}
                                    value={lat1}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endLat"
                                    label="End Latitude(deg)"
                                    name="lat2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={latIsInvalid(lat2)}
                                    value={lat2}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="startLon"
                                    label="Start Longitude(deg)"
                                    name="lon1"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={lonIsInvalid(lon1)}
                                    value={lon1}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>  
                            <Grid item xs={3}>
                                <TextField
                                    id="endLon"
                                    label="End Longitude(deg)"
                                    name="lon2"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    error={lonIsInvalid(lon2)}
                                    value={lon2}
                                    onChange={this.props.handleChange}
                                    variant='outlined'
                                />
                            </Grid>   
                        </Grid>
                        <SpeedDial
                            ariaLabel="Visualization Speed Dial"
                            disabled
                            ButtonProps={{
                                variant: 'round',
                                classes: {
                                    root: classes.visualizeButton
                                },
                                color: 'secondary'
                            }}
                            className={classes.visualizationSpeedDial}
                            icon={<svg height="30" width="200">
                                    <text x="50%" y="50%" fill='white' fontVariant='normal' className={classes.visualizeButtonText}>Visualize</text>
                                </svg>}
                            onBlur={this.handleVisualizationSpeedDialClose}
                            onClick={this.handleVisualizationSpeedDialClick}
                            onClose={this.handleVisualizationSpeedDialClose}
                            onFocus={this.handleVisualizationSpeedDialOpen}
                            onMouseEnter={this.handleVisualizationSpeedDialOpen}
                            onMouseLeave={this.handleVisualizationSpeedDialClose}
                            open={this.state.visualizationSpeedDialOpen}
                            direction= 'right'
                        >
                            {visualizationSpeedDialActions.map(action => (                                   
                                <SpeedDialAction
                                    key={action.name}
                                    icon={action.icon}
                                    tooltipTitle={action.name}
                                    onClick={() => this.props.onVisualize(action.name)}
                                    tooltipPlacement='bottom'
                                />
                            ))}
                        </SpeedDial>                            
                </Paper>
            </div>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataRetrievalForm));
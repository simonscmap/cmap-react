// Search overlay for viz page

import React from 'react';
import { connect } from 'react-redux';
import { withStyles, TextField, MenuItem, InputAdornment, Grid, Link, Typography, FormControl, Select, FormHelperText, Button, } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Search, Close } from '@material-ui/icons';

import ProductList from './ProductList';
import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';

import { vizSearchResultsFetch, vizSearchResultsSetLoadingState, variableNameAutocompleteFetch, vizSearchResultsStore } from '../../Redux/actions/visualization';
import { searchOptionsFetch } from '../../Redux/actions/catalog';

import colors from '../../Enums/colors';
import states from '../../Enums/asyncRequestStates';
import z from '../../Enums/zIndex';

const mapStateToProps = (state, ownProps) => ({
    vizSearchResults: state.vizSearchResults,
    vizSearchResultsLoadingState: state.vizSearchResultsLoadingState,
    autocompleteVariableNames: state.autocompleteVariableNames,
    submissionOptions: state.submissionOptions,
    windowHeight: state.windowHeight
})

const mapDispatchToProps = {
    vizSearchResultsFetch,
    vizSearchResultsSetLoadingState,
    variableNameAutocompleteFetch,
    vizSearchResultsStore,
    searchOptionsFetch
}

const styles = (theme) => ({
    inputRoot: {
        border: `1px solid ${colors.primary}`
    },

    autocompletePopperPaper: {
        backgroundColor: 'black',
        zIndex: z.CONTROL_SECONDARY
    },

    autocompleteOptions: {
        '&[data-focus="true"]': {
            backgroundColor: colors.greenHover,
          },
          textAlign: 'left'
    },

    resetButton: {
        textTransform: 'none',
        width: '160px',
        height: '37px',
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        marginTop: '12px'
    },

    searchPanelRow: {
        marginTop: '10px',
    },

    formControl: {
        width: '90%',
        marginBottom: '6px'
    },

    autoComplete: {
        width: 'calc(100% - 48px)'
    },

    showAdvancedWrapper: {
        textAlign: 'left',
        marginTop: '16px',
        width: '100%'
    },

    regionSelectorInput: {
        fontSize: '13px',
    },

    addBorder: {
        border: `1px solid ${colors.primary}`
    },

    shiftedAutocompletePopper: {
        height: '400px',
        width: '500px',
        position: 'absolute',
        bottom: '190px',
    },

    shiftedAutocompletePaper: {
        minHeight : '400px',
    },

    shiftedAutocompleteListbox: {
        maxHeight: 0,
        minHeight : '400px',
        overflowX: 'hidden'
    },

    closeIcon: {
        float: 'right',
        cursor: 'pointer',
        color: colors.primary,
        textTransform: 'none',
        fontSize: '15px'
    }
});

const defaultState = {
    hasDepth: 'any',
    timeStart: '1900-01-01',
    timeEnd: new Date().toISOString().slice(0,10),
    latStart: -90,
    latEnd: 90,
    lonStart: -180,
    lonEnd: 180,
    sensor: new Set(),
    searchTerms: '',
    temporalResolution: 'Any',
    spatialResolution: 'Any',
    dataSource: 'Any',
    distributor: 'Any',
    processLevel: 'Any',
    make: new Set(),
    region: new Set()
}

class DataSearch extends React.Component {

    state = {
        memberVariablesDataset: null,
        showAdvanced: false,
        sensorsMenuOpen: false,
        regionsMenuOpen: false,
        makesMenuOpen: false,
        ...defaultState
    }


    componentDidMount = () => {
        this.props.vizSearchResultsFetch({});
    }

    handleChangeSearchValue = (e) => {      
        this.updateStateAndSearch({...this.state, [e.target.name]: e.target.value});
    }

    handleChangeAutocomplete = (statePiece) => {
        return (e, v) => {
            let newState = {...this.state, [statePiece]: v}
            this.updateStateAndSearch(newState);
        }
    }

    updateStateAndSearch = (newState) => {
        this.props.vizSearchResultsSetLoadingState(states.inProgress);
        this.props.vizSearchResultsStore({Observation: [], Model: []});

        this.setState(newState);
        this.props.vizSearchResultsFetch(newState);
    }

    handleChangeSensor = (e, altTypeValue) => {
        let newState = {...this.state, sensor: altTypeValue};
        this.setState(newState);
        this.props.vizSearchResultsFetch(newState);
    }

    handleChangeMake = (e, altTypeValue) => {
        let newState = {...this.state, make: altTypeValue};
        this.setState(newState);
        this.props.vizSearchResultsFetch(newState);
    }

    handleToggleShowAdvanced = () => {
        this.setState({...this.state, showAdvanced: !this.state.showAdvanced});
    }

    handleResetSearch = () => {
        let newState = {...this.state, ...defaultState};
        this.updateStateAndSearch(newState);
    }

    handleToggleMenu = (menu) => {
        this.setState({...this.state, [menu]: !this.state[menu]})
    }

    handleClickCheckbox = (e, checked) => {
        let [ column, value ] = e.target.name.split('!!');
        let newSet = new Set(this.state[column]);

        checked ? newSet.add(value) : newSet.delete(value);

        this.updateStateAndSearch({...this.state, [column]: newSet});
    }

    handleClearMultiSelect = (param) => {
        let newState = {...this.state};
        newState[param] = defaultState[param];
        this.updateStateAndSearch(newState);
    }

    render = () => {
        const {
            classes,
            handleSelectDataTarget,
            vizSearchResults,
            autocompleteVariableNames,
            submissionOptions,
            windowHeight
        } = this.props;

        const { 
            searchTerms, 
            memberVariablesDataset,
            hasDepth, 
            timeStart, 
            timeEnd, 
            latStart, 
            latEnd, 
            lonStart, 
            lonEnd,
            temporalResolution,
            spatialResolution,
            dataSource,
            distributor,
            processLevel,
            make,
            region,
            sensor,
        } = this.state;
        
        return (
            <React.Fragment>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography style={{display: 'inline-block'}}>
                            Search and filter using the controls on the left. Select a variable to plot from the list on the right.
                        </Typography>

                        <Button
                            startIcon={<Close style={{fontSize: '22px'}}/>}
                            onClick={this.props.handleCloseDataSearch}
                            className={classes.closeIcon}
                        >
                            Close
                        </Button>

                    </Grid>
                    <Grid item xs={4} style={{overflowY: 'auto', maxHeight: windowHeight - 204, padding: '16px', backgroundColor: 'rgba(0,0,0,.4)', display: memberVariablesDataset ? 'none' : ''}}>
                                <TextField
                                    fullWidth
                                    name='searchTerms'
                                    onChange={this.handleChangeSearchValue}
                                    placeholder='Search'
                                    value={searchTerms}
                                    InputProps={{
                                        classes: {
                                            root: classes.inputRoot
                                        },
                                        startAdornment: (
                                            <React.Fragment>
                                                <InputAdornment position="start">
                                                    <Search style={{color: colors.primary}}/>
                                                </InputAdornment>
                                            </React.Fragment>
                                        )
                                    }}
                                    variant="outlined"
                                    inputRef={this.props.searchInputRef}                        
                                />

                        <MultiCheckboxDropdown
                            options={submissionOptions.Make}
                            selectedOptions={make}
                            handleClear={() => this.handleClearMultiSelect('make')}
                            parentStateKey={'make'}
                            handleClickCheckbox={this.handleClickCheckbox}
                            groupHeaderLabel='Makes'
                        />

                        <MultiCheckboxDropdown
                            options={submissionOptions.Sensor}
                            selectedOptions={sensor}
                            handleClear={() => this.handleClearMultiSelect('sensor')}
                            parentStateKey={'sensor'}
                            handleClickCheckbox={this.handleClickCheckbox}
                            groupHeaderLabel='Sensors'
                        />

                        <MultiCheckboxDropdown
                            options={submissionOptions.Region}
                            selectedOptions={region}
                            handleClear={() => this.handleClearMultiSelect('region')}
                            parentStateKey={'region'}
                            handleClickCheckbox={this.handleClickCheckbox}
                            groupHeaderLabel='Regions'
                        />

                    <div className={classes.showAdvancedWrapper}>
                        <Link
                            component='button'
                            onClick={this.handleToggleShowAdvanced}
                        >
                            {this.state.showAdvanced ? 'Hide Additional Filters' : 'Additional Filters'}
                        </Link>
                    </div>


                    <div style={this.state.showAdvanced ? {} : {display: 'none'}}>

                        <Grid item container xs={12} className={classes.searchPanelRow}>
                            <Grid item xs={6}>
                                <TextField
                                    name='timeStart'
                                    className={classes.formControl}
                                    id="date"
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={timeStart}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    name='timeEnd'
                                    className={classes.formControl}
                                    id="date"
                                    label="End Date"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={timeEnd}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>
                        </Grid>                        

                        <Grid item container xs={12} className={classes.searchPanelRow}>

                            <Grid item xs={6}>
                                <TextField
                                    name='latStart'
                                    className={classes.formControl}
                                    label="Lat Start&deg;"
                                    type="number"
                                    inputProps={{
                                        min: -90,
                                        max: 90
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={latStart}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    name='latEnd'
                                    className={classes.formControl}
                                    label="Lat End&deg;"
                                    type="number"
                                    inputProps={{
                                        min: -90,
                                        max: 90
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={latEnd}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    name='lonStart'
                                    className={classes.formControl}
                                    label="Lon Start&deg;"
                                    type="number"
                                    inputProps={{
                                        min: -180,
                                        max: 180
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lonStart}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    name='lonEnd'
                                    className={classes.formControl}
                                    label="Lon End&deg;"
                                    type="number"
                                    inputProps={{
                                        min: -180,
                                        max: 180
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={lonEnd}
                                    onChange={this.handleChangeSearchValue}
                                />
                            </Grid>                            

                            <Grid item xs={6}>
                                <FormControl className={classes.formControl}>
                                <FormHelperText>Depth Levels</FormHelperText>
                                <Select
                                    value={hasDepth}
                                    onChange={this.handleChangeSearchValue}
                                    name='hasDepth'
                                    MenuProps={{
                                        PopoverClasses: {
                                            paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                        },
                                        style: {zIndex: z.CONTROL_SECONDARY}
                                    }}
                                >
                                    <MenuItem value='any'>Any</MenuItem>
                                    <MenuItem value='yes'>Multiple Levels</MenuItem>
                                    <MenuItem value='no'>Surface Only</MenuItem>
                                </Select>                            
                                </FormControl>
                            </Grid>
                                
                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
                                        <FormHelperText>Process Level</FormHelperText>
                                        <Select
                                            value={processLevel}
                                            onChange={this.handleChangeSearchValue}
                                            name='processLevel'
                                            MenuProps={{
                                                PopoverClasses: {
                                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                                },
                                                style: {zIndex: z.CONTROL_SECONDARY}
                                            }}
                                        >
                                            {
                                                this.props.submissionOptions.Process_Level.map((e) => (
                                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                                ))
                                            }
                                        </Select>                            
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
                                        <FormHelperText>Temporal Resolution</FormHelperText>
                                        <Select
                                            value={temporalResolution}
                                            onChange={this.handleChangeSearchValue}
                                            name='temporalResolution'
                                            MenuProps={{
                                                PopoverClasses: {
                                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                                },
                                                style: {zIndex: z.CONTROL_SECONDARY}
                                            }}
                                        >
                                            {
                                                this.props.submissionOptions.Temporal_Resolution.map((e) => (
                                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                                ))
                                            }
                                        </Select>                            
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
                                        <FormHelperText>Spatial Resolution</FormHelperText>
                                        <Select
                                            value={spatialResolution}
                                            onChange={this.handleChangeSearchValue}
                                            name='spatialResolution'
                                            MenuProps={{
                                                PopoverClasses: {
                                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                                },
                                                style: {zIndex: z.CONTROL_SECONDARY}
                                            }}
                                        >
                                            {
                                                this.props.submissionOptions.Spatial_Resolution.map((e) => (
                                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                                ))
                                            }
                                        </Select>                            
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Autocomplete
                                        options={this.props.submissionOptions.Data_Source}
                                        renderInput={(params) => <TextField margin='none' {...params} label="Data Source" InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>}
                                        getOptionLabel={option => option}
                                        onChange={this.handleChangeAutocomplete('dataSource')}
                                        disablePortal
                                        classes={{
                                            paper: `${classes.shiftedAutocompletePaper} ${classes.autocompletePopperPaper} ${classes.addBorder} `,
                                            input: classes.regionSelectorInput,
                                            option: classes.autocompleteOptions,
                                            popperDisablePortal: classes.shiftedAutocompletePopper,
                                            listbox: classes.shiftedAutocompleteListbox
                                        }}
                                        value={dataSource}
                                    />

                                </Grid>

                                <Grid item xs={12}>
                                <Autocomplete
                                        options={this.props.submissionOptions.Distributor}
                                        renderInput={(params) => <TextField margin='none' {...params} label="Distributor" InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>}
                                        getOptionLabel={option => option}
                                        onChange={this.handleChangeAutocomplete('distributor')}
                                        disablePortal
                                        classes={{
                                            paper: `${classes.shiftedAutocompletePaper} ${classes.autocompletePopperPaper} ${classes.addBorder} `,
                                            input: classes.regionSelectorInput,
                                            option: classes.autocompleteOptions,
                                            popperDisablePortal: classes.shiftedAutocompletePopper,
                                            listbox: classes.shiftedAutocompleteListbox
                                        }}
                                        value={distributor}
                                    />
                                </Grid>
                            </Grid>                        
                        </div>

                        <Grid item xs={12} className={classes.searchPanelRow}>
                            <Button variant='outlined' onClick={this.handleResetSearch} className={classes.resetButton}>
                                Reset Filters
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid item xs={8} style={{paddingTop: '12px'}}>
                        <ProductList 
                            options={vizSearchResults}
                            handleSelectDataTarget={handleSelectDataTarget}
                            handleShowMemberVariables={this.handleShowMemberVariables}
                            make={make}
                            variableDetailsID={this.props.variableDetailsID}
                            handleSetVariableDetailsID={this.props.handleSetVariableDetailsID}
                        />
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataSearch));
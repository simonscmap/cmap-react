import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Chip, TextField, MenuList, MenuItem, InputAdornment, Grid, Tooltip, IconButton, Link, Typography, FormControl, Select, FormHelperText, Button, Popper, Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { ExpandMore, ChevronRight, Search, Layers, DirectionsBoat, CallMissedOutgoing, Info, InsertChart, Close } from '@material-ui/icons';

import matchSorter from 'match-sorter';
// import * as JsSearch from 'js-search';
// import { FixedSizeList } from 'react-window';

import ProductList from './ProductList';
import MultiCheckboxDrowndown from '../UI/MultiCheckboxDropdown';
// import RegionSelector from '../UI/RegionSelector';

import { vizSearchResultsFetch, vizSearchResultsSetLoadingState, variableNameAutocompleteFetch, vizSearchResultsStore } from '../../Redux/actions/visualization';
import { keywordsFetch, searchOptionsFetch } from '../../Redux/actions/catalog';

import colors from '../../Enums/colors';
import states from '../../Enums/asyncRequestStates';
// import regions from '../../Enums/regions';
import zIndex from '@material-ui/core/styles/zIndex';

const mapStateToProps = (state, ownProps) => ({
    // datasets: state.datasets,
    // cruiseList: state.cruiseList,
    vizSearchResults: state.vizSearchResults,
    // keywords: state.keywords,
    vizSearchResultsLoadingState: state.vizSearchResultsLoadingState,
    autocompleteVariableNames: state.autocompleteVariableNames,
    submissionOptions: state.submissionOptions,
    windowHeight: state.windowHeight
})

const mapDispatchToProps = {
    vizSearchResultsFetch,
    // keywordsFetch,
    vizSearchResultsSetLoadingState,
    variableNameAutocompleteFetch,
    vizSearchResultsStore,
    searchOptionsFetch
}

const styles = (theme) => ({
    inputRoot: {
        border: `1px solid ${colors.primary}`
    },

    chip: {
        maxWidth: '160px',
        color: 'white',
        borderColor: theme.palette.primary.main,
        marginRight: '6px',
        height: '28px'
    },

    // autoComplete: {
    //     // width: 'calc(100% - 48px)',
    //     zIndex: 2000
    // },

    autocompletePopperPaper: {
        backgroundColor: 'black',
        zIndex: 30000
    },

    autocompleteOptions: {
        '&[data-focus="true"]': {
            backgroundColor: colors.greenHover,
          },
          textAlign: 'left'
    },

    searchWrapper: {
        position: '-webkit-sticky',
        position: 'sticky',
        top: '152px',
        padding: '14px 20px'
    },

    chip: {
        maxWidth: '160px',
        color: 'white',
        borderColor: theme.palette.primary.main,
        marginRight: '6px',
        height: '28px'
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

    depthFormControlRoot: {
        textAlign: 'left'
    },

    formControl: {
        width: '90%',
        marginBottom: '6px'
    },

    autoComplete: {
        width: 'calc(100% - 48px)'
    },

    searchSectionHeader: {
        color: theme.palette.primary.main,
        textAlign: 'left',
        marginBottom: '8px'
    },

    showAdvancedWrapper: {
        textAlign: 'left',
        marginTop: '16px',
        width: '100%'
    },

    regionSelectorInput: {
        fontSize: '13px',
        // padding: '4px 0px'
    },

    sensorInputLabel: {
        fontSize: '21px'
    },

    sensorTextField: {
        paddingTop: '8px'
    },

    popperDisablePortal: {
        bottom: 130
    },

    addBorder: {
        border: `1px solid ${colors.primary}`
    },

    denseGridItem: {
        marginTop: '4px',
        padding: '0px 6px'
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

    checkboxGroupHeader: {
        '&:hover': {
            backgroundColor: colors.greenHover
        },

        cursor: 'pointer',
        height: '38px',
        boxShadow: '0px 0px 0px 1px #242424',
        backgroundColor: 'rgba(0,0,0,.4)',
        marginTop: '8px'
    },

    formControlLabelRoot: {
        height: '30px'
    },

    formControlLabelLabel: {
        fontSize: '14px'
    },

    closeIcon: {
        float: 'right',
        display: 'inline',
        cursor: 'pointer'
    }
});

// const filterOptions = (options, { inputValue }) => {
//     let values = inputValue.replace('_',' ').split(' ');
//     let result = options;

//     values.forEach(value => {
//         result = matchSorter(result, value);
//     });

//     return result.sort((a,b) => a.length - b.length);
// }

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
    sensorInputValue: '',
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
        // if(!this.props.submissionOptions || !this.props.submissionOptions.length){
        //     this.props.searchOptionsFetch();
        // }
    }

    // handleSearchInputValueChange = (e) => {
    //     this.props.variableNameAutocompleteFetch((e && e.target && e.target.value) || '');
    //     this.setState({...this.state, searchInputValue: (e && e.target && e.target.value) || ''});
    // }

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

    // handleShowMemberVariables = (dataset) => {
    //     this.setState({...this.state, memberVariablesDataset: dataset});
    // }

    // handleSelectRegion = (event, option) => {
    //     console.log(option);
    //     let coverageArray = option ? 
    //         option.value.split(' ').map(e => parseFloat(e)) :
    //         [-90, 90, -180, 180];

    //     let latStart = coverageArray[0];
    //     let latEnd = coverageArray[1];
    //     let lonStart = coverageArray[2];
    //     let lonEnd = coverageArray[3];

    //     let newState = {...this.state, latStart, latEnd, lonStart, lonEnd, region: option};
    //     this.updateStateAndSearch(newState);
    // }

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
            // keywords,
            vizSearchResults,
            // vizSearchResultsSetLoadingState,
            autocompleteVariableNames,
            submissionOptions,
            windowHeight
        } = this.props;

        const { 
            searchTerms, 
            // searchInputValue, 
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
            sensorsMenuOpen,
            makesMenuOpen,
            regionsMenuOpen
        } = this.state;
        
        return (
            <React.Fragment>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography style={{display: 'inline-block'}}>
                            Search and filter using the controls on the left. Select a variable to plot from the list on the right.
                        </Typography>
                        <Close color='primary' onClick={this.props.handleCloseDataSearch} className={classes.closeIcon}/>
                    </Grid>
                    <Grid item xs={4} style={{overflowY: 'auto', maxHeight: windowHeight - 204, padding: '16px', backgroundColor: 'rgba(0,0,0,.4)', display: memberVariablesDataset ? 'none' : ''}}>
                        {/* <Autocomplete
                            className={classes.autoComplete}
                            value={searchTerms}
                            onChange={this.handleChangeSearchValue}
                            clearOnBlur={true}
                            size='small'
                            classes={{
                                paper: classes.autocompletePopperPaper,
                                option: classes.autocompleteOptions
                            }}
                            disablePortal
                            fullWidth={false}
                            filterOptions={options => options}
                            handleHomeEndKeys={true}
                            open={Boolean(autocompleteVariableNames && autocompleteVariableNames.length) && Boolean(searchInputValue && searchInputValue.length)}
                            multiple
                            id="catalog-search-autocomplete"
                            options={autocompleteVariableNames}
                            clearOnEscape
                            freeSolo
                            inputValue={searchInputValue}
                            onInputChange={this.handleSearchInputValueChange}
                            renderTags={(value, getTagProps) => (
                                value.map((option, index) => (
                                    <Tooltip title={option} key={option}>
                                        <Chip variant='outlined' label={option} {...getTagProps({ index })} className={classes.chip}/>
                                    </Tooltip>
                                ))
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    name='searchTerms'
                                    placeholder={searchTerms.length > 0 ? '' : 'Search'}
                                    InputProps={{
                                        ...params.InputProps,
                                        classes: {
                                            root: classes.inputRoot
                                        },
                                        startAdornment: (
                                            <React.Fragment>
                                                <InputAdornment position="start">
                                                    <Search style={{color: colors.primary}}/>
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </React.Fragment>
                                        )
                                    }}
                                    variant="outlined"                            
                                />
                            )}
                        />   */}

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
                                />

                        <MultiCheckboxDrowndown
                            options={submissionOptions.Make}
                            selectedOptions={make}
                            handleClear={() => this.handleClearMultiSelect('make')}
                            parentStateKey={'make'}
                            handleClickCheckbox={this.handleClickCheckbox}
                        />

{/* <Grid 
                            item xs={12} 
                            container 
                            alignItems='center' 
                            className={classes.checkboxGroupHeader} 
                            onClick={() => this.handleToggleMenu('makesMenuOpen')}
                            >
                            {makesMenuOpen ? 
                                <ExpandMore className={classes.menuOpenIcon}/> : 
                                <ChevronRight className={classes.menuOpenIcon}/>
                            }
                            Makes
                        </Grid> */}
                        
                        {/* {
                            makesMenuOpen ?

                            <Grid item xs={12} className={classes.formGroupWrapper}>
                                {
                                    make.size ?

                                    <Grid item container cs={12} justify='flex-start' className={classes.multiSelectHeader}>
                                        <span style={{marginRight: '8px'}}>{make.size} Selected </span>
                                        <Link component='button' onClick={() => this.handleClearMultiSelect('make')}>Reset</Link>
                                    </Grid> : ''
                                }                                
                                
                                <FormGroup>
                                    {submissionOptions.Make.map((e, i) => (
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                key={i}
                                                control={
                                                    <Checkbox 
                                                        color='primary' 
                                                        onChange={this.handleClickCheckbox} 
                                                        className={classes.checkbox} 
                                                        size='small'
                                                        name={'make' + '!!' + e}
                                                        checked={make.has(e)}
                                                    />
                                                }
                                                label={e}
                                                classes={{
                                                    root: classes.formControlLabelRoot,
                                                    label: classes.formControlLabelLabel
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </FormGroup>
                            </Grid>

                            : ''
                        } */}

                    <Grid container>
                        <Grid 
                            item xs={12} 
                            container 
                            alignItems='center' 
                            className={classes.checkboxGroupHeader} 
                            onClick={() => this.handleToggleMenu('sensorsMenuOpen')}
                            >
                            {sensorsMenuOpen ? 
                                <ExpandMore className={classes.menuOpenIcon}/> : 
                                <ChevronRight className={classes.menuOpenIcon}/>
                            }
                            Sensors
                        </Grid>

                        {
                            sensorsMenuOpen ?

                            <Grid item xs={12} className={classes.formGroupWrapper}>
                                {
                                    sensor.size ?

                                    <Grid item container cs={12} justify='flex-start' className={classes.multiSelectHeader}>
                                        <span style={{marginRight: '8px'}}>{sensor.size} Selected </span>
                                        <Link component='button' onClick={() => this.handleClearMultiSelect('sensor')}>Reset</Link>
                                    </Grid> : ''
                                }

                                <FormGroup>
                                    {submissionOptions.Sensor.map((e, i) => (
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                key={i}
                                                control={
                                                    <Checkbox 
                                                        color='primary' 
                                                        onChange={this.handleClickCheckbox} 
                                                        className={classes.checkbox} 
                                                        size='small'
                                                        name={'sensor' + '!!' + e}
                                                        checked={sensor.has(e)}
                                                    />
                                                }
                                                label={e}
                                                classes={{
                                                    root: classes.formControlLabelRoot,
                                                    label: classes.formControlLabelLabel
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </FormGroup>
                            </Grid>

                            : ''
                        }

                        <Grid 
                            item xs={12} 
                            container 
                            alignItems='center' 
                            className={classes.checkboxGroupHeader} 
                            onClick={() => this.handleToggleMenu('regionsMenuOpen')}
                            >
                            {regionsMenuOpen ? 
                                <ExpandMore className={classes.menuOpenIcon}/> : 
                                <ChevronRight className={classes.menuOpenIcon}/>
                            }
                            Regions
                        </Grid>

                        {
                            regionsMenuOpen ?

                            <Grid item xs={12} className={classes.formGroupWrapper}>
                                {
                                    region.size ?

                                    <Grid item container cs={12} justify='flex-start' className={classes.multiSelectHeader}>
                                        <span style={{marginRight: '8px'}}>{region.size} Selected </span>
                                        <Link component='button' onClick={() => this.handleClearMultiSelect('region')}>Reset</Link>
                                    </Grid> : ''
                                }

                                <FormGroup>
                                    {submissionOptions.Region.map((e, i) => (
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                key={i}
                                                control={
                                                    <Checkbox 
                                                        color='primary' 
                                                        onChange={this.handleClickCheckbox} 
                                                        className={classes.checkbox} 
                                                        size='small'
                                                        name={'region' + '!!' + e}
                                                        checked={region.has(e)}
                                                    />
                                                }
                                                label={e}
                                                classes={{
                                                    root: classes.formControlLabelRoot,
                                                    label: classes.formControlLabelLabel
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </FormGroup>
                            </Grid>

                            : ''
                        }

                            {/* <FormGroup>
                                
                                <FormControlLabel
                                    control={<Checkbox checked={jason} onChange={handleChange} name="jason" />}
                                    label="Jason Killian"
                                />
                                <FormControlLabel
                                    control={<Checkbox checked={antoine} onChange={handleChange} name="antoine" />}
                                    label="Antoine Llorca"
                                />
                            </FormGroup> */}

                        {/* <Grid item xs={6} className={classes.denseGridItem}>
                            <Autocomplete
                                options={this.props.submissionOptions ? this.props.submissionOptions.Make : []}
                                value={make}
                                renderInput={(params) => 
                                    <TextField 
                                        {...params}
                                        name='make'
                                        margin='none' 
                                        label="Make" 
                                        InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>
                                }
                                getOptionLabel={option => option}
                                onChange={this.handleChangeAutocomplete('make')}
                                // inputValue={this.state.sensorInputValue}
                                // onInputChange={(e, v) => this.setState({...this.state, sensorInputValue: v})}
                                disablePortal
                                classes={{
                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`,
                                    input: classes.regionSelectorInput,
                                    option: classes.autocompleteOptions
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} className={classes.denseGridItem}>
                            <Autocomplete
                                value={sensor}
                                options={this.props.submissionOptions ? this.props.submissionOptions.Sensor : []}
                                renderInput={(params) => 
                                    <TextField 
                                        {...params}
                                        name='sensor'
                                        margin='none' 
                                        label="Sensor" 
                                        InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>
                                }
                                getOptionLabel={option => option}
                                onChange={this.handleChangeAutocomplete('sensor')}
                                inputValue={this.state.sensorInputValue}
                                onInputChange={(e, v) => this.setState({...this.state, sensorInputValue: v})}
                                disablePortal
                                classes={{
                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`,
                                    input: classes.regionSelectorInput,
                                    option: classes.autocompleteOptions
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} className={classes.denseGridItem}>
                            <Autocomplete
                                options={regions}
                                renderInput={(params) => <TextField margin='none' {...params} label="Ocean Region" InputLabelProps={{style:{fontSize: '12px', marginTop: '4px'}}}/>}
                                getOptionLabel={(option) => option.label}
                                onChange={this.handleSelectRegion}
                                disablePortal
                                classes={{
                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`,
                                    input: classes.regionSelectorInput,
                                    option: classes.autocompleteOptions
                                }}
                                value={region}
                            />
                        </Grid> */}
                    </Grid>

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
                                        style:{zIndex: 8000}
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
                                                style:{zIndex: 8000}
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
                                                style:{zIndex: 8000}
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
                                                style:{zIndex: 8000}
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
                                        // PopperComponent={(props) => <Popper {...props}/>}
                                        value={dataSource}
                                    />
                                    {/* <FormControl className={classes.formControl}>
                                        <FormHelperText>Data Source</FormHelperText>
                                        <Select
                                            value={dataSource}
                                            onChange={this.handleChangeSearchValue}
                                            name='dataSource'
                                            MenuProps={{
                                                PopoverClasses: {
                                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                                },
                                                style:{zIndex: 8000}
                                            }}
                                        >
                                            {
                                                this.props.submissionOptions.Data_Source.map((e) => (
                                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                                ))
                                            }
                                        </Select>                            
                                    </FormControl> */}
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

                                    {/* <FormControl className={classes.formControl}>
                                        <FormHelperText>Distributor</FormHelperText>
                                        <Select
                                            value={distributor}
                                            onChange={this.handleChangeSearchValue}
                                            name='distributor'
                                            MenuProps={{
                                                PopoverClasses: {
                                                    paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`
                                                },
                                                style:{zIndex: 8000}
                                            }}
                                        >
                                            {
                                                this.props.submissionOptions.Distributor.map((e) => (
                                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                                ))
                                            }
                                        </Select>                            
                                    </FormControl> */}
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
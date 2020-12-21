import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, Chip, TextField, MenuList, MenuItem, InputAdornment, Grid, Tooltip, IconButton, Link, Typography, FormControl, Select, FormHelperText, Button } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Search, Layers, DirectionsBoat, CallMissedOutgoing, Info, InsertChart } from '@material-ui/icons';

import matchSorter from 'match-sorter';
// import * as JsSearch from 'js-search';
// import { FixedSizeList } from 'react-window';

import ProductList from './ProductList';
import MemberVariablesList from './MemberVariablesList';
import RegionSelector from '../UI/RegionSelector';

import { vizSearchResultsFetch, vizSearchResultsSetLoadingState, variableNameAutocompleteFetch, vizSearchResultsStore } from '../../Redux/actions/visualization';
import { keywordsFetch, searchOptionsFetch } from '../../Redux/actions/catalog';

import colors from '../../Enums/colors';
import states from '../../Enums/asyncRequestStates';
import zIndex from '@material-ui/core/styles/zIndex';

const mapStateToProps = (state, ownProps) => ({
    // datasets: state.datasets,
    // cruiseList: state.cruiseList,
    vizSearchResults: state.vizSearchResults,
    // keywords: state.keywords,
    vizSearchResultsLoadingState: state.vizSearchResultsLoadingState,
    autocompleteVariableNames: state.autocompleteVariableNames,
    submissionOptions: state.submissionOptions
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
        marginTop: '4px',
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
    sensor: 'Any',
    searchTerms: [],
    searchInputValue: '',
    sensorInputValue: '',
    temporalResolution: 'Any',
    spatialResolution: 'Any',
    dataSource: 'Any',
    distributor: 'Any',
    processLevel: 'Any'
}

class DataSearch extends React.Component {

    state = {
        memberVariablesDataset: null,
        showAdvanced: false,
        ...defaultState
    }

    componentDidMount = () => {
        this.props.vizSearchResultsFetch({});
        // if(!this.props.submissionOptions || !this.props.submissionOptions.length){
        //     this.props.searchOptionsFetch();
        // }
    }

    handleSearchInputValueChange = (e) => {
        this.props.variableNameAutocompleteFetch((e && e.target && e.target.value) || '');
        this.setState({...this.state, searchInputValue: (e && e.target && e.target.value) || ''});
    }

    handleChangeSearchValue = (e, altTypeValue) => {
        this.props.vizSearchResultsSetLoadingState(states.inProgress);
        this.props.vizSearchResultsStore({Observation: [], Model: []});

        const target = e.target.name === undefined ? 
            typeof altTypeValue === 'string' || altTypeValue === null ? 'sensor' : 'searchTerms' : e.target.name;

        let value = e.target.name === 'searchTerms'  || e.target.name === undefined || e.target.name === 'sensor' ? altTypeValue : e.target.value;
        
        if(target === 'sensor' && value === null) value = 'Any';

        let newState = {...this.state, [target]: value};

        this.setState(newState);
        newState.keywords = newState.searchTerms;
        this.props.vizSearchResultsFetch(newState);
    }

    handleToggleShowAdvanced = () => {
        this.setState({...this.state, showAdvanced: !this.state.showAdvanced});
    }

    handleShowMemberVariables = (dataset) => {
        this.setState({...this.state, memberVariablesDataset: dataset});
    }

    handleSelectRegion = (option) => {
        let coverageArray = option ? 
            option.value.split(' ').map(e => parseFloat(e)) :
            [-90, 90, -180, 180];

        let latStart = coverageArray[0];
        let latEnd = coverageArray[1];
        let lonStart = coverageArray[2];
        let lonEnd = coverageArray[3];

        let newState = {...this.state, latStart, latEnd, lonStart, lonEnd};
        this.setState({...newState});
        this.props.vizSearchResultsFetch(newState);
        this.props.vizSearchResultsSetLoadingState(states.inProgress);
        this.props.vizSearchResultsStore({Observation: [], Model: []});

    }

    handleResetSearch = () => {
        this.setState({...this.state, ...defaultState});
        this.props.vizSearchResultsStore({Observation: [], Model: []});
        this.props.vizSearchResultsFetch({});
        this.props.vizSearchResultsSetLoadingState(states.inProgress);
    }

    render = () => {
        const {
            classes,
            handleSelectDataTarget,
            // keywords,
            vizSearchResults,
            // vizSearchResultsSetLoadingState,
            autocompleteVariableNames
        } = this.props;

        const { 
            searchTerms, 
            searchInputValue, 
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
            processLevel
        } = this.state;
        
        return (
            <React.Fragment>
                <Grid container>
                    <Grid item xs={5} style={{padding: '16px', backgroundColor: 'rgba(0,0,0,.4)', display: memberVariablesDataset ? 'none' : ''}}>
                        <Autocomplete
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
                        />  

                    <div className={classes.showAdvancedWrapper}>
                        <Link
                            component='button'
                            onClick={this.handleToggleShowAdvanced}
                        >
                            {this.state.showAdvanced ? 'Hide Advanced Search' : 'Advanced Search'}
                        </Link>
                    </div>


                    {   this.state.showAdvanced ?
                    <>

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
                            <Grid item xs={12} style={{textAlign: 'left', margin: '-20px 0 8px 10px'}}>
                                <RegionSelector
                                    onSelect={this.handleSelectRegion}
                                    paperClass={`${classes.autocompletePopperPaper} ${classes.addBorder}`}
                                    inputClass={classes.regionSelectorInput}
                                    optionClass={classes.autocompleteOptions}
                                    addTopMargin={false}
                                />
                            </Grid>

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
                                <Autocomplete
                                    options={this.props.submissionOptions ? this.props.submissionOptions.Sensor : []}
                                    disablePortal
                                    renderInput={(params) => (
                                            <TextField 
                                                {...params}
                                                margin='dense'
                                                name='sensor' 
                                                label="Sensor" 
                                                InputLabelProps={{style:{fontSize: '16px'}}}
                                                fullWidth
                                                classes={{
                                                    root: classes.sensorTextField,
                                                }}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    classes: {
                                                        root: classes.sensorInputLabel,
                                                    }
                                                }}
                                        />)}
                                    // getOptionLabel={(option) => option.label}
                                    value={this.state.sensor}
                                    onChange={this.handleChangeSearchValue}
                                    inputValue={this.state.sensor}
                                    onInputChange={(e, v) => ''}
                                    classes={{
                                        paper: `${classes.autocompletePopperPaper} ${classes.addBorder}`,
                                        popperDisablePortal: classes.popperDisablePortal,
                                        option: classes.autocompleteOptions
                                        // input: props.inputClass
                                    }}
                                />
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

                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
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
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl className={classes.formControl}>
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
                                    </FormControl>
                                </Grid>
                            </Grid>

                        <Grid item xs={12} className={classes.searchPanelRow}>
                            <Button variant='outlined' onClick={this.handleResetSearch} className={classes.resetButton}>
                                Reset Filters
                            </Button>
                        </Grid>
                        </>
                        : ''
                    }
                                          
                    </Grid>

                    {/* <Grid item xs={5} style={memberVariablesDataset ? {} : {display: 'none'}}> */}
                        {/* <MemberVariablesList
                            handleHideMemberVariables={() => this.setState({...this.state, memberVariablesDataset: null})}
                            dataset={memberVariablesDataset}
                        /> */}
                    {/* </Grid> */}

                    <Grid item xs={7}>
                        <ProductList 
                            options={vizSearchResults}
                            handleSelectDataTarget={handleSelectDataTarget}
                            handleShowMemberVariables={this.handleShowMemberVariables}
                        />
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DataSearch));
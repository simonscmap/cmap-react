import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Link, IconButton, Typography, FormControl, Select, MenuItem, FormHelperText, Chip, TextField, InputAdornment, Paper, Tooltip, Button, Grid } from '@material-ui/core';
import { Search, Help } from '@material-ui/icons';

import { debounce } from 'throttle-debounce';

import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';

import matchSorter from 'match-sorter';
import queryString from 'query-string';

import { keywordsFetch, submissionOptionsRetrieval } from '../../Redux/actions/catalog';

import colors from '../../Enums/colors';

import uriEncodeSearchQuery from '../../Utility/Catalog/uriEncodeSearchQuery';
import SearchHelpContents from './SearchHelpContent';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';
import RegionSelector from '../UI/RegionSelector';

const mapStateToProps = (state, ownProps) => ({
    // keywords: state.keywords,
    searchResults: state.searchResults,
    submissionOptions: state.submissionOptions
})

const mapDispatchToProps = {
    // keywordsFetch,
    submissionOptionsRetrieval
}

const styles = (theme) => ({
    
    searchWrapper: {
        position: 'fixed',
        top: 152,        
        left: 12
    },

    searchPaper: {
        padding: '14px 20px',
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto'
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

    autocompletePopperPaper: {
        backgroundColor: '#1F4B65'
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

    showAdditionalFiltersWrapper: {
        textAlign: 'left',
        marginTop: '12px',
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
    // searchInputValue: '',
    keywords: '',
    hasDepth: 'any',
    timeStart: '1900-01-01',
    timeEnd: new Date().toISOString().slice(0,10),
    latStart: -90,
    latEnd: 90,
    lonStart: -180,
    lonEnd: 180,
    sensor: new Set(),
    make: new Set(),
    region: new Set()
}

class CatalogSearch extends React.Component {

    state = {
        showAdditionalFilters: false,
        helpDialogOpen: false,
        ...defaultState
    }

    // componentDidMount = () => {
    //     if(!this.props.keywords || !this.props.keywords.length){
    //         this.props.keywordsFetch()
    //     }
    // }

    componentDidMount = () => {
        if(this.props.location.search) {
            let params = queryString.parse(this.props.location.search);
            
            ['region', 'sensor', 'make'].forEach(s => {
                if(typeof params[s] === 'string') params[s] = [params[s]];
            })

            let newState = {
                ...params,
                sensor: new Set(params.sensor || []),
                region: new Set(params.region || []),
                make: new Set(params.make || []),
                keywords: typeof params.keywords === 'string' ? params.keywords : params.keywords.join(' ')
            };
            this.setState({...this.state, ...newState});
        }
    }

    handleToggleshowAdditionalFilters = () => {
        this.setState({...this.state, showAdditionalFilters: !this.state.showAdditionalFilters});
    }

    handleChangeSearchValue = (e, altTypeValue) => {
        // const target = e.target.name === undefined ? 
        //     typeof altTypeValue === 'string' || altTypeValue === null ? 'sensor' : 'searchWords' : e.target.name;

        // let value = e.target.name === 'searchWords'  || e.target.name === undefined || e.target.name === 'sensor' ? altTypeValue : e.target.value;

        const target = e.target.name;
        const value = e.target.value;
        
        // if(target === 'sensor' && value === null) value = 'Any';
        let newState = {...this.state, [target]: value};

        this.setState(newState);

        let qstring = queryString.stringify({
            keywords: newState.keywords.split(' '),
            hasDepth: newState.hasDepth,
            timeStart: newState.timeStart,
            timeEnd: newState.timeEnd,
            latStart: newState.latStart,
            latEnd: newState.latEnd,
            lonStart: newState.lonStart,
            lonEnd: newState.lonEnd,
            sensor: Array.from(newState.sensor),
            region: Array.from(newState.region),
            make: Array.from(newState.make)
        });

        this.pushHistory(qstring);

        // this.props.history.push('/catalog?' + qstring);
        
        // this.props.history.push('/catalog?' + uriEncodeSearchQuery({
        //     keywords: this.state.keywords,
        //     hasDepth: this.state.hasDepth,
        //     timeStart: this.state.timeStart,
        //     timeEnd: this.state.timeEnd,
        //     latStart: this.state.latStart,
        //     latEnd: this.state.latEnd,
        //     lonStart: this.state.lonStart,
        //     lonEnd: this.state.lonEnd,
        //     sensor: this.state.sensor,
        //     region: this.state.region,
        //     make: this.state.make,
        //     [target]: value
        // }));
    }

    handleClickCheckbox = (e, checked) => {
        let [ column, value ] = e.target.name.split('!!');
        let newSet = new Set(this.state[column]);

        checked ? newSet.add(value) : newSet.delete(value);
        
        this.handleChangeSearchValue({target: {name: column, value: newSet}});
    }

    // handleSearchInputValueChange = (e) => {
    //     this.setState({...this.state, searchInputValue: (e && e.target && e.target.value) || ''});
    // }

    handleResetSearch = () => {
        this.setState({...this.state, ...defaultState});
        this.props.history.push('/catalog');
    }

    

    // handleSelectRegion = (option) => {
    //     let coverageArray = option ? 
    //         option.value.split(' ').map(e => parseFloat(e)) :
    //         [-90, 90, -180, 180];

    //     let latStart = coverageArray[0];
    //     let latEnd = coverageArray[1];
    //     let lonStart = coverageArray[2];
    //     let lonEnd = coverageArray[3];
        
    //     this.props.history.push('/catalog?' + uriEncodeSearchQuery({
    //         searchWords: this.state.searchWords,
    //         hasDepth: this.state.hasDepth,
    //         timeStart: this.state.timeStart,
    //         timeEnd: this.state.timeEnd,
    //         latStart,
    //         latEnd,
    //         lonStart,
    //         lonEnd,
    //         sensor: this.state.sensor
    //     }));

    //     this.setState({...this.state, latStart, latEnd, lonStart, lonEnd});
    // }

    handleClearMultiSelect = (statePiece) => {
        this.handleChangeSearchValue({target: {name: statePiece, value: new Set()}});
    }

    _pushHistory = (qstring) => {
        this.props.history.push('/catalog?' + qstring);
    }

    pushHistory = debounce(150, this._pushHistory);

    render = () => {
        // const { classes, keywords } = this.props;
        const { classes, submissionOptions } = this.props;
        const { searchInputValue, keywords, hasDepth, timeStart, timeEnd, latStart, latEnd, lonStart, lonEnd, make, sensor, region } = this.state;

        return (
            // <Grid container>
                // <Grid item xs={12} md={4} className={classes.searchWrapper} >         
            <Paper elevation={4} className={classes.searchPaper}>
                <Grid container justify='center' alignItems='center'>
                    {/* <div style={{display: 'flex', justifyContent:'space-between', width: '100%', alignItems: 'center'}}> */}
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            name='keywords'
                            placeholder='Search'
                            InputProps={{
                                startAdornment: (
                                    <React.Fragment>
                                        <InputAdornment position="start">
                                            <Search style={{color: colors.primary}}/>
                                        </InputAdornment>
                                    </React.Fragment>
                                )
                            }}
                            value={keywords}
                            variant="outlined"
                            onChange={this.handleChangeSearchValue}
                            fullWidth                      
                        />
                    </Grid>

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


                        {/* <Autocomplete
                            className={classes.autoComplete}
                            value={searchWords}
                            onChange={this.handleChangeSearchValue}
                            clearOnBlur
                            size='small'
                            classes={{
                                paper: classes.autocompletePopperPaper
                            }}
                            fullWidth={false}
                            filterOptions={filterOptions}
                            handleHomeEndKeys={true}
                            open={searchInputValue.length > 1}
                            multiple
                            id="catalog-search-autocomplete"
                            options={keywords}
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
                                    name='searchWords'
                                    placeholder={searchWords.length > 0 ? 'Add Keywords' : 'Search by Keyword'}
                                    InputProps={{
                                        ...params.InputProps,
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
                        /> */}

                        {/* <HelpButtonAndDialog
                            title='Catalog Search'
                            content={<SearchHelpContents/>}
                        /> */}

                        {/* <IconButton className={classes.showHelpButton} onClick={() => this.setState({...this.state, helpDialogOpen: true})}>
                            <Help/>
                        </IconButton> */}
                    {/* </div> */}

                    <div className={classes.showAdditionalFiltersWrapper}>
                        <Link
                            component='button'
                            onClick={this.handleToggleshowAdditionalFilters}
                        >
                            {this.state.showAdditionalFilters ? 'Hide Additional Filters' : 'Show Additional Filters'}
                        </Link>
                    </div>


                    {   this.state.showAdditionalFilters ?
                    <>

                        <Grid item container xs={12} className={classes.searchPanelRow}>
                            <Grid item xs={12}>
                                <Typography className={classes.searchSectionHeader}>
                                    Temporal Coverage
                                </Typography>
                            </Grid>
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

                        <Grid item container xs={12} className={classes.searchPanelRow} style={{marginTop: '14px'}}>
                            <Grid item xs={12}>
                                <Typography className={classes.searchSectionHeader} style={{marginBottom: 0}}>
                                    Spatial Coverage
                                </Typography>
                            </Grid>

                            {/* <Grid item xs={12} style={{textAlign: 'left', margin: '-3px 0 8px 10px'}}>
                                <RegionSelector
                                    onSelect={this.handleSelectRegion}
                                    paperClass={classes.autocompletePopperPaper}
                                    inputClass={classes.regionSelectorInput}
                                />
                            </Grid> */}

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
                                >
                                    <MenuItem value='any'>Any</MenuItem>
                                    <MenuItem value='yes'>Multiple Levels</MenuItem>
                                    <MenuItem value='no'>Surface Only</MenuItem>
                                </Select>                            
                                </FormControl>
                            </Grid>

                            {/* <Grid item xs={12}>
                                <Autocomplete
                                    options={this.props.submissionOptions ? this.props.submissionOptions.Sensor : []}
                                    renderInput={(params) => (
                                            <TextField 
                                                {...params}
                                                margin='dense'
                                                name='sensor' 
                                                label="Sensor" 
                                                InputLabelProps={{style:{fontSize: '16px'}}}
                                                fullWidth
                                                classes={{
                                                    root: classes.sensorTextField
                                                }}
                                                InputLabelProps={{
                                                    classes: {
                                                        root: classes.sensorInputLabel
                                                    }
                                                }}
                                        />)}
                                    // getOptionLabel={(option) => option.label}
                                    value={this.state.sensor}
                                    onChange={this.handleChangeSearchValue}
                                    classes={{
                                        paper: classes.autocompletePopperPaper,
                                        // input: props.inputClass
                                    }}
                                />
                                </Grid> */}
                            </Grid>                        
                        </>
                        : ''
                    }

                    <Grid item xs={12} className={classes.searchPanelRow}>
                        <Button variant='outlined' onClick={this.handleResetSearch} className={classes.resetButton}>
                            Reset Filters
                        </Button>
                    </Grid>

                </Grid>
            </Paper>
        )
        // </Grid>
    
        {/* <Grid item xs={12} md={8}></Grid> */}
        // </Grid>          
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(CatalogSearch)));
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router";

import { withStyles } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Link, IconButton, Typography, FormControl, Select, MenuItem, FormHelperText, Chip, TextField, InputAdornment, Paper, Tooltip, Button, Grid } from '@material-ui/core';
import { Search, Help } from '@material-ui/icons';

import matchSorter from 'match-sorter';

import { keywordsFetch } from '../../Redux/actions/catalog';

import colors from '../../Enums/colors';

import uriEncodeSearchQuery from '../../Utility/Catalog/uriEncodeSearchQuery';
import SearchHelpContents from './SearchHelpContent';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';

const mapStateToProps = (state, ownProps) => ({
    keywords: state.keywords,
    searchResults: state.searchResults
})

const mapDispatchToProps = {
    keywordsFetch
}

const styles = (theme) => ({
    
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
        // color: '#2E3D19',
        // margin: '0 0 -20px 16px',
        textTransform: 'none',
        width: '160px',
        height: '37px',
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        marginTop: '12px'
    },

    searchPanelRow: {
        marginTop: '14px',
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

    showAdvancedWrapper: {
        textAlign: 'left',
        marginTop: '4px',
        width: '100%'
    }
});

const filterOptions = (options, { inputValue }) => {
    let values = inputValue.replace('_',' ').split(' ');
    let result = options;

    values.forEach(value => {
        result = matchSorter(result, value);
    });

    return result.sort((a,b) => a.length - b.length);
}

const searchRef = React.createRef();

const defaultState = {
    searchInputValue: '',
    searchWords: [],
    hasDepth: 'any',
    timeStart: '1900-01-01',
    timeEnd: new Date().toISOString().slice(0,10),
    latStart: -90,
    latEnd: 90,
    lonStart: -180,
    lonEnd: 180
}

class CatalogSearch extends React.Component {

    state = {
        showAdvanced: false,
        helpDialogOpen: false,
        ...defaultState
    }

    componentDidMount = () => {
        if(!this.props.keywords || !this.props.keywords.length){
            this.props.keywordsFetch()
        }
    }

    handleToggleShowAdvanced = () => {
        this.setState({...this.state, showAdvanced: !this.state.showAdvanced});
    }

    handleChangeSearchValue = (e, valueArray) => {
        const target = e.target.name === undefined ? 'searchWords' : e.target.name;
        let value = e.target.name === 'searchWords'  || e.target.name === undefined ? valueArray : e.target.value;

        this.setState({...this.state, [target]: value});
        
        this.props.history.push('/catalog?' + uriEncodeSearchQuery({
            searchWords: this.state.searchWords,
            hasDepth: this.state.hasDepth,
            timeStart: this.state.timeStart,
            timeEnd: this.state.timeEnd,
            latStart: this.state.latStart,
            latEnd: this.state.latEnd,
            lonStart: this.state.lonStart,
            lonEnd: this.state.lonEnd,
            [target]: value
        }));
    }

    handleSearchInputValueChange = (e) => {
        this.setState({...this.state, searchInputValue: (e && e.target && e.target.value) || ''});
    }

    handleResetSearch = () => {
        this.setState({...this.state, ...defaultState});
        this.props.history.push('/catalog');
    }

    render = () => {
        const { classes, keywords } = this.props;
        const { searchInputValue, searchWords, hasDepth, timeStart, timeEnd, latStart, latEnd, lonStart, lonEnd } = this.state;

        return (
            <Paper className={classes.searchWrapper} elevation={4}>
                <Grid container justify='center' alignItems='center'>
                    <div style={{display: 'flex', justifyContent:'space-between', width: '100%', alignItems: 'center'}}>        
                        <Autocomplete
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
                        />

                        <HelpButtonAndDialog
                            title='Catalog Search'
                            content={<SearchHelpContents/>}
                        />

                        {/* <IconButton className={classes.showHelpButton} onClick={() => this.setState({...this.state, helpDialogOpen: true})}>
                            <Help/>
                        </IconButton> */}
                    </div>

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

                        <Grid item container xs={12} className={classes.searchPanelRow} style={{marginTop: '24px'}}>
                            <Grid item xs={12}>
                                <Typography className={classes.searchSectionHeader}>
                                    Spatial Coverage
                                </Typography>
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
                                >
                                    <MenuItem value='any'>Any</MenuItem>
                                    <MenuItem value='yes'>Multiple Levels</MenuItem>
                                    <MenuItem value='no'>Surface Only</MenuItem>
                                </Select>                            
                                </FormControl>
                            </Grid>

                            <Grid item xs={6}></Grid>

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
            </Paper>            
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withRouter(CatalogSearch)));
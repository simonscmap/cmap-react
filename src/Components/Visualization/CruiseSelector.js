import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';
import { VariableSizeList } from 'react-window';

import { withStyles } from '@material-ui/core/styles';
import { Search, ZoomOutMap } from '@material-ui/icons';
import { Table, TableBody, TableCell, TableRow, Link, Icon, Tooltip, Grid, Typography, TextField, InputAdornment, Paper, Button } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { cruiseListRequestSend, cruiseTrajectoryRequestSend, cruiseTrajectoryClear } from '../../Redux/actions/visualization';

import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';
import MultiCheckboxDropdown from '../UI/MultiCheckboxDropdown';

import states from '../../Enums/asyncRequestStates';
import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';
import setsFromList from '../../Utility/setsFromList';

const mapStateToProps = (state, ownProps) => ({
    cruiseList: state.cruiseList,
    getCruiseListState: state.getCruiseListState,
    windowHeight: state.windowHeight
})

const mapDispatchToProps = {
    cruiseListRequestSend,
    cruiseTrajectoryRequestSend,
    cruiseTrajectoryClear
}

const esriFonts = '"Avenir Next W00","Helvetica Neue",Helvetica,Arial,sans-serif';
const esriFontColor = 'white';

const styles = theme => ({
    outerDiv: {
        padding:'12px',
        maxWidth: '360px',
        backgroundColor: 'transparent',
        color: esriFontColor,
        borderRadius: '4px',
        boxShadow: '2px',
        // position: 'relative',
        backdropFilter: 'blur(2px)',
        transform: 'translateY(35px)',
        marginTop: '24px',
        position: 'fixed',
        // right: '0px',
        left: 0,
        // top: '60px'
        top: 140
    },

    cruiseSelect: {
        width: '260px',
        borderRadius: '4px',
        display: 'inline-block'
    },

    cruiseInfo: {
        color: esriFontColor,
        fontFamily: esriFonts,
        margin: '12px auto 0 auto',
    },

    cruiseInfoCell: {
        color: esriFontColor,
        fontFamily: esriFonts,
        borderStyle: 'none',
    },

    dragIcon: {
        padding: '12px 12px 12px 0',
        color: colors.primary,
        verticalAlign: 'middle'
    },

    linkWrapper: {
        padding: '12px',
        fontSize: '14px'
    },

    searchMenuPaper: {
        position: 'fixed',
        top: 120,
        bottom: 60,
        left: 0,
        width: '98vw',
        height: 'auto',
        zIndex: 1500,
        backgroundColor: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(5px)',
    },

    closeIcon: {
        float: 'right',
        cursor: 'pointer',
        color: colors.primary,
        textTransform: 'none',
        fontSize: '15px'
    },

    inputRoot: {
        border: `1px solid ${colors.primary}`
    },

    openSearchButtonPaper: {
        backgroundColor: colors.backgroundGray,
        // border: 'none',
        boxShadow: '1px 1px 1px 1px #242424',
        // color: esriFontColor,
        // borderRadius: 4,
        // '&:hover': { 
        //     border: `1px solid white`,
        // },
        // '&:focus-within': {
        //     borderColor: colors.primary
        // }
    },

    openSearchButton: {
        // width: 260,
        textTransform: 'none',
        color: colors.primary,
        fontSize: '15px',
        padding: '6px 42px'
    },

    resetButton: {
        textTransform: 'none',
        width: '160px',
        height: '37px',
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        marginTop: '12px'
    },

    searchResult: {
        display: 'flex',
        alignItems: 'center',
        height: '32px',
        textAlign: 'left',
        fontSize: '14px',
        cursor: 'pointer',
        paddingLeft: '12px',
        '&:hover': {
            backgroundColor: colors.greenHover
        },
    },

    yearHeader: {
        backgroundColor: 'rgba(0, 0, 0, .7)',
        height: '36px',
        fontSize: '17px',
        display: 'flex',
        alignItems: 'center',
        justifyCOntent: 'center'
        // paddingLeft: '12px'
    }
})

// // Replace react-select selected option
// const SingleValue = (props) => {
//     return (
//         <components.SingleValue {...props} className={props.className}/>
//     )
// }

// // Replace react-select option
// const Option = (props) => {
//     return (
//       <components.Option 
//         {...props} 
//         innerProps={{
//             ...props.innerProps, 
//             // Prevent focus / scroll events when mousing over options
//             onMouseMove: (e) => e.preventDefault(), 
//             onMouseOver: (e) => e.preventDefault()
//         }}>
//     </components.Option>
//     )
// }

// const cruiseSort =  (a,b) => a.Name < b.Name ? -1 : 1;

// const ValueContainer = (props) => {
//     return (
//         <components.ValueContainer {...props}>
//             <Search style={{ position: "absolute", left: 6, color: colors.primary }}/>
//             {props.children}
//         </components.ValueContainer>
//     )
// }

class CruiseSelector extends Component {
    
    constructor(props){
        super(props);

        var search = new JsSearch.Search('ID');
        search.searchIndex = new JsSearch.UnorderedSearchIndex();
        search.addIndex('Nickname');
        search.addIndex('Name');
        search.addIndex('Chief_Name');
        search.addIndex('Keywords');
        try{
            if(props.cruiseList && props.cruiseList.length) search.addDocuments(props.cruiseList);
        } catch(e) {
            console.log(e);
            console.log(props.cruiseList);
        }

        this.state = {
            search,
            searchField: '',
            selectedCruise: null,
            searchMenuOpen: false,
            selectedYears: new Set(),
            selectedChiefScientists: new Set()
        }
    }

    componentDidMount = () => {
        this.props.handleShowGlobe();
        if(!this.props.cruiseList || !this.props.cruiseList.length) this.props.cruiseListRequestSend();
    }

    componentWillUnmount = () => {
        this.props.cruiseTrajectoryClear()
    }

    // formatOptionLabel = (option) => {
    //     let label = option.data.Name === option.data.Nickname ?
    //         option.data.Name :
    //         `${option.data.Name} - ${option.data.Nickname}`;

    //     return label;
    // }

    // getSelectOptionsFromCruiseList = (list) => {
    //     return list.map(item => ({
    //         value: item.Name,
    //         label: item.Name,
    //         data: item
    //     })) || []
    // }

    handleCruiseSelect = (selection) => {
        // if(selection && selection.data){
        //     const id = selection.data.ID;
        //     this.props.cruiseTrajectoryRequestSend(id);
        // } else {this.props.cruiseTrajectoryClear()}

        if(selection){
            this.props.cruiseTrajectoryRequestSend(selection.ID);
        }

        this.setState({...this.state, selectedCruise: selection, searchMenuOpen: false});
        // this.props.updateParametersFromCruiseBoundary(selection);
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.cruiseList && prevProps.cruiseList.length) && (this.props.cruiseList && this.props.cruiseList.length)){
            this.state.search.addDocuments(this.props.cruiseList);
            this.setState({search: this.state.search})
        }
    }

    searchFilterGroupCruises = () => {
        let { searchField, selectedYears, selectedChiefScientists, search } = this.state;
        let cruises = this.props.cruiseList;

        if(searchField) cruises = search.search(searchField);
        if(selectedYears && selectedYears.size) cruises = cruises.filter(e => selectedYears.has(e.Year));
        if(selectedChiefScientists && selectedChiefScientists.size) cruises = cruises.filter(e => selectedChiefScientists.has(e.Chief_Name));

        let cruisesGroupedByYear = cruises.reduce((acc, cur) => {
            if(!acc[cur.Year]) acc[cur.Year] = [];    
            acc[cur.Year].push(cur);    
            return acc;
        }, {});

        cruisesGroupedByYear = Object.keys(cruisesGroupedByYear).map(key => ({year: key, cruises: cruisesGroupedByYear[key]}));

        return {cruisesGroupedByYear, cruises};
    }

    // onAutoSuggestChange = (searchString, action) => {
    //     if(action.action === 'input-change') this.setState({...this.state, searchField: searchString});
    //     if(action.action ==='set-value' || action.action === 'menu-close') this.setState({...this.state, searchField: ''});
    // }

    handleChangeSearchValue = (e) => {
        this.setState({...this.state, searchField: e.target.value});
    }

    handleCloseSearch = () => {
        this.setState({...this.state, searchMenuOpen: false});
    }

    handleClearMultiSelect = (statePiece) => {
        this.setState({...this.state, [statePiece]: new Set()});
    }

    handleResetSearch = () => {
        this.setState({...this.state, selectedYears: new Set(), selectedChiefScientists: new Set(), searchField: ''});
    }

    handleClickCheckbox = (e, checked) => {
        let [ column, value ] = e.target.name.split('!!');
        let newSet = new Set(this.state[column]);

        checked ? newSet.add(value) : newSet.delete(value);

        this.setState({...this.state, [column]: newSet});
    }

    render(){
        const { search, searchField, selectedCruise, searchMenuOpen, selectedYears, selectedChiefScientists } = this.state;        
        const { classes, cruiseList, windowHeight } = this.props;

        // const { availableYears, availableChiefScientists } = searchOptionsFromCruiseList();
        // let cruises = searchField ? search.search(searchField) : cruiseList;
        // const options = searchField && cruiseList ? this.getSelectOptionsFromCruiseList(search.search(searchField).sort(cruiseSort)) 
        //     : cruiseList ? this.getSelectOptionsFromCruiseList(cruiseList) 
        //     : []

        let { cruisesGroupedByYear, cruises } = cruiseList && cruiseList.length ? this.searchFilterGroupCruises() : {cruisesGroupedByYear: [], cruises: []};
        let optionSets = setsFromList(cruises, ['Chief_Name', 'Year']);

        return (
            <>
                <Paper className={classes.searchMenuPaper} style={searchMenuOpen ? {} : {display: 'none'}}>
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography style={{display: 'inline-block'}}>
                                Search and filter using the controls on the left. Select a cruise from the list on the right.
                            </Typography>

                            <Button
                                startIcon={<Close style={{fontSize: '22px'}}/>}
                                onClick={this.handleCloseSearch}
                                className={classes.closeIcon}
                            >
                                Close
                            </Button>

                            {/* <Close onClick={this.props.handleCloseDataSearch} className={classes.closeIcon}/> */}
                        </Grid>

                        <Grid item xs={4} style={{overflowY: 'auto', maxHeight: windowHeight - 204, padding: '16px', backgroundColor: 'rgba(0,0,0,.4)'}}>
                                <TextField
                                    fullWidth
                                    name='searchTerms'
                                    onChange={this.handleChangeSearchValue}
                                    placeholder='Search'
                                    value={searchField}
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

                            <MultiCheckboxDropdown
                                options={Array.from(optionSets.Year).sort()}
                                selectedOptions={selectedYears}
                                handleClear={() => this.handleClearMultiSelect('selectedYears')}
                                parentStateKey={'selectedYears'}
                                handleClickCheckbox={this.handleClickCheckbox}
                                groupHeaderLabel='Year'
                            />

                            <MultiCheckboxDropdown
                                options={Array.from(optionSets.Chief_Name).sort()}
                                selectedOptions={selectedChiefScientists}
                                handleClear={() => this.handleClearMultiSelect('selectedChiefScientists')}
                                parentStateKey={'selectedChiefScientists'}
                                handleClickCheckbox={this.handleClickCheckbox}
                                groupHeaderLabel='Chief Scientist'
                            />

                            <Grid item xs={12} className={classes.searchPanelRow}>
                                <Button variant='outlined' onClick={this.handleResetSearch} className={classes.resetButton}>
                                    Reset Filters
                                </Button>
                            </Grid>
                        </Grid>

                        <Grid item xs={8} style={{paddingTop: '12px'}}>

                            <Grid item xs={12}>
                                <Typography className={classes.heading}>
                                    Showing {cruises.length} cruises (grouped by year)
                                </Typography>
                            </Grid>
        
                        <VariableSizeList
                            // ref={listRef}
                            itemData={cruisesGroupedByYear}
                            itemCount={cruisesGroupedByYear.length}
                            height={windowHeight - 249}
                            width='100%'
                            estimatedItemSize={38}
                            style={{overflowY: 'scroll'}}
                            itemSize={(i) => cruisesGroupedByYear[i].cruises.length * 32 + 40}
                            // itemSize={() => 200}
                        >
                            {({ index, style }) => (
                                <div style={style}>
                                    <div className={classes.yearHeader}><span>{cruisesGroupedByYear[index].year}</span></div>
                                    {cruisesGroupedByYear[index].cruises.map((cruise, i) => (
                                        <div 
                                            className={classes.searchResult}
                                            onClick={() => this.handleCruiseSelect(cruise)}
                                            key={cruise.Name}
                                        >
                                            {cruise.Nickname}
                                        </div>
                                    ))
                                    }
                                </div>
                            )}
                        </VariableSizeList>
                        </Grid>
                    </Grid>
                </Paper>

                <div id='cruise-selector' className={classes.outerDiv}>

                    <Paper className={classes.openSearchButtonPaper}>
                        <Button
                            startIcon={<Search/>}
                            className={classes.openSearchButton}
                            onClick={() => this.setState({...this.state, searchMenuOpen: true})}
                        >
                            Search Cruises
                        </Button>
                    </Paper>
                    
                    {/* <ConnectedTooltip placement='left' title={tooltips.visualization.cruiseSelector}> */}
                        {/* <Select
                            isLoading={this.props.getCruiseListState === states.inProgress}
                            components={{
                                IndicatorSeparator:'',
                                Option,
                                SingleValue,
                                ValueContainer
                            }}
                            isClearable
                            formatOptionLabel={this.formatOptionLabel}
                            onInputChange={this.onAutoSuggestChange}
                            filterOption={null}
                            className={classes.cruiseSelect}
                            escapeClearsValue
                            label="Cruise"
                            options={options}
                            onChange={this.handleCruiseSelect}
                            value={this.state.selectedCruise}
                            placeholder="Search Cruises"
                            styles={{
                                // menu: provided => ({ ...provided, zIndex: 9999 }),
                                menu: provided => ({ ...provided, zIndex: z.CONTROL_PRIMARY }),

                                menuList: provided => ({...provided, backgroundColor: colors.backgroundGray}),

                                input: provided => ({...provided,
                                    color: 'inherit',
                                    fontFamily: esriFonts
                                }),

                                control: provided => ({...provided,
                                    backgroundColor: colors.backgroundGray,
                                    border: 'none',
                                    boxShadow: '1px 1px 1px 1px #242424',
                                    color: esriFontColor,
                                    borderRadius: 4,
                                    '&:hover': { 
                                        border: `1px solid white`,
                                    },
                                    '&:focus-within': {
                                        borderColor: colors.primary
                                    }
                                }),

                                placeholder: provided => ({...provided,
                                    fontFamily: esriFonts,
                                    color: colors.primary,
                                    fontSize: '14px'
                                }),

                                noOptionsMessage: provided => ({...provided,
                                    fontFamily: esriFonts,
                                    color: esriFontColor,
                                    backgroundColor: colors.backgroundGray
                                }),

                                option: (provided, state) => ({...provided,
                                    backgroundColor: colors.backgroundGray,
                                    color: state.isFocused ? colors.primary : 'white',
                                    '&:hover': { backgroundColor: colors.greenHover}
                                }),

                                singleValue: (provided, state) => ({...provided,
                                    fontFamily: esriFonts,
                                    color: 'inherit',
                                    paddingRight: '20px',
                                }),

                                valueContainer: provided => ({
                                    ...provided,
                                    padding: '0 0 0 34px',
                                    fontWeight: 100
                                }),
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
                        /> */}

                        {/* <HelpButtonAndDialog
                            title='Cruise Help'
                            content='Cruise Help Content'
                        /> */}

                    {selectedCruise &&
                        <>
                        <Table size='small' className={classes.cruiseInfo}>
                            <TableBody>
                                <TableRow>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        Cruise:
                                    </TableCell>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        {selectedCruise.Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        Nickname:
                                    </TableCell>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        {selectedCruise.Nickname}
                                    </TableCell>
                                </TableRow>

                                {
                                    selectedCruise.Start_Time &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Start Date:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.Start_Time.slice(0,10)}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.End_Time &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            End Date:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.End_Time.slice(0,10)}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.Chief_Name &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Chief Scientist:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.Chief_Name}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.Ship_Name &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Ship:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.Ship_Name}
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        
                            <div className={classes.linkWrapper}>
                                <Link 
                                    component={RouterLink} 
                                    to={`/catalog/cruises/${selectedCruise.Name}`}
                                    target='_blank'
                                >
                                    Open Cruise Catalog Page
                                </Link>
                            </div>
                        </>
                    }
                </div>
            </>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CruiseSelector));
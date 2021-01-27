import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';

import { withStyles } from '@material-ui/core/styles';
import { Search, ZoomOutMap } from '@material-ui/icons';
import { Table, TableBody, TableCell, TableRow, Link, Icon, Tooltip } from '@material-ui/core';

import { cruiseListRequestSend, cruiseTrajectoryRequestSend, cruiseTrajectoryClear } from '../../Redux/actions/visualization';

import states from '../../Enums/asyncRequestStates';
import colors from '../../Enums/colors';
import HelpButtonAndDialog from '../UI/HelpButtonAndDialog';

const mapStateToProps = (state, ownProps) => ({
    cruiseList: state.cruiseList,
    getCruiseListState: state.getCruiseListState
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
        padding: '12px'
    }
})

// Replace react-select selected option
const SingleValue = (props) => {
    return (
        <components.SingleValue {...props} className={props.className}/>
    )
}

// Replace react-select option
const Option = (props) => {
    return (
      <components.Option 
        {...props} 
        innerProps={{
            ...props.innerProps, 
            // Prevent focus / scroll events when mousing over options
            onMouseMove: (e) => e.preventDefault(), 
            onMouseOver: (e) => e.preventDefault()
        }}>
    </components.Option>
    )
}

const cruiseSort =  (a,b) => a.Name < b.Name ? -1 : 1;

const ValueContainer = (props) => {
    return (
        <components.ValueContainer {...props}>
            <Search style={{ position: "absolute", left: 6, color: colors.primary }}/>
            {props.children}
        </components.ValueContainer>
    )
}

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
            selectedCruise: null
        }
    }

    componentDidMount = () => {
        if(!this.props.cruiseList || !this.props.cruiseList.length) this.props.cruiseListRequestSend();
    }

    formatOptionLabel = (option) => {
        let label = option.data.Name === option.data.Nickname ?
            option.data.Name :
            `${option.data.Name} - ${option.data.Nickname}`;

        return label;
    }

    getSelectOptionsFromCruiseList = (list) => {
        return list.map(item => ({
            value: item.Name,
            label: item.Name,
            data: item
        })) || []
    }

    handleCruiseSelect = (selection) => {
        if(selection && selection.data){
            const id = selection.data.ID;
            this.props.cruiseTrajectoryRequestSend(id);
        } else {this.props.cruiseTrajectoryClear()}

        this.setState({...this.state, selectedCruise: selection});
        // this.props.updateParametersFromCruiseBoundary(selection);
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.cruiseList && prevProps.cruiseList.length) && (this.props.cruiseList && this.props.cruiseList.length)){
            this.state.search.addDocuments(this.props.cruiseList);
            this.setState({search: this.state.search})
        }
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') this.setState({...this.state, searchField: searchString});
        if(action.action ==='set-value' || action.action === 'menu-close') this.setState({...this.state, searchField: ''});
    }

    render(){
        const { search, searchField, selectedCruise } = this.state;        
        const { classes, cruiseList} = this.props;
        
        const options = searchField && cruiseList ? this.getSelectOptionsFromCruiseList(search.search(searchField).sort(cruiseSort)) 
            : cruiseList ? this.getSelectOptionsFromCruiseList(cruiseList) 
            : []

        return (
                <div id='cruise-selector' className={classes.outerDiv}>
                    {/* <ConnectedTooltip placement='left' title={tooltips.visualization.cruiseSelector}> */}
                        <Select
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
                                menu: provided => ({ ...provided, zIndex: 9999 }),

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
                        />

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
                                        {selectedCruise.data.Name}
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        Nickname:
                                    </TableCell>
                                    <TableCell className={classes.cruiseInfoCell}>
                                        {selectedCruise.data.Nickname}
                                    </TableCell>
                                </TableRow>

                                {
                                    selectedCruise.data.Start_Time &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Start Date:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.data.Start_Time.slice(0,10)}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.data.End_Time &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            End Date:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.data.End_Time.slice(0,10)}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.data.Chief_Name &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Chief Scientist:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.data.Chief_Name}
                                        </TableCell>
                                    </TableRow>
                                }

                                {
                                    selectedCruise.data.Ship_Name &&
                                    <TableRow>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            Ship:
                                        </TableCell>
                                        <TableCell className={classes.cruiseInfoCell}>
                                            {selectedCruise.data.Ship_Name}
                                        </TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                        
                            <div className={classes.linkWrapper}>
                                <Link 
                                    component={RouterLink} 
                                    to={`/catalog/cruises/${selectedCruise.data.Name}`}
                                    target='_blank'
                                >
                                    Open Cruise Catalog Page
                                </Link>
                            </div>
                        </>
                    }
                </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CruiseSelector));
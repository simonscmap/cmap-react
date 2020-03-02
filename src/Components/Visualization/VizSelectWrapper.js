import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import Select, { components } from 'react-select';
import * as JsSearch from 'js-search';
import { VariableSizeList as ReactWindowList } from "react-window";

import { IconButton, Icon, ListItem, Typography, Button, Tooltip, Popper, ClickAwayListener, Paper} from '@material-ui/core';
import { CloudDownload, Info } from '@material-ui/icons';

import colors from '../../Enums/colors';

import { csvDownloadRequestSend } from '../../Redux/actions/visualization';
import { snackbarOpen } from '../../Redux/actions/ui';

import ConnectedTooltip from '../UI/ConnectedTooltip';

// Must match navDrawerWidth in vizControlPanel component
const navDrawerWidth = 320;

const styles = theme => ({
    selectButton: {
        borderRadius: 0,
        width: '100%',
        height: '56px',
        justifyContent: 'start',
        textTransform: 'none',
        color: theme.palette.primary.main,
        border: '1px solid #313131'
    },

    popperPaper: {
        zIndex: 1300,
        width: '980px',
        maxWidth: '100vw',
        height: '466px',
        boxShadow: '2px 2px 2px 2px #242424',
        borderRadius: '4px',
        backgroundColor: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(5px)',
    },

    popper: {
        top: '-40px !important',
        left: '4px !important',
        zIndex: 1300
    }
});

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    catalog: state.catalog,
    showHelp: state.showHelp,
    datasets: state.datasets,
})

const mapDispatchToProps = {
    csvDownloadRequestSend,
    snackbarOpen
}

const groupHeaderHeight = 37;
const height = 35;

const reactWindowListRef = React.createRef();
const selectRef = React.createRef();

class MenuList extends Component {

    componentDidUpdate = (prevProps, prevState) => {
      if(reactWindowListRef.current) reactWindowListRef.current.resetAfterIndex(0);
      if(!(this.props.children && this.props.children.length)) return;
      let scrollOffset = 0;
      let foundFocus = false;
      this.props.children.forEach(child => {
        if(foundFocus) return;

        let count = groupHeaderHeight;
        let groupHasFocus= false;
        for(let i = 0; i < child.props.children.length; i++){
          if(child.props.children[i].props.isFocused) {
            foundFocus = true;
            groupHasFocus = true;
            break;
          }
          count += 37.6;
        }

        if(groupHasFocus) scrollOffset += count;
        else scrollOffset += 37.6;
      })
      if(foundFocus) reactWindowListRef.current.scrollTo(scrollOffset > 150 ? scrollOffset - 150 : 0);
    }

    render() {
        const { options, children, getValue } = this.props;

        if(!children || !children.length) return '';
        const [value] = getValue();
        const initialOffset = options.indexOf(value) * height;
        const groupHeights = children.map(child => {
          return child.props.children.some(grandChild => grandChild.props.isFocused) ? child.props.children.length * 37.6 + groupHeaderHeight : groupHeaderHeight;
        });
        const totalHeight = groupHeights.reduce((acc, cur) => acc + cur, 0);
        const estimatedItemSize = totalHeight / children.length;
        const getItemSize = index => groupHeights[index];

        return (
            <ReactWindowList
                height={totalHeight < 400 ? totalHeight :  400}
                estimatedItemSize={estimatedItemSize}
                itemCount={children.length}
                itemSize={getItemSize}
                initialScrollOffset={initialOffset || 0}
                ref={reactWindowListRef}
            >
                {({ index, style }) => <div style={{...style}}>{children[index]}</div>}
            </ReactWindowList>
        );
    }
}

class Group extends Component {
    render() {
        const hasFocus = this.props.children.some(element => element.props.isFocused);
        const sensor = this.props.children[0].props.data.data.Sensor;

      return (
          <React.Fragment>
            <CustomHeading 
              {...this.props.headingProps} 
              headingLabel={this.props.data.label} 
              firstChild={this.props.children[0].props.data}
              hasFocus={hasFocus}
              sensor={sensor}
              tableName={this.props.children[0].props.data.data.Table_Name}
              selectProps={this.props.selectProps}
            />
            <div hidden={!hasFocus}>
              {this.props.children.map(child => child)}
            </div>
          </React.Fragment>
        );
    }    
}

const customHeadingStyles = (theme) => ({
    customHeading: {
        backgroundColor: 'rgba(0,0,0,.5)',
        height: groupHeaderHeight,
        '&:hover': {
            // backgroundColor: 'rgba(122,67,0,.5)',
            backgroundColor: colors.greenHover
        },
        boxShadow: '0px 1px 1px 1px #242424'
    },

    icon: {
        marginRight: '10px',
        width: '30px'
    },

    typography: {
        width: '650px'
    }
})

const _CustomHeading = props => {
    const { classes, sensor, selectProps } = props;
    let iconClass;

    if(sensor === 'Satellite') iconClass = 'fa-satellite';
    else if(sensor === 'Blend') iconClass = 'fa-laptop';
    else iconClass = 'fa-ship';

    return (
      <React.Fragment>
        <ListItem 
          button 
          alignItems='center' 
          onClick={() => selectRef.current.select.setState({focusedOption: props.hasFocus ? null : props.firstChild})}
          className={classes.customHeading}
        >
            <Icon fontSize='small' color='inherit' className={`fas ${iconClass} ${classes.icon}`}></Icon>
        <Typography className={classes.typography}>
            {props.headingLabel.length > 70 ? props.headingLabel.slice(0,67) + '...' : props.headingLabel}
        </Typography>

        <Tooltip title='Download Data' placement='right'>
            <IconButton 
                color='inherit' 
                onClick={(e) => {
                    selectProps.handleSetDownloadTarget({dataset: props.headingLabel})
                    e.stopPropagation();
                }}>
                <CloudDownload/>
            </IconButton>
        </Tooltip>

        { selectProps.datasets[props.headingLabel] &&
            <Tooltip title='Dataset Info' placement='right'>
                <IconButton 
                    color='inherit' 
                    onClick={(e) => {
                        window.open(selectProps.datasets[props.headingLabel].Doc_URL);
                        e.stopPropagation();
                    }}
                >
                    <Info/>
                </IconButton>
            </Tooltip>
        }
        </ListItem>
      </React.Fragment>
    )
  }

const CustomHeading = withStyles(customHeadingStyles)(_CustomHeading);

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

const Control = (props) => {
    return (
        <ConnectedTooltip placement='top' title='Hello'>
            <components.Control {...props}/>
        </ConnectedTooltip>
    )
}

const GroupHeading = (props) => '';

const formatOptionLabel = (option, meta) => {
    return option.label;
}

const buttonRef = React.createRef();
const popperRef = React.createRef();

class VizControlPanel extends React.Component {

    constructor(props){
        super(props);

        var search = new JsSearch.Search('ID');
        search.indexStrategy = new JsSearch.AllSubstringsIndexStrategy()
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

        if(props.catalog) search.addDocuments(props.catalog);

        this.state = {
            search,
            searchField: '',
            popperIsOpen: false
        }
    }

    componentDidUpdate = (prevProps) => {
        if(!(prevProps.catalog && prevProps.catalog.length) && (this.props.catalog && this.props.catalog.length)){
            this.state.search.addDocuments(this.props.catalog);
            this.setState({search: this.state.search});
        }
    }

    getSelectOptionsFromCatalogItems = (items) => {
        var options = {};

        items.forEach(item => {
            if(!options[item.Dataset_Name]){
                options[item.Dataset_Name] = {
                    label: item.Dataset_Name,
                    options: []
                }
            }

            options[item.Dataset_Name].options.push({
                value: item.Variable,
                label: item.Long_Name.length < 80 ? item.Long_Name : item.Long_Name.slice(0,78) + '...',
                data: item
            })
        });

        let sortedOptions = Object.values(options).sort((opt1, opt2) => {
            return opt1.label < opt2.label ? -1 : 1;
        })

        return sortedOptions;
    }

    onAutoSuggestChange = (searchString, action) => {
        if(action.action === 'input-change') {
            this.setState({...this.state, searchField: searchString});
            selectRef.current.select.setState({focusedOption: -1})
        }

        if(action.action === 'escape-clear'){
            this.setState({...this.state, searchField: searchString});
            selectRef.current.select.setState({focusedOption: -1})
        }
        // if(action.action ==='set-value') this.setState({...this.state, searchField: ''});
    }

    handleOpenPopper = () => {
        this.setState({...this.state, popperIsOpen: true});
        console.log(selectRef.current)
        // selectRef.current.focus();
    }

    handleClosePopper = () => {
        this.setState({...this.state, popperIsOpen: false});
    }

    handleTogglePopper = () => {
        if(this.state.popperIsOpen) {
            this.handleClosePopper();
        } 
        
        else {
            this.handleOpenPopper();
        }
    }

    handleSelectChoice = (e) => {
        this.props.updateFields(e);
        this.handleClosePopper();
    }
    
    render() {      
        const { search, searchField, popperIsOpen } = this.state;
        
        const { classes, 
            fields,             
            catalog,
            datasets,
        } = this.props;

        const options = searchField && catalog ? this.getSelectOptionsFromCatalogItems(search.search(searchField)) 
            : catalog ? this.getSelectOptionsFromCatalogItems(catalog) 
            : []

        return (
            <div>
                <Button
                    ref={buttonRef}
                    className={classes.selectButton}
                    onClick={this.handleTogglePopper}
                >
                    {fields ? fields.label : 'Select a Variable'}
                </Button>
                    <Popper 
                        open={popperIsOpen} 
                        anchorEl={this.props.controlPanelRef.current} 
                        role={undefined} 
                        transition 
                        className={classes.popper}
                        placement='right-end'
                        popperRef={popperRef}
                    >
                    <ClickAwayListener onClickAway={this.handleClosePopper}>
                        <Paper className={classes.popperPaper}>
                            <Select
                                autoFocus={true}
                                menuIsOpen={popperIsOpen}
                                formatOptionLabel={formatOptionLabel}
                                handleSetDownloadTarget={this.props.handleSetDownloadTarget}
                                handleTableStatsDialogOpen={this.handleTableStatsDialogOpen}
                                onAutoSuggestChange = {this.onAutoSuggestChange}
                                datasets = {datasets}
                                components={{
                                    IndicatorSeparator:'',
                                    DropdownIndicator: '',
                                    GroupHeading,
                                    Group,
                                    Option,
                                    MenuList,
                                    Control
                                }}
                                ref={selectRef}
                                onInputChange={this.onAutoSuggestChange}
                                filterOption={null}
                                controlShouldRenderValue={false}
                                inputValue={this.state.searchField}
                                name="fields"
                                options={options}
                                onChange={this.handleSelectChoice}
                                value={fields}
                                placeholder="Keyword Filter"
                                styles={{
                                    menu: provided => ({
                                        ...provided, 
                                        zIndex: 1300, 
                                        width: '980px',
                                        borderRadius: '4px',
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
                                        border: 'none',
                                        borderBottom: '1px solid #333333',
                                        borderRadius: '4px',
                                        '&:hover': { borderColor: 'none' },
                                        paddingLeft: '24px',
                                        height: '56px',
                                        backgroundColor: 'rgba(0,0,0,.5)',
                                        backdropFilter: 'blur(5px)',
                                        boxShadow: 'none'
                                    }),
                
                                    placeholder: provided => ({...provided,
                                        fontFamily: '"Lato", sans-serif',
                                        color: colors.primary,
                                        fontSize: '14px',
                                        fontWeight: 300
                                    }),
                
                                    option: (provided, { data, isFocused }) => {
                                        return ({...provided,
                                            fontWeight: 400,
                                            fontSize: '16px',
                                            backgroundColor: 'transparent',
                                            color: isFocused ? colors.primary : 'white',
                                            '&:hover': { backgroundColor: colors.greenHover},
                                    })},
                                }}
                                theme={theme => ({
                                    ...theme,
                                    colors: {
                                    ...theme.colors,
                                    },
                                })}
                            />
                        </Paper>
                </ClickAwayListener>
                    </Popper>

            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VizControlPanel));
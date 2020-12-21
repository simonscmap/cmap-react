// Virtualized product list used on viz page for catalog-like and related-data searches
// Each child will be a dataset, which will have variable children

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, TextField, MenuList, MenuItem, InputAdornment, Grid, Tooltip, IconButton, Accordion, AccordionSummary, AccordionDetails, Typography } from '@material-ui/core';
import { Search, List, Layers, DirectionsBoat, CallMissedOutgoing, Info, InsertChart, ExpandMore, Visibility, Computer } from '@material-ui/icons';

import * as JsSearch from 'js-search';
import { VariableSizeList } from 'react-window';

import colors from '../../Enums/colors';
import states from '../../Enums/asyncRequestStates';
import { vizSearchResultsSetLoadingState } from '../../Redux/actions/visualization';

import TableStatsDialog from './TableStatsDialog';

const makeGroupStyles = {
    searchOptionsMenuList: {
        marginTop: '10px',
        maxHeight: '440px',
        overflow: 'auto'
    },

    searchOption: {
        '&:hover': {
            backgroundColor: colors.greenHover
        },

        cursor: 'pointer',
        height: '38px',
        boxShadow: '0px 1px 1px 1px #242424',
        backgroundColor: 'rgba(0,0,0,.4)'
    },

    searchOptionsMenuItem: {
        fontSize: '14px'
    },

    searchOptionsMenuItemText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    heading: {
        textAlign: 'left',
        padding: '16px 6px',
        color: colors.primary,
        fontSize: '18px',
        marginTop: '5px',
        backgroundColor: 'rgba(0,0,0,.4)'
    },

    variableItem: {
        height: '32px',
        paddingLeft: '24px', 
        textAlign: 'left',
        fontSize: '14px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: colors.greenHover
        },
    },

    variablesWrapper: {
        backgroundColor: 'rgba(0,0,0,.2)',
        paddingTop: '8px'
    },

    memberCount: {
        color: colors.primary,
        fontWeight: 'bold'
    }
};

const mapStateToProps = (state, ownProps) => ({
    vizSearchResultsLoadingState: state.vizSearchResultsLoadingState
});

const mapDispatchToProps = {

}

const MakeGroup = connect(mapStateToProps, mapDispatchToProps)(withStyles(makeGroupStyles)(React.memo((props) => {

    const { classes, options, vizSearchResultsLoadingState, handleSelectDataTarget, setTableStatsTarget, listRef, make } = props;
    const [ openIndex, setOpenIndex ] = React.useState(null);

    const handleSetOpenClick = (i) => {
        if(listRef.current) listRef.current.resetAfterIndex(0);
        setOpenIndex(i);
    }

    useEffect(() => {
        if(listRef.current) listRef.current.resetAfterIndex(0);
    }, [options])

    const varCount = options.reduce((acc, cur) => acc + cur.variables.length, 0);

    return (
        <>
        <Typography className={classes.heading}>
        {
            vizSearchResultsLoadingState === states.inProgress ?
            'Searching....' :
            varCount ? `${make} Data - Showing ${varCount} variables in ${options.length} datasets`
            : `${make} Data - No variables found for current search parameters`
        }
        </Typography>
            <VariableSizeList
                ref={listRef}
                itemData={options}
                itemCount={options.length}
                height={props.height || 270}
                width='100%'
                estimatedItemSize={38}
                style={{overflowY: 'scroll'}}
                itemSize={(i) => openIndex === i ? options[i].variables.length * 32 + 38 + 8: 38}
            >
                {({ index, style }) => (
                    <div style={style}>
                        <Grid 
                            container 
                            className={classes.searchOption}
                            onClick={() => index === openIndex ? handleSetOpenClick(null) : handleSetOpenClick(index)}
                        >                                
                            <Grid item xs={9} container alignItems='center' style={{paddingLeft: '8px'}}>
                                <span className={classes.searchOptionsMenuItemText}>{options[index].Dataset_Name || options[index].Dataset_Name}</span>
                            </Grid>

                            <Tooltip title={`Dataset contains ${options[index].variables.length} variables matching the search criteria`}>
                                <Grid item xs={1} className={classes.memberCount} container alignItems='center' justify='center'>
                                    {options[index].variables.length}
                                </Grid>
                            </Tooltip>

                            <Grid item xs={2} style={{paddingLeft: '12px'}} container alignItems='center'>
                                <Tooltip title='Open Product Page'>
                                    <Info style={{color: colors.primary}}/>
                                </Tooltip>
                            </Grid>                            
                        </Grid>
                        
                        {
                            index === openIndex ?
                            <Grid container className={classes.variablesWrapper}>
                                {options[index].variables.map((e, i) => (
                                    <Grid 
                                        item 
                                        xs={12} 
                                        key={e.Long_Name} 
                                        className={classes.variableItem} 
                                        container 
                                        alignItems='center'
                                        onClick={() => handleSelectDataTarget(e)}
                                    >
                                        <Grid item xs={9}>{e.Long_Name}</Grid>
                                        <Grid item xs={3}>
                                            <Tooltip title='View Product Information'>
                                                <Info onClick={(event) => {
                                                        event.stopPropagation();
                                                        setTableStatsTarget(e);
                                                    }}
                                                    style={{marginLeft: '6px', color: colors.primary}}/>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                            : ''
                        }
                    </div>
                )}
            </VariableSizeList>
        </>
    )
})));

const styles = (theme) => ({

});

const observationListRef = React.createRef();
const modelListRef = React.createRef();

// const sortCartFirst

const ProductList = (props) => {

    const { options, classes, handleSelectDataTarget, handleShowMemberVariables, vizSearchResultsLoadingState } = props;
    
    const [ tableStatsTarget, setTableStatsTarget ] = React.useState(null);

    return (
        <React.Fragment>

            {
                tableStatsTarget ? 
                <TableStatsDialog
                    open={Boolean(tableStatsTarget)}
                    onClose={() => setTableStatsTarget(null)}
                    data={tableStatsTarget}
                /> : ''
            }

            <MakeGroup
                make='Observation'
                options={options.Observation}
                setTableStatsTarget={setTableStatsTarget}
                listRef = {observationListRef}
                handleSelectDataTarget={handleSelectDataTarget}
            />

            <MakeGroup
                make='Model'
                options={options.Model}
                setTableStatsTarget={setTableStatsTarget}
                listRef={modelListRef}
                handleSelectDataTarget={handleSelectDataTarget}
            />


        </React.Fragment>
    )
}

export default withStyles(styles)(ProductList);
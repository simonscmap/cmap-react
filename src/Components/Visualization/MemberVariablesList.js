import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { withStyles, IconButton, Typography, Grid, Tooltip } from '@material-ui/core';
import { Close, Info, InsertChart } from '@material-ui/icons';

import { FixedSizeList } from 'react-window';

import TableStatsDialog from './TableStatsDialog';

import colors from '../../Enums/colors';

import { memberVariablesFetch } from '../../Redux/actions/visualization';

const mapStateToProps = (state, ownProps) => ({
    memberVariables: state.memberVariables
})

const mapDispatchToProps = {
    memberVariablesFetch
}

const styles = (theme) => ({
    closeChartIcon: {
        float: 'right',
        // marginTop: '-4px',
        // marginRight: '-2px'
    },

    listHeader: {
        marginTop: '12px',
        padding: '0 8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        // width: '80%'
    },

    searchOptionsMenuItemText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },

    variableWrapper: {
        '&:hover': {
            borderBottom: `1px solid ${colors.primary}`
        }
    }
});

const MemberVariablesList = React.memo((props) => {
    const {
        handleHideMemberVariables,
        handleCreatePlot,
        classes,
        dataset,
        memberVariablesFetch,
        memberVariables
    } = props;

    useEffect(() => {
        if(dataset){
            memberVariablesFetch(dataset.Dataset_ID);
        }
    }, [dataset])

    const [ tableStatsTarget, setTableStatsTarget ] = React.useState(null);

    return dataset ? (
        <React.Fragment>

            {
                tableStatsTarget ? 

                <TableStatsDialog
                    open={Boolean(tableStatsTarget)}
                    onClose={() => setTableStatsTarget(null)}
                    data={tableStatsTarget}
                /> : ''
            }
            
            <IconButton className={classes.closeChartIcon} color="inherit" onClick={handleHideMemberVariables} disableFocusRipple disableRipple>
                <Close style={{color:colors.primary}}/>
            </IconButton>

            <Typography className={classes.listHeader}>
                {dataset.Long_Name} 
            </Typography>

            <Typography style={{marginBottom: '24px'}}>
                Member Variables
            </Typography>

            <FixedSizeList
                    itemData={memberVariables}
                    itemCount={memberVariables.length}
                    height={props.height || 460}
                    width='100%'
                    itemSize={42}
                >
                    {({ index, style }) => (
                        <Grid 
                            container 
                            style={style} 
                            className={classes.variableWrapper}
                            // className={classes.searchOption}
                            // onClick={() => handleSelectDataTarget(options[index])}
                        >

                                <Grid item xs={6} lg={7} container alignItems='center' style={{paddingLeft: '8px'}}>
                                    <span className={classes.searchOptionsMenuItemText}>{memberVariables[index].Long_Name}</span>
                                </Grid>

                                <Grid item xs={5} lg={4} style={{paddingLeft: '12px'}} container alignItems='center'>
                                    <Tooltip title='Show Variable Details'>
                                        <Info 
                                            style={{marginLeft: '3px', cursor: 'pointer', color: colors.primary}} 
                                            onClick={() => setTableStatsTarget(memberVariables[index])}
                                        />
                                    </Tooltip>

                                    {
                                        memberVariables[index].Visualize ?
                                        
                                        <Tooltip title='Create a Plot Using This Variable'>
                                            <InsertChart 
                                                style={{marginLeft: '3px', cursor: 'pointer', color: colors.primary}} 
                                                onClick={(e) => {
                                                    // e.stopPropagation();
                                                    // window.open(`/catalog/${options[index].Name ? 'cruises' : 'datasets'}/${options[index].Name ? options[index].Name : options[index].Short_Name}`, '_blank');
                                                }}
                                            />
                                        </Tooltip> : ''
                                    }
                                </Grid>
                            </Grid>                      
                    )}
                </FixedSizeList>
        </React.Fragment>
    ) : ''
})

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MemberVariablesList));
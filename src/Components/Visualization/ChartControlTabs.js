// Not currently in use

import React from 'react';
import { connect } from 'react-redux';

import { withStyles, Tabs, Tab, Paper, Tooltip, IconButton } from '@material-ui/core';
import { Language, Close } from '@material-ui/icons';

import { deleteChart } from '../../Redux/actions/visualization';

import colors from '../../enums/colors';
import z from '../../enums/zIndex';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
});

const mapDispatchToProps = {
    deleteChart
};

const styles = (theme) => ({
    tabsWrapper: {
        position: 'fixed',
        left: 0,
        top: 70,
        backgroundColor: 'rgba(0,0,0,.6)',
        boxShadow: '2px 2px  2px 2px #242424',
        zIndex: z.CONTROL_PRIMARY,
    },

    tabs: {
        maxWidth: '100vw'
    },

    tab: {
        textTransform: 'none',
        textAlign: 'left',
        boxShadow: '0px 0px  2px 0px #242424',
        color: 'white',
        opacity: 1,
        width: '180px',
        maxHeight: '48px',
        '&:not(:first-child)': {
            borderLeft: '3px solid #242424'
        }
    },

    greenHightlight: {
        color: colors.primary
    },

    closeIcon: {
        fontSize: '20px',
        position: 'absolute',
        left: 156,
        bottom: 28,
        color: 'white',
        borderRadius: '20%',
        '&:hover': {
            backgroundColor: colors.greenHover
        }
    },
})

const ChartControlTabs = (props) => {
    const { classes, plotsActiveTab, handlePlotsSetActiveTab, charts } = props;

    const handleDeleteChart = (e, chartIndex) => {
        e.stopPropagation();
        props.deleteChart(chartIndex);
    }

    return (
            charts && charts.length ?

            <Paper className={classes.tabsWrapper}>
                <Tabs 
                    className={classes.tabs}
                    value={plotsActiveTab}
                    onChange={handlePlotsSetActiveTab}
                    indicatorColor='primary'
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tooltip title='Return to Globe View'>
                        <Tab icon={<Language/>} className={classes.tab} classes={{selected: classes.greenHightlight}} wrapped={true}/>
                    </Tooltip>

                    {charts.map((e, i) => (
                        <Tooltip enterDelay={500} key={e.id} title={e.subType + ' of ' + e.data.metadata.Long_Name + ' from ' + e.data.metadata.Dataset_Name}>
                                <Tab 
                                    label={
                                        <span style={{maxWidth: '140px'}}>
                                            {e.data.metadata.Long_Name.length > 32 ? e.data.metadata.Long_Name.slice(0,30) + '...' : e.data.metadata.Long_Name}

                                            <Tooltip title='Delete plot' placement='top'>
                                                <Close className={classes.closeIcon} onClick={(e) => handleDeleteChart(e, i)}/>
                                            </Tooltip>
                                        </span>
                                    } 
                                    className={classes.tab} 
                                    classes={{selected: classes.greenHightlight}}
                                />
                        </Tooltip>
                    ))}
                </Tabs>
            </Paper>

            : ''
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChartControlTabs));
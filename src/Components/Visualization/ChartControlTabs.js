import React from 'react';
import { connect } from 'react-redux';

import { withStyles, Tabs, Tab, Paper, Tooltip } from '@material-ui/core';
import { Language } from '@material-ui/icons';

import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
});

const mapDispatchToProps = {};

const styles = (theme) => ({
    tabsWrapper: {
        position: 'fixed',
        left: 0,
        top: 70,
        // backgroundColor: colors.backgroundGray,
        backgroundColor: 'rgba(0,0,0,.6)',
        boxShadow: '2px 2px  2px 2px #242424',
        zIndex: 39000
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
        maxWidth: '240px',
        maxHeight: '48px',
        // textOverflow: 'ellipsis',
        // overflow: 'hidden',
        // whiteSpace: 'nowrap',
        '&:not(:first-child)': {
            borderLeft: '3px solid #242424'
        }
    },

    greenHightlight: {
        color: colors.primary
    }
})

const ChartControlTabs = (props) => {
    const { classes, plotsActiveTab, handlePlotsSetActiveTab, charts } = props;

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
                    <Tab icon={<Language/>} className={classes.tab} classes={{selected: classes.greenHightlight}} wrapped={true}/>
                    {charts.map((e, i) => (
                        <Tooltip enterDelay={300} key={e.id} title={<><p>{e.data.metadata.Dataset_Name}</p> <p>{e.data.metadata.Long_Name}</p> <p>{e.subType}</p> </>}>
                            <Tab label={e.data.metadata.Long_Name} className={classes.tab} classes={{selected: classes.greenHightlight}}/>
                        </Tooltip>
                    ))}
                </Tabs>
            </Paper>

            : ''
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChartControlTabs));
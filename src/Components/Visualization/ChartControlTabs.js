import React from 'react';
import { connect } from 'react-redux';

import { withStyles, Tabs, Tab, Paper } from '@material-ui/core';
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
    },

    tab: {
        textTransform: 'none',
        textAlign: 'left',
        boxShadow: '0px 0px  2px 0px #242424',
        color: 'white',
        opacity: 1,
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
                    // className={classes.tabs}
                    value={plotsActiveTab}
                    onChange={handlePlotsSetActiveTab}
                    indicatorColor='primary'
                >
                    <Tab icon={<Language/>} className={classes.tab} classes={{selected: classes.greenHightlight}}/>
                    {charts.map((e, i) => (
                        <Tab label={e.data.metadata.Long_Name} className={classes.tab} classes={{selected: classes.greenHightlight}} key={i}/>
                    ))}
                </Tabs>
            </Paper>

            : ''
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChartControlTabs));
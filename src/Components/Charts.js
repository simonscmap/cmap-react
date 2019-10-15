import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import colors from '../Enums/colors';
import storedProcedures from '../Enums/storedProcedures';
import vizSubTypes from '../Enums/visualizationSubTypes';

import SpaceTimeChart from './ChartComponents/SpaceTimeChart';
import TimeSeriesChart from './ChartComponents/TimeSeriesChart';
import DepthProfileChart from './ChartComponents/DepthProfileChart';
import SectionMapChart from './ChartComponents/SectionMapChart';
import SparseMap from './ChartComponents/SparseMap';

const mapStateToProps = (state, ownProps) => ({
    charts: state.charts
})

const mapDispatchToProps = {

}

const styles = (theme) => ({
    chartsContainer: {
        margin: '300px 0 0 100px'
    },

    chartWrapper: {
        display: 'inline-block',
        backgroundColor: colors.backgroundGray,
        boxShadow: "0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)",
        margin: '20px',
        color: 'white',
    }
})

class Charts extends Component {

    render(){
        const { classes, charts } = this.props;

        return (
            <div className={classes.chartsContainer}>
                {charts.map((chart, index) => {
                    switch(chart.data.parameters.spName){
                        case storedProcedures.spaceTime:
                          if(chart.subType === vizSubTypes.sparse) return <SparseMap chart={chart} key={index}/>
                          else return <SpaceTimeChart chart={chart} key={index}/>

                        case storedProcedures.timeSeries:
                          return <TimeSeriesChart chart={chart} key={index}/>

                        case storedProcedures.depthProfile:
                          return <DepthProfileChart chart={chart} key={index}/>

                        case storedProcedures.sectionMap:
                          return <SectionMapChart chart={chart} key={index}/>
                        
                        default:
                          return '';
                  }
                })}
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts));
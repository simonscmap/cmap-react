import React from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { ExpansionPanel, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { retrieveDataSubmissionsByUser } from '../../Redux/actions/dataSubmission';
import UserDashboardPanelDetails from './UserDashboardPanelDetails';

// import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({
    user : state.user,
    dataSubmissions: state.dataSubmissions
})

const mapDispatchToProps = {
    retrieveDataSubmissionsByUser
}

const styles = theme => ({
    wrapperDiv: {
        width: '90vw',
        margin: '24px auto'
    },

    panelSummaryText: {
        flexBasis: '40%',
        textAlign: 'left',
        paddingRight: '20px',
        fontSize: '.8rem'
    },

})

const UserDashboard = (props) => {

    React.useEffect(() => {
        props.retrieveDataSubmissionsByUser();
    }, [])

    const [ expandedPanel, setExpandedPanel ] = React.useState(false);

    const handleExpansion = (i) => {
        if(expandedPanel === i){
            setExpandedPanel(false);
        }

        else {
            setExpandedPanel(i);
        }
    }

    const { classes, dataSubmissions } = props;

    return (
        <div className={classes.wrapperDiv}>
            {dataSubmissions && dataSubmissions.length ?

            <React.Fragment>                    
                {
                    dataSubmissions.map((e, i) => (
                        <ExpansionPanel 
                            expanded={expandedPanel === i}
                            onChange={() => handleExpansion(i)} 
                            key={i}
                            TransitionProps={{ unmountOnExit: true }}
                        >
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                
                                <Typography noWrap className={classes.panelSummaryText}>
                                    {e.Dataset}
                                </Typography>

                                <Typography noWrap className={classes.panelSummaryText}>
                                    {e.Phase}
                                </Typography>
                            </ExpansionPanelSummary>

                            <UserDashboardPanelDetails 
                                submission={e} 
                            />
                        </ExpansionPanel>
                    ))
                }
            </React.Fragment>
                
                :

                <Typography>
                    No submissions yet...
                </Typography>
            }
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserDashboard));
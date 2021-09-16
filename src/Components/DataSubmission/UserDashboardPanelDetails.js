import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link as RouterLink } from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';

import { AccordionDetails, TextField, Button, Typography, Link, Step, StepLabel, Stepper } from '@material-ui/core';

import { retrieveSubmissionCommentHistory, addSubmissionComment, downloadMostRecentFile } from '../../Redux/actions/dataSubmission';

import Comment from './Comment';

import states from '../../enums/asyncRequestStates';

const styles = (theme) => ({
    panelDetails: {
        display: 'block',
        textAlign: 'left'
    },

    newCommentDiv: {
        width: '70vw',
        margin: '24px auto 0px auto'
    },

    newCommentTextField: {
        flexBasis: 'calc(70vw - 200px)',
        marginRight: '16px'
    },

    postButton: {
        color: 'white',
        marginTop: '16px',
        textTransform: 'none'
    },

    setPhaseButton: {
        color: 'white',
        marginLeft: '12px'
    },

    stepper: {
        borderRadius: '4px',
        margin: '16px 2vw 24px 2vw'
    },

    newUpload: {
        marginLeft: '2vw',
        cursor: 'pointer'
    },

    labelTimeStamp: {
        opacity: .9,
        fontSize: '11px',
        display: 'block'
    }
});

const mapStateToProps = (state, ownProps) => ({
    submissionCommentHistoryRetrievalState: state.submissionCommentHistoryRetrievalState,
    submissionComments: state.submissionComments
});

const mapDispatchToProps = {
    retrieveSubmissionCommentHistory,
    addSubmissionComment,
    downloadMostRecentFile
};

const steps = [
    {
        label: 'Submission',
        timeStampKey: 'Start_Date_Time'
    },

    {
        label: 'Admin Review and Feedback',
        timeStampKey: 'QC1_Completion_Date_Time'
    },

    {
        label: 'Secondary Admin Review',
        timeStampKey: 'QC2_Completion_Date_Time'
    },

    {
        label: 'DOI',
        timeStampKey: 'DOI_Accepted_Date_Time'
    },

    {
        label: 'Ingestion',
        timeStampKey: 'Ingestion_Date_Time'
    }
]

const UserDashboardPanelDetails = (props) => {
    const { classes, submission } = props;

    const [ comment, setComment ] = React.useState();

    let comments = props.submissionComments[submission.Submission_ID];
    let renderComments = Boolean(comments && comments.length);

    let activeStep;

    switch(submission.Phase){
        case 'Awaiting admin action':
            activeStep = 1;
            break;

        case 'Awaiting user update':
            activeStep = 1;
            break;

        case 'Awaiting QC2':
            activeStep = 2;
            break;

        case 'Awaiting DOI':
            activeStep = 3;
            break;

        case 'Awaiting ingestion':
            activeStep = 4;
            break;

        case 'Complete':
            activeStep = 6;
            break;

        default:
            activeStep = 1;        
    }

    useEffect(() => {
        props.retrieveSubmissionCommentHistory(submission.Submission_ID);
    }, []);

    // control this input from redux so we can reset properly, also create connected "NewComment" component
    const handlePostComment = () => {
        props.addSubmissionComment(submission.Submission_ID, comment, 'user');
        setComment('');
    }
    
    return (
        <AccordionDetails className={classes.panelDetails}>
            <Stepper 
                className={classes.stepper} 
                alternativeLabel 
                activeStep={activeStep}
            >
                {steps.map((item, i) => {
                        return (
                            <Step key={i}>
                                <StepLabel>
                                    {item.label}
                                    <span className={classes.labelTimeStamp}>{submission[item.timeStampKey] && activeStep > i ? submission[item.timeStampKey].slice(0, 10) : ''}</span>
                                </StepLabel>
                            </Step>
                        )
                    })} 
            </Stepper>

            <Typography className={classes.newUpload}>
                <Link component={RouterLink} to={`/datasubmission/validationtool?submissionID=${encodeURIComponent(submission.Submission_ID)}`}>Update</Link> this submission.
            </Typography>

            <Typography className={classes.newUpload}>
                <Link component='span' onClick={() => props.downloadMostRecentFile(submission.Submission_ID)}>Download</Link> the most recent version.
            </Typography>

            {
                props.submissionCommentHistoryRetrievalState === states.inProgress ?
                'Loading Comments.....' : 

                <React.Fragment>
                    {
                        renderComments && comments.map((e,i) => (
                            <Comment comment={e} key={i}/>
                        ))
                    }
                </React.Fragment>
            }
            <div className={classes.newCommentDiv}>
                <TextField
                    multiline
                    rows={4}
                    variant='outlined'
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    fullWidth
                />

                <Button 
                    variant='contained' 
                    color='primary' 
                    className={classes.postButton}
                    onClick={handlePostComment}
                >
                    Post Message
                </Button>
            </div>
        </AccordionDetails>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserDashboardPanelDetails));
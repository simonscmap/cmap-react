import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { ExpansionPanelDetails, TextField, Button } from '@material-ui/core';

import { retrieveSubmissionCommentHistory, addSubmissionComment } from '../../Redux/actions/dataSubmission';

import Comment from './Comment';

import states from '../../Enums/asyncRequestStates';

const styles = (theme) => ({
    panelDetails: {
        display: 'block'
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
        marginTop: '16px'
    }
});

const mapStateToProps = (state, ownProps) => ({
    submissionCommentHistoryRetrievalState: state.submissionCommentHistoryRetrievalState,
    submissionComments: state.submissionComments
});

const mapDispatchToProps = {
    retrieveSubmissionCommentHistory,
    addSubmissionComment
};

const AdminDashboardPanelDetails = (props) => {
    const { classes } = props;

    const [ comment, setComment ] = React.useState();

    let comments = props.submissionComments[props.submission.Submission_ID];
    let renderComments = Boolean(comments && comments.length);

    useEffect(() => {
        props.retrieveSubmissionCommentHistory(props.submission.Submission_ID);
    }, []);

    // control this input from redux so we can reset properly, also create connected "NewComment" component
    const handlePostComment = () => {
        props.addSubmissionComment(props.submission.Submission_ID, comment);
        setComment('');
    }

    return (
        <ExpansionPanelDetails className={classes.panelDetails}>
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
                    rows={2}
                    variant='outlined'
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    // className={classes.newCommentTextField}
                    fullWidth
                />

                <Button 
                    variant='contained' 
                    color='primary' 
                    className={classes.postButton}
                    onClick={handlePostComment}
                >
                    Post Comment
                </Button>
            </div>
        </ExpansionPanelDetails>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AdminDashboardPanelDetails));
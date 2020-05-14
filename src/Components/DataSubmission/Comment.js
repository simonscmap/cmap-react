import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { Grid } from '@material-ui/core';

const styles = (theme) => ({
    commentArea: {
        backgroundColor: 'rgba(0,0,0,.2)',
        width: '70vw',
        margin: "0 auto",
        padding: '12px 16px',
        textAlign: 'left'
    },

    commenterAndDateTime: {
        marginTop: '16px',
        width: 'calc(70vw + 32px)',
        padding: '4px 0',
        margin: '0 auto',
        textAlign: 'left',
        color: theme.palette.primary.main,
        fontSize: 12
    },
});

const Comment = (props) => {
    const { classes } = props;
    const { Comment, Commenter, Comment_Date_Time } = props.comment;

    return (
        <React.Fragment>
            <div className={classes.commenterAndDateTime}>
                {Commenter} at {Comment_Date_Time}
            </div>

            <div className={classes.commentArea}>              
                {Comment}
            </div>
        </React.Fragment>
    )
}

export default withStyles(styles)(Comment);

//Commenter
//Comment_Date_Time
//Comment
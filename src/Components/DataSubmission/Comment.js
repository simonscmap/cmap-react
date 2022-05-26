// Comment component used in user and admin dashboard

import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  commentArea: {
    backgroundColor: 'rgba(0,0,0,.2)',
    margin: '0 auto',
    padding: '12px 16px',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
  },

  commenterAndDateTime: {
    marginTop: '16px',
    padding: '4px 0',
    margin: '0 auto',
    textAlign: 'left',
    color: theme.palette.primary.main,
    fontSize: 12,
  },
});

const Comment = (props) => {
  const { classes } = props;
  const { Comment, Commenter, Comment_Date_Time } = props.comment;

  let dateTime = new Date(Comment_Date_Time).toLocaleString();

  return (
    <React.Fragment>
      <div className={classes.commenterAndDateTime}>
        {Commenter} at {dateTime}
      </div>

      <div className={classes.commentArea}>{Comment}</div>
    </React.Fragment>
  );
};

export default withStyles(styles)(Comment);

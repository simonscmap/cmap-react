// Comment component used in user and admin dashboard

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { SERVER_TZ_OFFSET } from '../../constants';

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

// Comment_Date_Time is automatically set by the database, which is EST (-4)
// When constructing a Date, it javascript will intepret it as GMT (0).

const DataSubmissionComment = (props) => {
  const { classes } = props;
  const { Comment, Commenter, Comment_Date_Time } = props.comment;

  // on the west coast,
  // this date will be UTC -5, interpreted as PST -7
  let d = new Date(Comment_Date_Time);

  let originalString = d.toLocaleString();

  let utcHours = d.getUTCHours();

  let adjustHours = - SERVER_TZ_OFFSET; // correct UTC to server time offset

  d.setUTCHours(utcHours + adjustHours);

  let localDateString = d.toLocaleString();

  console.log(`orginal:   ${originalString}\n`,
              `utc H:     ${utcHours}\n`,
              `adjust H:  ${adjustHours}\n`,
              `final:     ${localDateString}\n`);

  return (
    <React.Fragment>
      <div className={classes.commenterAndDateTime}>
        {Commenter} at {localDateString}
      </div>

      <div className={classes.commentArea}>{Comment}</div>
    </React.Fragment>
  );
};

export default withStyles(styles)(DataSubmissionComment);

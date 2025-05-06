import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { colors } from '../../Home/theme';
import clsx from 'clsx';

const StoryStatus = withStyles({
  spacer: {
    width: '140px',
    display: 'flex',
    flexDirection: 'row',
  },
  chip: {
    borderRadius: '20px',
    padding: '6px 14px',
    border: 0,
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  statusHidden: {
    backgroundColor: 'gray',
    color: 'white',
  },
  statusDraft: {
    backgroundColor: colors.purple.dark,
    border: `1px solid ${colors.blue.dark}`,
    color: 'white',
  },
  statusPreview: {
    backgroundColor: colors.blue.royal,
    color: 'white',
    border: `1px solid #ffffff`,
  },
  statusPublished: {
    backgroundColor: colors.green.lime,
    color: colors.blue.dark,
  },
})(({ classes, status }) => {
  let statuses = ['Hidden', 'Draft', 'Preview', 'Published'];
  return (
    <div className={classes.spacer}>
      <div className={clsx(classes['status' + statuses[status]], classes.chip)}>
        {statuses[status]}
      </div>
    </div>
  );
});

export default StoryStatus;

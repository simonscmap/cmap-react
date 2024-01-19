// Step 1: Workbook validaition contents
// Note: state is kept it parent ValidationTool.js

import React from 'react';
import {
  Typography,
  Paper,
  List, ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  ErrorOutline,
} from '@material-ui/icons';

import styles from './ValidationToolStyles';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (styles);

const errorOutlineStyle = {
  color: 'rgba(255, 0, 0, .7)',
  margin: '0 2px -5px 0',
  fontSize: '1.4em',
};

const Step = (props) => {
  const classes = useStyles();

  const { step, auditReport } = props;

  if (step !== 1) {
    return <React.Fragment />;
  }

  return (
    <Paper elevation={2} className={`${classes.workbookAuditPaper}`}>
    <Typography style={{ marginBottom: '24px' }}>
    {Boolean(auditReport.workbook.errors.length) && (
      <React.Fragment>
      One or more parts of your submission did not match CMAP's
                      requirements. Please review the information below, update
                      your workbook, and{' '}
                      <label
                        className={classes.linkLabel}
                        htmlFor="select-file-input"
                      >
                        try again
                      </label>
                      .
                    </React.Fragment>
                  )}

                  {Boolean(
                    !auditReport.workbook.errors.length &&
                     auditReport.workbook.warnings.length,
                  ) && 'We found some potential issues with your submission.'}

                  {Boolean(auditReport.workbook.warnings.length) && (
                    <React.Fragment>
                      {'\n'}
                      {'\n'}
                      Messages marked with a yellow icon
                      <ErrorOutline style={errorOutlineStyle} />
                      are warnings. These should be reviewed and corrected if
                      necessary, but will not prevent you from moving to the
                      next validation step.
                    </React.Fragment>
                  )}
                </Typography>

                {
                  <List dense={true}>
                    {auditReport.workbook.errors.map((e, i) => (
                      <ListItem key={i}>
                        <ListItemIcon style={{ color: 'rgba(255, 0, 0, .7)' }}>
                          <ErrorOutline />
                        </ListItemIcon>
                        <ListItemText primary={e} />
                      </ListItem>
                    ))}

                    {auditReport.workbook.warnings.map((e, i) => (
                      <ListItem key={i}>
                        <ListItemIcon style={{ color: 'rgba(255, 255, 0, .7)' }} >
      <ErrorOutline />
      </ListItemIcon>
      <ListItemText primary={e} />
      </ListItem>
))}
</List>
}
</Paper>
);
};

export default Step;

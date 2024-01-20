import React from 'react';
import {
  ArrowBack,
  ArrowForward,
} from '@material-ui/icons';
import { Typography, Button, Tooltip, Badge } from '@material-ui/core';

import { validationSteps } from './ValidationToolConstants';


import styles from './ValidationToolStyles';
import { makeStyles, withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles (styles);

const getStepLabel = (step) => {
  return validationSteps[step] && validationSteps[step].label || '';
}

const StyledBadgeRed = withStyles(() => ({
  badge: {
    right: -11,
    top: 1,
    backgroundColor: 'rgba(255, 0, 0, .6)',
  },
}))(Badge);

const StyledBadgeGreen = withStyles((theme) => ({
  badge: {
    right: -11,
    top: 1,
    backgroundColor: theme.palette.primary.main,
  },
}))(Badge);

const StepBadge = (props) => {
  const { errors, text } = props;
  if (errors) {
    return <StyledBadgeRed badgeContent={errors}>{text}</StyledBadgeRed>;
  } else {
    return <StyledBadgeGreen>{text}</StyledBadgeGreen>;
  }
}

const Navigation = (props) => {
  const classes = useStyles();

  const { file, step, datasetName, errorCount, changeStep, auditReport } = props;

  const workbookErrors = auditReport && auditReport.workbook.errors.length;

  const errorSum = Object.keys(errorCount).reduce((acc, curr) => {
      return acc + errorCount[curr];
    }, 0);
  const hideSelectDifferentFile = step >= validationSteps.length;

  const preventSubmission = Boolean(
    step >= 5 || (step === 1 && errorCount.workbook) || (step === 4 &&
     (errorCount.data > 0 ||
      errorCount.dataset_meta_data > 0 ||
      errorCount.vars_meta_data > 0)),
  );

  const forwardArrowTooltip =
    step === 0 || step > validationSteps.length
                       ? ''
                       : (errorCount.data > 0 ||
                          errorCount.dataset_meta_data > 0 ||
                          errorCount.vars_meta_data > 0) &&
    step === validationSteps.length - 1
    ? 'Please Correct Errors to Proceed'
    : 'Next Section';

  if (!Boolean(file)) {
    return (<React.Fragment>
      <Typography variant="h5">
        To begin drag or
        <label htmlFor="select-file-input">
          <Button
            variant="contained"
            color="primary"
            component="span"
            className={classes.button}
           >
             Select File
           </Button>
         </label>
       </Typography>
     </React.Fragment>);
  }

  return (
    <React.Fragment>
      <Typography
        variant="h6"
        className={classes.currentlyViewingTypography}
      >
        Dataset Name: {datasetName ? `${datasetName}` : '*Short Name Not Found*'}
        { hideSelectDifferentFile ? '' : (
          <>
            <label htmlFor="select-file-input" className={classes.chooseNewFileLabel}>
              Select a Different File
            </label>
            {' '}{'\n'}
          </>
        )}
      </Typography>

      <div className={classes.navigationButtons}>
        { step > 1 &&
        <Tooltip title="Previous Section">
          <div className={classes.ilb}>
          <Button
          size="small"
          color="secondary"
          variant="contained"
          onClick={() => changeStep(step - 1)}
          disabled={Boolean(step <= 1)}
          startIcon={<ArrowBack />}
          >
          <StepBadge errors={step === 2 ? workbookErrors : step === 3 ? errorSum : null} text={`Back to ${getStepLabel(step - 1)}`} />
            </Button>
          </div>
          </Tooltip>
        }

        <Typography variant="h5" className={classes.currentSectionSpan}>
          Step {step}: {validationSteps[step].label}
        </Typography>

        { step < validationSteps.length - 1 &&
        <Tooltip title={forwardArrowTooltip}>
          <div className={classes.ilb}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => changeStep(step + 1)}
              disabled={preventSubmission}
              endIcon={<ArrowForward />}
            >
              {`Next: ${getStepLabel(step + 1)}`}
            </Button>
          </div>
          </Tooltip>
        }
      </div>
    </React.Fragment>
  );
};

export default Navigation;

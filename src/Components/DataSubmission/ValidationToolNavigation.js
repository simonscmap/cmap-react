import React from 'react';
import {
  ArrowBack,
  ArrowForward,
} from '@material-ui/icons';
import { Typography, Button, Tooltip, Badge } from '@material-ui/core';

import { StepButton } from './ChooserComponents/Buttons';
import { validationSteps } from './ValidationToolConstants';
import styles from './ValidationToolStyles';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import ErrorStatus from './ValidationToolErrorStatus';

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
  const cl = useStyles();

  const { file, step, datasetName, errorCount, changeStep, auditReport } = props;

  const workbookErrors = auditReport && auditReport.workbook.errors.length;

  const errorSum = Object.keys(errorCount).reduce((acc, curr) => {
      return acc + errorCount[curr];
    }, 0);

  const hideSelectDifferentFile = step >= validationSteps.length;

  const preventNext = Boolean(
    step >= 5
    || (step === 4 && (errorSum > 0))
    || (step === 0 && !file)
  );

  const onLastStep = step >= validationSteps.length;
  const hasErrors = errorSum > 0;
  const onUploadStep = step === 0;

  const forwardArrowTooltip =
    onUploadStep
    ? 'Upload File to Proceed'
    : onLastStep && hasErrors
    ? 'Correct Errors to Proceed'
    : `Next: ${getStepLabel(step + 1)}`;

  const backArrowTooltip =
    onUploadStep ? 'No Prior Step' : `Back to ${getStepLabel (step - 1)}`

  // TODO udpate header part to show:
  // 1 dataset name & id & type
  //
  return (
    <div className={cl.navigationWrapper}>
      <div className={cl.navigationButtons}>
        <Tooltip title={backArrowTooltip}>
          <div className={cl.refHolder}>
            <StepButton
              size="small"
              color="primary"
              variant="contained"
              onClick={() => changeStep(step - 1)}
              disabled={step === 0}
              startIcon={<ArrowBack />}
              className={cl.stepButton}
            >
              <StepBadge
                errors={step === 2 ? workbookErrors : step === 3 ? errorSum : null}
                text={'Back'}
              />
            </StepButton>
          </div>
        </Tooltip>

        <Tooltip title={forwardArrowTooltip}>
          <div className={cl.refHolder}>
            <StepButton
              size="small"
              color="primary"
              variant="contained"
              onClick={() => changeStep(step + 1)}
              disabled={preventNext}
              endIcon={<ArrowForward />}
              className={cl.stepButton}
            >
              {'Next'}
            </StepButton>
          </div>
        </Tooltip>
    </div>
    <ErrorStatus
      step={step}
      errorCount={errorCount}
    />
    </div>
  );
};

export default Navigation;

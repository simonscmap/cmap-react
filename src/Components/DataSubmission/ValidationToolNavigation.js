import React from 'react';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { Tooltip, Badge } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { StepButton } from './ChooserComponents/Buttons';
import { validationSteps } from './ValidationToolConstants';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import states from '../../enums/asyncRequestStates';
import ErrorStatus from './ValidationToolErrorStatus';
import DataStatus from './ValidationToolDataSummary';

const useStyles = makeStyles((theme) => ({
  navigationWrapper: {
    color: 'white',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: '1em',
    flexWrap: 'wrap',
  },
  navigationButtons: {
    padding: '2em 2em 1em 0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2em',
  },
  refHolder: {
    // I'm here so that a my tooltip parent will render
    // https://stackoverflow.com/questions/57527896/material-ui-tooltip-doesnt-display-on-custom-component-despite-spreading-props
  },
  stepButton: {
    '&:disabled': {
      color: '#ffffff7d',
      border: `2px solid ${theme.palette.secondary.dark}`,
    },
  },
  rightSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: '3em',
    justifyContent: 'center',
    marginBottom: '2em',
  },
}));

const getStepLabel = (step) => {
  return (validationSteps[step] && validationSteps[step].label) || '';
};

const StyledBadgeRed = withStyles(() => ({
  badge: {
    right: -11,
    top: -11,
    backgroundColor: 'rgb(255, 0, 0)',
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
};

const Navigation = (props) => {
  const cl = useStyles();

  const { file, step, changeStep, summary } = props;

  const submissionUploadState = useSelector(
    (state) => state.submissionUploadState,
  );
  const auditReport = useSelector((state) => state.auditReport);
  const errorCount = auditReport && auditReport.errorCount;
  const errorSum = (errorCount && errorCount.sum) || 0;
  const workbookErrors = auditReport && auditReport.workbook.errors.length;

  // const fatal = auditReport && auditReport.fatal;

  const preventAll = submissionUploadState === states.succeeded;
  const preventBack = step === 0 || preventAll;
  const preventNext = Boolean(step >= 3 || (step === 0 && !file) || preventAll);

  const onLastStep = step >= validationSteps.length;
  const hasErrors = errorSum > 0;
  const onUploadStep = step === 0;

  const forwardArrowTooltip = onUploadStep
    ? 'Upload File to Proceed'
    : onLastStep && hasErrors
      ? 'Correct Errors to Proceed'
      : `Next: ${getStepLabel(step + 1)}`;

  const backArrowTooltip = onUploadStep
    ? 'No Prior Step'
    : `Back to ${getStepLabel(step - 1)}`;

  if (submissionUploadState === states.succeeded) {
    return <div className={cl.navigationWrapper}></div>;
  }

  return (
    <div className={cl.navigationWrapper}>
      <div className={cl.navigationButtons}>
        <div className={cl.refHolder}>
          <Tooltip title={backArrowTooltip}>
            <StepButton
              size="small"
              color="primary"
              variant="contained"
              onClick={() => changeStep(step - 1)}
              disabled={preventBack}
              startIcon={<ArrowBack />}
              className={cl.stepButton}
            >
              <StepBadge
                errors={
                  step === 2 ? workbookErrors : step === 3 ? errorSum : null
                }
                text={'Back'}
              />
            </StepButton>
          </Tooltip>
        </div>

        <div className={cl.refHolder}>
          <Tooltip title={forwardArrowTooltip}>
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
          </Tooltip>
        </div>
      </div>

      <div className={cl.rightSection}>
        <DataStatus step={step} summary={summary} />
        <ErrorStatus step={step} />
      </div>
    </div>
  );
};

export default Navigation;

import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

const StepAssistant = (props) => {
  const location = useLocation();

  const { step: currentStep, changeStep } = props;

  useEffect(() => {
    if (location && location.hash) {
      const h = location.hash;
      const indicatesStep = h.slice(1, -1) === 'step'; // hash has form of "#stepN" where N is a digit
      if (indicatesStep) {
        const stepIndicated = parseInt(h.slice(-1), 10);
        if (isNaN(stepIndicated)) {
          return;
        } else if (stepIndicated !== currentStep) {
          changeStep(stepIndicated);
        }
      }
    }
  }, [location]);

  return '';
};

export default StepAssistant;

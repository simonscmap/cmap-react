import React from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import { Tune } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '../../../../Redux/actions/ui';

const ErrorBars = (props) => {
  let { visible, setVisible} = props;
  let dispatch = useDispatch();

  let handleShowErrorBars = () => {
    dispatch(setLoadingMessage('Re-rendering'));
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      setVisible(!visible);
    }, 50);
  };

  return (
    <ControlButtonTemplate
      tooltipContent={visible ? 'Hide Error Bars' : 'Show Error Bars'}
      active={visible}
      onClick={handleShowErrorBars}
      icon={Tune}
    />
  );
};

export default ErrorBars;

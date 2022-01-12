import React from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import { useDispatch } from 'react-redux';
import { setLoadingMessage } from '../../../../Redux/actions/ui';

const GenericToggleControl = (props) => {
  let { toggleState, setToggleState, tooltipConfig, icon } = props;
  let { whenOn, whenOff } = tooltipConfig;
  let dispatch = useDispatch();

  let handleClick = () => {
    dispatch(setLoadingMessage('Re-rendering'));
    setTimeout(() => {
      window.requestAnimationFrame(() => dispatch(setLoadingMessage('')));
      setToggleState(!toggleState);
    }, 50);
  };

  return (
    <ControlButtonTemplate
      tooltipContent={toggleState ? whenOn : whenOff }
      active={toggleState}
      onClick={handleClick}
      icon={icon}
    />
  );
};

export default GenericToggleControl;

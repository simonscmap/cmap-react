import React from 'react';
import ControlButtonTemplate from './ControlButtonTemplate';
import MoreIcon from '@material-ui/icons/More';

const PersistModeBar = (props) => {
  let { setPersist, persistModeBar } = props;
  return (
    <ControlButtonTemplate
      tooltipContent={'Persist Visual Controls'}
      onClick={() => setPersist(!persistModeBar)}
      icon={MoreIcon}
      active={!!persistModeBar}
    />
  );
};

export default PersistModeBar;

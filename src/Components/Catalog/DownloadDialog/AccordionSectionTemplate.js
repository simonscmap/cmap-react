// Template for creating new accordion sections for download dialog

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const AccordionSection = (props) => {
  let { ControlComponent, name, summary, ExpandedContent } = props;
  //
  let [expanded, setExpanded] = React.useState(false);

  let toggle = (e) => {
    console.log('set expanded', e);
    setExpanded(!expanded);
  };

  console.log(expanded);

  return (
    <div>
      <div>
        <div onClick={toggle} className={'expand-control'}>
          {name}
          {expanded ? 'close' : 'open'}
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
      </div>
      <div hidden={!expanded}>
        <ExpandedContent />
      </div>
    </div>
  );
};

export default AccordionSection;

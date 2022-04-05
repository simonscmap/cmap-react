import React, { useState } from 'react';
import { withStyles } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ResizeObserver from 'react-resize-observer';
import docLinks from './doc-links';

let styles = (theme) => ({
  docsWrapper: {
    margin: '100px 1em 0 1em',
    color: 'white',
  },
});

const Docs = (props) => {
  let { classes } = props;

  let [innerAccordionWidth, setInnerAccordionWidth] = useState(500);

  let onResize = (rect) => {
    let { width } = rect;
    setInnerAccordionWidth(width - 16 * 2);
  };

  let [expanded, setExpanded] = React.useState(false);

  let handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.docsWrapper}>
      <ResizeObserver onResize={onResize}></ResizeObserver>
      <h1>The Docs</h1>

      <Accordion expanded={expanded === 'py'} onChange={handleChange('py')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-python-docs-content"
          id="panel1-python-docs-header"
        >
          <Typography>Python</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <iframe
            id="python"
            title="CMAP Read the Docs: Python"
            width={innerAccordionWidth}
            height={window.innerHeight - 400}
            src={docLinks.py}
          ></iframe>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'r'} onChange={handleChange('r')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-r-docs-content"
          id="panel2-r-docs-header"
        >
          <Typography>R</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <iframe
            id="r"
            title="CMAP Read the Docs: R"
            width={innerAccordionWidth}
            height={window.innerHeight - 400}
            src={docLinks.r}
          ></iframe>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'julia'}
        onChange={handleChange('julia')}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-julia-docs-content"
          id="panel3-julia-docs-header"
        >
          <Typography>Julia</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <iframe
            id="julia"
            title="CMAP Read the Docs: Julia"
            width={innerAccordionWidth}
            height={window.innerHeight - 400}
            src={docLinks.julia}
          ></iframe>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'matlab'}
        onChange={handleChange('matlab')}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-matlab-docs-content"
          id="panel3-matlab-docs-header"
        >
          <Typography>Matlab</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <iframe
            id="matlab"
            title="CMAP Read the Docs: Matlab"
            width={innerAccordionWidth}
            height={window.innerHeight - 400}
            src={docLinks.matlab}
          ></iframe>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default withStyles(styles)(Docs);

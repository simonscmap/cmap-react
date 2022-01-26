import React from 'react';
import { withStyles } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

let styles = (theme) => ({
  docsWrapper: {
    margin: '100px 1em 0 1em',
    color: 'white',
  },
});

const Docs = (props) => {
  let { classes } = props;
  return (
    <div className={classes.docsWrapper}>
      <h1>The Docs</h1>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-python-docs-content"
          id="panel1-python-docs-header"
        >
          <Typography>Python</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>Python Stuff</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-r-docs-content"
          id="panel2-r-docs-header"
        >
          <Typography>R</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>R stuff</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-julia-docs-content"
          id="panel3-julia-docs-header"
        >
          <Typography>Julia</Typography>
        </AccordionSummary>
        <AccordionDetails>Julia Stuff</AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-matlab-docs-content"
          id="panel3-matlab-docs-header"
        >
          <Typography>Matlab</Typography>
        </AccordionSummary>
        <AccordionDetails>Matlab</AccordionDetails>
      </Accordion>
    </div>
  );
};

export default withStyles(styles)(Docs);

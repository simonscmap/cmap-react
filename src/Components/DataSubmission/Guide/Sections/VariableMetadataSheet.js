import React from 'react';
import Typography from '@material-ui/core/Typography';
import { sectionStyles } from '../guideStyles';
import { GuideLink } from '../Links';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        A dataset can contain multiple different measurements (variables).
        This sheet (labeled as <code>vars_meta_data</code>) holds a list of top-level
        attributes about these variables such as the variable name, unit,
        and description. Each variable along with its attributes
        (metadata) is stored in separate rows. Below is the list of these
        attributes along with their descriptions. Please review the
        example datasets listed in the  <GuideLink href="#resources">Resources</GuideLink> section for more
        information.
      </Typography>
    </div>
  );
};

export default Content;

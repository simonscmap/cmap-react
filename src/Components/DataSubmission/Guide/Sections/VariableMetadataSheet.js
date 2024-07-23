import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        A dataset can contain multiple different measurements (variables).
        This sheet (labeled as &quot;vars_meta_data&quot;) holds a list of top-level
        attributes about these variables such as the variable name, unit,
        and description. Each variable along with its attributes
        (metadata) is stored in separate rows. Below is the list of these
        attributes along with their descriptions. Please review the
        example datasets listed in the&nbsp;
        <Link href="#resources">resources</Link> section for more
        information.
      </Typography>
    </div>
  );
};

export default Content;

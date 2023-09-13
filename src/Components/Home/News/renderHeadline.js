import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Link } from 'react-router-dom';

import renderText from './renderText';
import isSPALink from './isSPALink';
import toA from './createAnchorElement';

const renderHeadline = (headline, link) => {
  let parsedText = renderText(headline);
  if (isSPALink(link)) {
    return (
      <Typography variant="h2">
        <Link to={link} data-type="link">
          {parsedText}
        </Link>
      </Typography>
    );
  } else {
    return <Typography variant="h2">{toA([parsedText, link, 0])}</Typography>;
  }
};

export default renderHeadline;

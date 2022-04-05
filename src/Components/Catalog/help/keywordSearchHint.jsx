import React from 'react';
import SeeAlso from './seeAlso';
import InlineVideo from '../../Help/InlineVideo';
import HintContent from '../../Help/HintContent';

const KeywordSearchHint = () => {
  return (
    <HintContent>
      <h3>Keyword Search</h3>
      <p>
        All variables at Simons CMAP catalog are annotated with a collection of
        semantically related keywords. Enter any keyword into the text field and
        a list of datasets that are annotated with similar keywords are
        displayed on the panel to the right. The keywords should be separated by
        blank space. The search result is not sensitive to the order of keywords
        and is not case sensitive. The keywords can describe any aspect
        associated with the target variables. Below are a few examples:
      </p>
      <ul>
        <li>
          The linguistic variable name (Nitrate), or its atomic term (NO3)
        </li>
        <li>
          Methodology (model, satellite), instrument (CTD, seaflow), or
          disciplines (physics, biology), the cruise official name (e.g.
          KOK1606), or unofficial cruise name (Falkor)
        </li>
        <li>
          The name of the data producer (e.g Penny Chisholm) or institution name
          (MIT)
        </li>
      </ul>
      <h3>Video Tutorial</h3>
      <InlineVideo src={'https://player.vimeo.com/video/599815510'} />

      <hr />
      <SeeAlso />
    </HintContent>
  );
};

export default KeywordSearchHint;

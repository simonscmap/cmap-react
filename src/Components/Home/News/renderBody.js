import React from 'react';
import { Link } from 'react-router-dom';
import toA from './createAnchorElement';
import isSPALink from './isSPALink';
import renderText from './renderText';

/* Example body object

{
  "content": "*Body* content /with various/ text _styles_ added.\n\n/And  _nested_ styles too./ {0}",
  "links": [
    {
      "text": "Test link",
      "url": "http://text.npr.org"
    }
  ]
}
 */

// intercalate jsx links/a into body text
const renderBody = (body) => {
  let links = [];
  if (body && body.links && Array.isArray(body.links)) {
    links = body.links.map(({ text, url }, i) => {
      if (isSPALink(url)) {
        return (
          <Link key={i} to={url} data-type="link">
            {text}
          </Link>
        );
      } else {
        return toA([text, url, i]);
      }
    });
  }
  let bodyText = [];
  if (body && body.content && typeof body.content === 'string') {
    bodyText = body.content.split(/\{\d\}/).map(renderText);
  }
  let content = [];
  for (let i = 0; i < bodyText.length - 1; i++) {
    let span = <span key={`span:${i}`}>{bodyText[i]}</span>;
    content.push(span);
    if (links[i]) {
      content.push(links[i]);
    }
  }
  return content;
};

export default renderBody;

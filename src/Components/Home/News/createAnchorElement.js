import React from 'react';

const toA = ([text, href, i]) => (
  <a key={i} target="_blank" rel="noreferrer" href={href} data-type="anchor">
    {text}
  </a>
);

export default toA;

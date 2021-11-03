import React from 'react';

const KeywordSearchHint = () => {
  return (
    <div styles={'hint-content-wide-600'}>
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
      <iframe
        width="592"
        height="333"
        src="https://player.vimeo.com/video/599815510"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        allowFullScreen="true"
      />
      <hr />
      <h3>See Also</h3>
      <ul>
        <li>
          <a
            href="https://github.com/simonscmap/pycmap/blob/master/docs/SearchCatalog.ipynb"
            target="_blank"
          >
            Search Simons CMAP catalog using Python client (pycmap)
          </a>
        </li>
        <li>
          <a
            href="https://github.com/simonscmap/CMAP.jl/blob/5ae0a5b4125db09414fd36580a56a427a1ddd8da/src/metaMethods.jl#L28"
            target="_blank"
          >
            Search Simons CMAP catalog using Julia client (CMAP.jl)
          </a>
        </li>
        <li>
          <a
            href="https://github.com/simonscmap/matcmap/blob/f02ad2dbec4b896f721675399a432deee395658a/src/CMAP.m#L186"
            target="_blank"
          >
            Search Simons CMAP catalog using MATLAB client (matcmap)
          </a>
        </li>
      </ul>
    </div>
  );
};

export default KeywordSearchHint;

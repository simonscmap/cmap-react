import React from 'react';

const SearchHint = () => {
  return (
    <div>
      <h3>Search</h3>
      <p>
        All variables in the Simons CMAP catalog are annotated with a collection
        of semantically related keywords. Enter any keyword into the text field
        and a list of datasets that are annotated with similar keywords are
        displayed on the panel to the right. The keywords should be separated by
        a blank space. The search result is not sensitive to the order of the
        keywords and is not case sensitive. The keywords can describe any aspect
        associated with the target variables. Below are a few examples:
      </p>
      <ul>
        <li>
          The linguistic variable name (Nitrate), or its atomic term (NO3)
        </li>
        <li>
          Methodology (model, satellite), instrument (CTD, seaflow), or
          disciplines (physics, biology), the official cruise name (e.g.
          KOK1606), or unofficial cruise name (Falkor)
        </li>
        <li>
          The name of data producer (e.g Penny Chisholm) or institution name
          (MIT)
        </li>
      </ul>
    </div>
  );
};

export default SearchHint;

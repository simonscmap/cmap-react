import React from 'react';

export default () => {
  return (
    <div>
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

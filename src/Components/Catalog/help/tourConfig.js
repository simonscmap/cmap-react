const intro = {
  initialStep: 0,
  steps: [
    {
      element: '#catSearch',
      intro: `<p style="text-align:justify">
                 Find datasets/variables by providing relevant keywords such as dataset, variable, cruise, project, PI names.
                 The order and casing of the keywords are not important.
                </p>
                <b>Example:</b>
                <span class="technical-text">nitrate argo</span>
               `,
    },
    {
      element: '#catSearchOptions',
      intro: 'Specify data attributes to narrow down the catalog.',
    },
    {
      element: '#catSearchBySpaceTime',
      intro: 'Restrict the list of datasets to a spatio-temporal bounding box.',
    },
    {
      element: '#catSearchReset',
      intro: 'Remove all catalog filters and display the entire catalog.',
    },
    {
      element: '#catalog-search-result-count',
      intro: 'Found datasets:  Shows the number of datasets matching the search and filters specified.  These datasets are listed directly below.',
    },
    {
      element: '#catalog-results-download',
      intro: 'Download search results: Download a csv formatted file containing metadata for all listed datasets.'
    },
    {
      element: '#catalog-dataset-title-link',
      intro: 'Dataset name link:  Opens the catalog page for a given dataset to access detailed dataset information and links to download the dataset and metadata.',
    },
    {
      element: '#catalog-add-to-cart',
      intro: 'Add to favorites:  Add dataset to favorites list, located in top right of screen.  ‘Favorite’ datasets are listed first on the data visualization page.',
    },
    {
      element: '#nav-help-toggle-button',
      intro: 'Find additional help'
    }
  ],
};

export default intro;

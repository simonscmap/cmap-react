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
      element: '#additional-filters-button',
      intro: 'Open filter controls, where you can also specify space and time constraints.'
    },
    {
      element: '#catalog-search-result-count',
      intro:
        'Found datasets:  Shows the number of datasets matching the search and filters specified.  These datasets are listed directly below.',
    },
    {
      element: '#catalog-results-download',
      intro:
        'Download search results: Download a csv formatted file containing metadata for all listed datasets.',
    },
    {
      element: '#catalog-dataset-title-link',
      intro:
        'Dataset Name:  Opens the catalog page for a given dataset to access detailed dataset information and links to download the dataset and metadata.',
    },
    {
      element: '#subscribe-dataset-control',
      intro: 'Click to subscribe to email notifications when there is news related to this dataset.',
    },
    {
      element: '#downoload-button',
      intro: 'Download data from this dataset.',
    },
    {
      element: '#catalog-recommendations-panel',
      intro: 'See popular, renently viewed, and recommeneded datasets based on datasets you have used (requires you to be logged in).',
    },
    {
      element: '#nav-help-toggle-button',
      intro: 'Find additional help',
    },
  ],
};

export default intro;

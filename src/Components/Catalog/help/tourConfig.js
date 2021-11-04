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
  ],
};

export default intro;

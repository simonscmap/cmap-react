import { setDataSearchMenuVisibility } from '../../../Redux/actions/visualization';

const onBeforeChange = (nextStepIndex) => {
  // before the second step, open the search menu
  if (nextStepIndex === 1) {
    return () => setDataSearchMenuVisibility(true);
  }
  return null;
};

const visualizationTourConfig = {
  initialStep: 0,
  onBeforeChange,
  steps: [
    {
      element: '#viz-select-primary-variable',
      intro: `<p>
All variables in the Simons CMAP catalog are annotated with a collection of semantically related keywords. Enter any keyword into the text field and a list of datasets that are annotated with similar keywords are displayed on the panel to the right.
              </p>
              `,
    },
    {
      element: '#charts-and-plots-search-field', // '#viz-data-search-controls',
      intro: `<p>
              Search: All variables in the Simons CMAP catalog are annotated with a collection of semantically related keywords. Enter relevant keywords such as dataset name, variable, cruise, project, PI names and the list of datasets in the panel on the right will be restricted to those datasets that are annotated with similar keywords.
              </p>
              <p>Example: 'nitrate argo'</p>`,
    },
    {
      element: '#charts-and-plots-search-sensor-filter',
      intro: `<p>Filters: Refine the dataset list by dataset make (observation or model), sensor used to collect the data, and/or ocean region.</p>`,
    },
    {
      element: '#charts-and-plots-search-additional-filters',
      intro: `<p>Show additional filters: Restrict the listed datasets to show only those that include data within specified time and space boundaries.
</p>`,
    },
    {
      element: '#charts-and-plots-search-reset-filters',
      intro: `<p>Reset filters: Remove all filters to display the full dataset list.</p>`,
    },
    {
      element: '#Observation-data-results-header',
      intro: `<p>Observation dataset list:  Shows the number of observation based datasets that match the search and filters specified.  These datasets are listed in the panel directly below.</p>`,
    },
    {
      element: '#Model-data-results-header',
      intro: `<p>Model dataset list:  Shows the number of model based datasets that match the search and filters specified.  These datasets are listed in the panel directly below. </p>`,
    },
    {
      element: '#Observation-variable-count-label',
      intro: `<p>Variable count: Indicates the number of variables matching the specified search and filters that are found within each listed dataset.</p>`,
    },
    {
      element: '#Observation-results-wrapper div.list-entry:first-child div.dataset-details-button',
      intro: `<p>Dataset name link:  Expands to reveal the list of variables within the dataset that match the specified search and filters.  Click on a variable to select that variable for plotting.</p>`,
    },
    {
      element: '#nav-help-toggle-button',
      intro: 'Help: Select help at any time to access additional help.',
    },
  ],
};

export default visualizationTourConfig;

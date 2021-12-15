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
      element: '#viz-data-search-controls',
      intro: 'Use search filters to narrow search results',
    },
    {
      element: '#nav-help-toggle-button',
      intro: 'Find additional help',
    },
  ],
};

export default visualizationTourConfig;

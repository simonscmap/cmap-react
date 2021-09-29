import keywordSearchHint from './keywordSearchHint';
import makeControlHint from './makeControlHint';

const hints = [
  {
    element: '#catSearch',
    hint: keywordSearchHint,
    hintPosition: 'middle-right',
  },
  {
    element: '#make-control',
    hint: makeControlHint,
    hintPosition: 'middle-right',
  },
  {
    element: '#catSearchBySpaceTime',
    hint: 'Restrict the list of datasets to a spatio-temporal bounding box.',
    hintPosition: 'middle-right',
  },
];

export default hints;

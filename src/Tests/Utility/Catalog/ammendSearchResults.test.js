import ammendResults, {
  CONTINUOUSLY_UPDATED,
  ANCILLARY_DATA,
} from '../../../Utility/Catalog/ammendSearchResultsWithDatasetFeatures';


const mockResults1 = [
  { Table_Name: 'tblOne'},
  { Table_Name: 'tblTwo'},
  { Table_Name: 'tblThr'},
  { Table_Name: 'tblFou'},
  { Table_Name: 'tblFiv'},
];

// The API ensures the keys to dataset-features are lower case;
// The function will fail to update keys that are not lower case
const mockDatasetFeatures1 = {
  tbltwo: { ci: true },
  tblthr: { ancillary: true},
  tblfou: { ci: true, ancillary:true },
};

describe('ammend search results with dataset features', () => {
  test('handles base (expected) case correctly', () => {
    let r1 = ammendResults(mockResults1, mockDatasetFeatures1);
    let expected = [
      { Table_Name: 'tblOne', DataFeatures: [] },
      { Table_Name: 'tblTwo', DataFeatures: [CONTINUOUSLY_UPDATED] },
      { Table_Name: 'tblThr', DataFeatures: [ANCILLARY_DATA] },
      { Table_Name: 'tblFou', DataFeatures: [CONTINUOUSLY_UPDATED, ANCILLARY_DATA] },
      { Table_Name: 'tblFiv', DataFeatures: [] },
    ];
    expect(r1).toEqual(expected);
  });

});

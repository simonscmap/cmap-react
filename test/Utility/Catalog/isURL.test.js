// https://www.bodc.ac.uk/data/documents/nodb/578889/

import { isStringURL } from '../../../Components/Catalog/VariablesTable/datagridHelpers';

describe('correctly identifies urls', () => {
  test('test url', () => {
    let isURL = isStringURL ("https://www.bodc.ac.uk/data/documents/nodb/578889/");
    expect(isURL).toEqual(true);
  });
});

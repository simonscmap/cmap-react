import parse from 'csv-parse/lib/sync';
import stringifyCatalogSearchResults, {
  CATALOG_SEARCH_RESULTS_COLUMNS,
} from '../catalogSearchResultsCsv';

describe('stringifyCatalogSearchResults', () => {
  it('exports only the backend-compatible columns in their expected order', () => {
    const description = 'First paragraph.\n\nSecond paragraph.';
    const csv = stringifyCatalogSearchResults([
      {
        Product_Type: 'Dataset',
        Short_Name: 'Example',
        Description: description,
        Dataset_ID: 42,
        DataFeatures: [],
        productType: 'duplicate camelCase field',
        description: 'duplicate camelCase description',
      },
    ]);
    const records = parse(csv, { columns: true });

    expect(Object.keys(records[0])).toEqual(CATALOG_SEARCH_RESULTS_COLUMNS);
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      Product_Type: 'Dataset',
      Short_Name: 'Example',
      Description: description,
      Dataset_ID: '42',
      DataFeatures: '[]',
    });
    expect(csv).not.toContain('duplicate camelCase field');
    expect(csv).not.toContain('duplicate camelCase description');
  });
});

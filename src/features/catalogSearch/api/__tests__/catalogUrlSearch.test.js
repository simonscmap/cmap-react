import {
  createCatalogDataset,
  createCatalogUrlSearchQuery,
} from '../catalogUrlSearch';

describe('createCatalogUrlSearchQuery', () => {
  it('maps catalog URL filters to a paginated local search query', () => {
    expect(
      createCatalogUrlSearchQuery(
        {
          keywords: ['sea', 'surface', 'temperature'],
          timeStart: '1981-01-01',
          timeEnd: '2020-12-31',
          latStart: '-90',
          latEnd: '90',
          lonStart: '170',
          lonEnd: '-170',
          sensor: [' AVHRR', 'VIIRS '],
          make: 'NOAA',
          region: ['North Pacific', 'Arctic'],
          hasDepth: 'no',
        },
        2000,
      ),
    ).toEqual({
      searchMode: 'like',
      phraseMatch: false,
      includePartialOverlaps: true,
      limit: 2000,
      offset: 2000,
      useRanking: true,
      excludeFields: ['description'],
      text: 'sea surface temperature',
      spatial: {
        latMin: -90,
        latMax: 90,
        lonMin: 170,
        lonMax: -170,
      },
      temporal: {
        timeMin: '1981-01-01',
        timeMax: '2020-12-31',
      },
      dateRangePreset: 'Custom Range',
      region: ['North Pacific', 'Arctic'],
      sensors: ['AVHRR', 'VIIRS'],
      makes: ['NOAA'],
      hasDepth: false,
    });
  });

  it('supports an unfiltered catalog search with empty query params', () => {
    expect(createCatalogUrlSearchQuery({})).toMatchObject({
      limit: 2000,
      offset: 0,
      excludeFields: ['description'],
    });
  });

  it('trims whitespace from selected sensor URL parameters', () => {
    expect(
      createCatalogUrlSearchQuery({ sensor: ' CTD' }).sensors,
    ).toEqual(['CTD']);
  });

  it('rejects malformed numeric filters instead of silently ignoring them', () => {
    expect(() =>
      createCatalogUrlSearchQuery({ latStart: 'north' }),
    ).toThrow('Invalid numeric catalog search parameter: latStart');
  });
});

describe('createCatalogDataset', () => {
  it('restores the legacy catalog card fields from SQLite metadata', () => {
    expect(
      createCatalogDataset({
        datasetId: 42,
        shortName: 'SST',
        longName: 'Sea Surface Temperature',
        metadata: {
          tableName: 'tblSST',
          sensors: 'AVHRR, VIIRS',
          hasDepth: false,
          latMin: -10,
          lonMax: 180,
        },
      }),
    ).toMatchObject({
      Dataset_ID: 42,
      Short_Name: 'SST',
      Long_Name: 'Sea Surface Temperature',
      Table_Name: 'tblSST',
      Sensors: ['AVHRR', 'VIIRS'],
      Has_Depth: 0,
      Lat_Min: -10,
      Lon_Max: 180,
      DataFeatures: [],
    });
  });

  it('trims whitespace around sensor names from SQLite metadata', () => {
    const dataset = createCatalogDataset({
      metadata: { sensors: 'CTD, ADCP,  Oxygen' },
    });

    expect(dataset.Sensors).toEqual(['CTD', 'ADCP', 'Oxygen']);
  });
});

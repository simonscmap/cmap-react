import buildSearchOptionsFromDatasetList from '../../../Utility/Catalog/buildSearchOptionsFromDatasetList';

// example args
import { ex1, ex2, ex3 } from '../../TestUtils/mockBuildSearchOptionsProps';


describe('buildSearchOptionsFromDatasetList', () => {
  test('handles base case correctly', () => {
    let r1 = buildSearchOptionsFromDatasetList (ex1.results, ex1.storedOptions, ex1.params);

    let expectedOptions = {
      Temporal_Resolution: [ 'Any', 'Irregular' ],
      Spatial_Resolution: [ 'Any', 'Irregular' ],
      Data_Source: [
        'Any',
        'Dave Karl Lab, University of Hawaii at Manoa',
        'http://www.argodatamgt.org/'
      ],
      Distributor: [
        'Any',
        'Center for Microbial Oceanography: Research & Education; Data System (cmoreDS), University of Hawaii',
        'https://data-argo.ifremer.fr'
      ],
      Process_Level: [ 'Any', 'Reprocessed' ],
      Make: [ 'Observation' ],
      DataFeatures: [],
      Sensor: [
        'Autoanalyzer',
        'Backscatter Sensor',
        'Coulometer',
        'CTD',
        'Elemental Analyzer',
        'Flow Cytometer',
        'HPLC',
        'Ion Sensitive Field Effect Transistor',
        'Optode',
        'Potentiometric Titration',
        'Radiometer',
        'Spectrophotometer',
        'Turbidity Sensor',
        'Ultraviolet Absorbance Detector',
        'Uncategorized',
        'Winkler Titration'
      ],
      Region: []
    };

    expect(r1).toEqual(expectedOptions);
  });


  test('handles initial search case correctly', () => {
    // the searchOptions and params in this test are
    // an example after searching the catalog with the keyword "oxygen"
    let r2 = buildSearchOptionsFromDatasetList (ex2.results, ex2.storedOptions, ex2.params);

    let expectedOptions = {
      Temporal_Resolution: [ 'Any', 'Irregular' ],
      Spatial_Resolution: [ 'Any', 'Irregular' ],
      Data_Source: [
        'Any',
        'Dave Karl Lab, University of Hawaii at Manoa',
        'http://www.argodatamgt.org/'
      ],
      Distributor: [
        'Any',
        'Center for Microbial Oceanography: Research & Education; Data System (cmoreDS), University of Hawaii',
        'https://data-argo.ifremer.fr'
      ],
      Process_Level: [ 'Any', 'Reprocessed' ],
      Make: [ 'Observation' ],
      DataFeatures: [],
      Sensor: [
        'Autoanalyzer',
        'Backscatter Sensor',
        'Coulometer',
        'CTD',
        'Elemental Analyzer',
        'Flow Cytometer',
        'HPLC',
        'Ion Sensitive Field Effect Transistor',
        'Optode',
        'Potentiometric Titration',
        'Radiometer',
        'Spectrophotometer',
        'Turbidity Sensor',
        'Ultraviolet Absorbance Detector',
        'Uncategorized',
        'Winkler Titration'
      ],
      Region: []
    };

    expect(r2).toEqual(expectedOptions);
  });

  test('handles search with selected param correctly', () => {
    // the searchOptions and params in this test are
    // an example after searching the catalog with the keyword "oxygen"
    let r3 = buildSearchOptionsFromDatasetList (ex3.results, ex3.storedOptions, ex3.params);

    let expectedOptions = {
      Temporal_Resolution: [ 'Any', 'Irregular' ],
      Spatial_Resolution: [ 'Any', 'Irregular' ],
      Data_Source: [
        'Any',
        'Dave Karl Lab, University of Hawaii at Manoa',
        'http://www.argodatamgt.org/'
      ],
      Distributor: [
        'Any',
        'Center for Microbial Oceanography: Research & Education; Data System (cmoreDS), University of Hawaii',
        'https://data-argo.ifremer.fr'
      ],
      Process_Level: [ 'Any', 'Reprocessed' ],
      Make: [ 'Observation' ],
      DataFeatures: [],
      Sensor: [
        'Autoanalyzer',
        'Backscatter Sensor',
        'Coulometer',
        'CTD',
        'Elemental Analyzer',
        'Flow Cytometer',
        'HPLC',
        'Ion Sensitive Field Effect Transistor',
        'Optode',
        'Potentiometric Titration',
        'Radiometer',
        'Spectrophotometer',
        'Turbidity Sensor',
        'Ultraviolet Absorbance Detector',
        'Uncategorized',
        'Winkler Titration'
      ],
      Region: []
    };

    expect(r3).toEqual(expectedOptions);
  });

});

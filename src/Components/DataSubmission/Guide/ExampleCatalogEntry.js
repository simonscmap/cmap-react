import React from 'react';

import { SearchResultPure } from '../../Catalog/SearchResult';

// mock dataset
const mockDataset = {
  Product_Type: 'Dataset',
  Short_Name: 'Influx_Underway_TN428_2024v1_0',
  Long_Name: 'Discrete Flow Cytometry of Underway Samples From TN428 Using a BD Influx Cell Sorter',
  Description: 'The dataset consists of BD Influx-based analysis of phytoplankton populations from discrete flow cytometry data collected underway during a transit cruise (TN428) from American Samoa to Australia. The data consists of cell abundance, cell size (equivalent spherical diameter), carbon quota, and carbon biomass for picophytoplankton populations, namely the cyanobacteria Prochlorococcus, Synechococcus and Crocosphaera, and small eukaryotic phytoplankton (<5 µm ESD). Time is in UTC format, latitude and longitude are in decimal degrees, and depth is in meters. Further information can be found here: [https://github.com/fribalet/FCSplankton](https://github.com/fribalet/FCSplankton)',
  Icon_URL: 'https://raw.githubusercontent.com/simonscmap/static/master/mission_icons/tblInflux_Underway_TN428_2024v1_0.png',
  Dataset_Release_Date: '2024-06-12T00:00:00.000Z',
  Dataset_History: '',
  Dataset_Version: 'v1.0',
  Table_Name: 'tblInflux_Underway_TN428_2024v1_0',
  Process_Level: 'Reprocessed',
  Make: 'Observation',
  Data_Source: 'Armbrust Lab, University of Washington',
  Distributor: 'Armbrust Lab, University of Washington',
  Acknowledgement: 'Data provided by: Kelsy Cain and François Ribalet, Armbrust lab, University of Washington',
  Dataset_ID: 799,
  Spatial_Resolution: 'Irregular',
  Temporal_Resolution: 'Irregular',
  Study_Domain: 'Biology+Biogeochemistry',
  Lat_Min: -38.6427,
  Lat_Max: -19.267,
  Lon_Min: -177.9452,
  Lon_Max: 179.6241,
  Depth_Min: 5,
  Depth_Max: 5,
  Time_Min: '2024-01-15T06:36:31.000Z',
  Time_Max: '2024-01-22T19:04:29.000Z',
  Sensors: [
    'Flow Cytometer'
  ],
  Visualize: 1,
  Row_Count: 14,
  Regions: 'Indian Ocean,South Pacific Ocean',
  References: 'https://github.com/fribalet/FCSplankton$$$https://doi.org/10.5281/zenodo.12636479',
  DataFeatures: []
};

const Example = () => {
  return (
      <SearchResultPure
    dataset={mockDataset}
    fullDataset={{}}
    onDownloadClick={() => null}
    setDownloadDialogOpen={() => null}
    downloadDialogOpen={false}
    features={{}}
    style={{}}
    index={0}
      />
  );
};

export default Example;

import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { sectionStyles } from '../guideStyles';

import { SearchResultPure } from '../../../Catalog/SearchResult';

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

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography key={'0'}>
        The <code>dataset_long_name</code> is a descriptive and human-readable name for the dataset. This name will identify your dataset in the CMAP Catalog and in the Visualization search dialog.
      </Typography>
      <Typography>
        Any Unicode character may be used here, but please avoid names longer than 200 characters as they may get trimmed when displayed on graphical interfaces.
      </Typography>
      <Typography key={'3'}>
        A full textual description of your dataset, with no length limits, is entered in the <Link href="#dataset_description-column">dataset_description</Link> field.
      </Typography>
      <Typography key={'3'}>
        If your dataset is associated with a cruise, we recommend including the official cruise and the cruise nickname in the <code>dataset_long_name</code>. For example: Underway CTD Gradients 3 KM1906. Capitalizing the <code>dataset_long_name</code> is also recommended.
      </Typography>

      <div className={cl.subHeader}>
        Exapmles
      </div>
      <Typography>
        Here are examples of how the <code>dataset_long_name</code> will appear within SimonsCMAP.
      </Typography>
      <div className={cl.standoutBox}>
        <div className={cl.standoutBadge}>Example Catalog Entry</div>
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
      </div>

      <div className={cl.standoutBox} style={{ background: 'black' }}>
        <div className={cl.standoutBadge}>Example Visualization Page Search Interface</div>
          <img
            src={'/images/cmap_long_name_in_viz_search.png'}
            alt={'Dataset Long_name in Visualization Page'}
          />
      </div>
    </div>
  );
};

export default Content;

// {
//                                                                              ],
//     plainText: [
//       `The dataset_long_name is a descriptive and human-readable name for the dataset. This name will identify your dataset in the CMAP
//                 catalog and visualization search dialog. Any Unicode character can be used here, but please avoid names longer than 200 characters as they may get
//                 trimmed when displayed on graphical interfaces. A full textual description of your dataset, with no length limits,
//                 is entered in the dataset_description. If your dataset is associated with a cruise, we recommend including the official cruise and the
//                 cruise nickname in the dataset_long_name. For example: Underway CTD Gradients 3 KM1906. Capitalizing the dataset_long_name is also recommended.`,
//     ],
//     bullets: ['Required: Yes', 'Constraint: Less than 200 characters'],
//     images: [
//       {
//         src: '/images/cmap_long_name_in_viz_search.png',
//         alt: 'Dataset Long_name in Visualization Page',
//         caption:
//         'Figure 3. The "dataset_long_name" appears in the visualization page search dialog.',
//         id: 'fig-3',
//       },
//     ],
//   }

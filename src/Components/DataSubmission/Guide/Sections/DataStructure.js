import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { RxDotFilled } from "react-icons/rx";

import { CustomAlert } from '../Alert';
import { sectionStyles } from '../guideStyles';

const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        The CMAP data template consists of three sheets: <em>data</em>, dataset metadata, and variable metadata.
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Data is stored in the first sheet labeled “data”.
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Metadata that describes the dataset is entered in the second sheet called “dataset_meta_data”.
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Metadata associated with the variables in the dataset are entered in the third sheet labeled “vars_meta_data”.
          </ListItemText>
        </ListItem>
      </List>
      <Typography>
        Information must be provided for all  columns except those specifically noted as optional.
      </Typography>

      <CustomAlert severity="info">
        <Typography>
          The data and metadata field names (e.g. time, lat, lon, short_name, long_name, ...) used in the template file are based on the CF and COARDS naming conventions.
        </Typography>
        <ul>
          <li>
            <Link href="http://cfconventions.org/cf-conventions/cf-conventions.html">
              NetCDF Climate and Forecast (CF) Metadata Conventions
            </Link>
          </li>
          <li>
            <Link href="https://ferret.pmel.noaa.gov/noaa_coop/coop_cdf_profile.html">Conventions for the standardization of NetCDF files</Link>
          </li>
          <li>
            <Link href="https://ferret.pmel.noaa.gov/Ferret/documentation/coards-netcdf-conventions">COARDS NetCDF Conventions</Link>
          </li>

        </ul>
      </CustomAlert>
    </div>
  );
};

export default Content;

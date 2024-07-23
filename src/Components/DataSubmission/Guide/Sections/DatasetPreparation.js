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
import { DownloadTemplateLink } from '../DownloadTemplate';


const Content = () => {
  const cl = sectionStyles();
  return (
    <div className={cl.container}>
      <Typography>
        The CMAP data template (<DownloadTemplateLink text="download here"/>) is an Excel file that consists consists of three sheets: <em>data</em>, <em>dataset metadata</em>, and <em>variable metadata</em>.
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Data is stored in the first sheet labeled <code>data</code>.
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Metadata describing the dataset is entered in the second sheet called <code>dataset_meta_data</code>.
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemIcon><RxDotFilled/></ListItemIcon>
          <ListItemText>
            Metadata associated with the variables in the dataset are entered in the third sheet labeled <code>vars_meta_data</code>.
          </ListItemText>
        </ListItem>
      </List>
      <Typography>
        Information must be provided for all columns except those specifically noted as optional.
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

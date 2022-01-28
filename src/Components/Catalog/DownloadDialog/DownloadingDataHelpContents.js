import React from 'react';
import { Typography } from '@material-ui/core';

const DownloadingDataHelpContents = (props) => {

    return (
        <React.Fragment>
            <Typography>
                This component allows you to download a csv file containing data from this dataset. Depending on the size of the dataset you may be able to 
                download it in its entirety, or may need to specify a subset using the sliders or form fields, the minimum and maximum values of which
                represent the dataset's spatial and temporal boundaries.
            </Typography>

            <Typography>
                If the subset is too large you will see text instructing you to reduce the size of the subset, as below:
            </Typography>

            <img 
                src='/images/help_catalog_downloading_data_too_large.png' 
                style={{
                    margin: '20px auto',
                    display: 'block',
                    width: '480px',
                    maxWidth: '80vw'
                }}
                alt='Subset Too Large Example'
            />

            <Typography>
                Adjust the any of subset parameters until the download size is within the allowed range, and click "Download Subset":
            </Typography>

            <img 
                src='/images/help_catalog_downloading_data_valid.png' 
                style={{
                    margin: '20px auto',
                    display: 'block',
                    width: '480px',
                    maxWidth: '80vw'
                }}
                alt='Valid Download Example'
            />
        </React.Fragment>
    )
}

export default DownloadingDataHelpContents;
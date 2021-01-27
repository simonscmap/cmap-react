import React from 'react';
import { connect } from 'react-redux';

import ReactMarkdown from 'react-markdown';

import { withStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, Link, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { datasetSummaryFetch } from '../../Redux/actions/visualization';

import colors from '../../Enums/colors';

const styles = theme => ({
    dialogPaper: {
        backgroundColor: colors.backgroundGray,
        // width: '700px',
        minWidth: '700px',
        maxWidth: '60vw',
        // zIndex: 3000
    },

    markdown: {
        '& img': {
            maxWidth: '100%',
            margin: '20px auto 20px auto',
            display: 'block'
        },
        '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none'
        },

        '& p': {
            lineHeight: 1.25
        }
    }
})

const mapStateToProps = (state, ownProps) => ({
    datasetSummary: state.datasetSummary
})

const mapDispatchToProps = {
    datasetSummaryFetch
}

const DatasetInfoDialog = (props) => {
    const { datasetSummary, classes, datasetSummaryFetch, datasetSummaryID, setDatasetSummaryID } = props;

    React.useEffect(() => {
        datasetSummaryFetch(datasetSummaryID);
    }, [datasetSummaryID]);

    const handleClose = () => {
        setDatasetSummaryID(null);
        datasetSummaryFetch(null);
    }

    return (
        <Dialog
            style={{zIndex: 5000}}
            open={Boolean(datasetSummaryID)}
            onClose={handleClose}
            PaperProps={{
                className: classes.dialogPaper
            }}
        >
            <DialogTitle>{datasetSummary ? datasetSummary.Dataset_Long_Name : <Skeleton/>}</DialogTitle>
            <DialogContent>
                {
                    datasetSummary ?
                    <ReactMarkdown source={datasetSummary.Description} className={classes.markdown}/> :
                        <>
                        <Typography><Skeleton/></Typography>
                        <Typography><Skeleton/></Typography>
                        <Typography><Skeleton/></Typography>
                        <Typography><Skeleton/></Typography>
                    </>                    
                }
            </DialogContent>

            <DialogContent style={{padding: '16px 24px'}}>{
                datasetSummary ?
                    <span>
                        Detailed information for this dataset and its member variables is available
                        <Link target='_blank' href={`/catalog/datasets/${datasetSummary.Dataset_Name}`}> here</Link>.  
                    </span> 
                : 
                <Skeleton/>
            }                
            </DialogContent>
        </Dialog>
    )
    // <>
    //     <Skeleton><Typography variant='h3'></Typography></Skeleton>
    //     <Skeleton><Typography variant='h1'></Typography></Skeleton>
    //     <Skeleton width={500} height={800}></Skeleton>
    // </> 
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DatasetInfoDialog));
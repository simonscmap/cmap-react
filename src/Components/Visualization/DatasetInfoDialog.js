// Dialog opened when clicking the info icon next to a dataset in viz search

import React from 'react';
import { connect } from 'react-redux';

import ReactMarkdown from 'react-markdown';

import { withStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, Link, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { datasetSummaryFetch } from '../../Redux/actions/visualization';

import colors from '../../Enums/colors';
import z from '../../Enums/zIndex';

const styles = theme => ({
    dialogPaper: {
        backgroundColor: colors.backgroundGray,
        minWidth: '700px',
        maxWidth: '60vw',
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
            style={{zIndex: z.NON_HELP_DIALOG}}
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
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DatasetInfoDialog));
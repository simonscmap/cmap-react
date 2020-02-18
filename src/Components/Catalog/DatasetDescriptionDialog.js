import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

import ReactMarkdown from 'react-markdown';

import colors from '../../Enums/colors';

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: colors.solidPaper
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
        }
    }
})

class DatasetDescriptionDialog extends Component {

    // state = {
    //     references: []
    // }

    render() {
        const { description, classes, datasetName, clearDescription } = this.props;
        // const { references } = this.state;

        return (
            <React.Fragment>
                { description ?
                <Dialog 
                    open={Boolean(description)} 
                    onClose={clearDescription} 
                    maxWidth={false}
                    PaperProps={{
                        className: classes.dialogPaper
                    }}
                >
                    <DialogTitle>{datasetName}</DialogTitle>
                    <DialogContent>
                        <ReactMarkdown source={description} className={classes.markdown}/>
                    </DialogContent>

                    {/* {references &&
                        <DialogContent>
                            <strong>References: {references.length}</strong>
                        </DialogContent>
                    } */}
                </Dialog> :
                ''
                }
            </React.Fragment>
        )

    }
}

export default (withStyles(styles)(DatasetDescriptionDialog));
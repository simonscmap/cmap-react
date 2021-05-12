import React from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

import colors from '../../Enums/colors';

const styles = (theme) => ({
    dialogPaper: {
        backgroundColor: colors.solidPaper,
        padding: '8px 16px 16px 16px'
    }
})

const mapStateToProps = (state, ownProps) => ({
    catalog: state.catalog
})

const VariableDescriptionDialog = (props) => {
    const { catalog, describedVariable, classes } = props;
    let variable = catalog.find((item) => item.ID === describedVariable);

    return (
        <React.Fragment>
            { describedVariable ?
            <Dialog 
                open={Boolean(describedVariable)} 
                onClose={props.clearDescription} 
                maxWidth={false}
                PaperProps={{
                    className: classes.dialogPaper
                }}
            >
                <DialogTitle>{variable.Long_Name}</DialogTitle>
                { variable.Comment &&
                <DialogContent>
                    {variable.Comment}
                </DialogContent>
                }
            </Dialog> :
            ''
            }
        </React.Fragment>
    )
}

export default connect(mapStateToProps, null)(withStyles(styles)(VariableDescriptionDialog));
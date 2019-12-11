import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

const styles = (theme) => ({

})

const mapStateToProps = (state, ownProps) => ({
    catalog: state.catalog
})

const mapDispatchToProps = {

}

const VariableDescriptionDialog = (props) => {
    const { catalog, describedVariable } = props;
    let variable = catalog.find((item) => item.ID === describedVariable);

    return (
        <React.Fragment>
            { describedVariable ?
            <Dialog open={Boolean(describedVariable)} onClose={props.clearDescription} maxWidth={false}>
                <DialogTitle>{variable.Long_Name}</DialogTitle>
                { variable.Comment &&
                <DialogContent>
                    {variable.Comment}
                </DialogContent>
                }
                
                <DialogContent>
                    <strong>Source:</strong> {variable.Data_Source}
                </DialogContent>

                <DialogContent>
                <strong>Distributor:</strong> {variable.Distributor}
                </DialogContent>
            </Dialog> :
            ''
            }
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VariableDescriptionDialog));
// Form for updating user password in profile

import React from 'react';
import { connect } from 'react-redux';

import { Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import colors from '../../enums/colors';

import { changePasswordRequestSend } from '../../Redux/actions/user';
import { hideChangePasswordDialog } from '../../Redux/actions/ui';

const mapStateToProps = (state, ownProps) => ({
    user: state.user
})

const mapDispatchToProps = {
    changePasswordRequestSend,
    hideChangePasswordDialog
}

const styles = theme => ({
    dialogPaper: {
        backgroundColor: colors.solidPaper,
        '@media (max-width: 768px)': {
            margin: 0
        },
    },

    formWrapper: {
        padding: '3vh 5vw'
    }
})

const testNewPassword = (password) => {
    return /^(?=.*[0-9])(?=.*[.!@#$%^&*])[a-zA-Z0-9.!@#$%^&*]{8,32}$/.test(password);
};


const ChangePassword = (props) => {
    const { classes } = props;
    
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = React.useState('')
    
    const newPasswordValid = Boolean(testNewPassword(newPassword) || !newPassword);
    const newPasswordConfirmValid = Boolean(!newPasswordConfirm || newPasswordConfirm === newPassword);
    
    const resetFields = () => {
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
    }

    const handleClose = () => {
        props.hideChangePasswordDialog();
        resetFields();
    }
    
    const handleConfirm = () => {
        props.changePasswordRequestSend(currentPassword, newPassword, props.user.username);
    }
    
    const changePasswordButtonRef = React.useRef();

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            changePasswordButtonRef.current.click();
        }
    }

    const buttonIsDisabled = Boolean(!newPassword || !newPasswordConfirm || !newPasswordValid || !newPasswordConfirmValid);

    return (
        <Dialog
            open={props.open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
            PaperProps={{
                className: classes.dialogPaper
            }}
            onEnter={resetFields}
        >
            <DialogTitle id="form-dialog-title">Change Password</DialogTitle>
            <DialogContent>                
                <DialogContentText>
                    Please enter your current and new password.
                </DialogContentText>

                <Grid container className={classes.formWrapper}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="normal"
                            id="currentPassword"
                            label="Current Password"
                            type="password"
                            variant='outlined'
                            name='currentPassword'
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            onKeyPress={handleKeyPress}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            id="newPassword"
                            label="New Password"
                            type="password"
                            variant='outlined'
                            name='newPassword'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            error={!newPasswordValid}
                            helperText={!newPasswordValid ? 'Must be 8 to 32 characters with 1 number and 1 special character.' : ''}
                            onKeyPress={handleKeyPress}
                        />                        
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            id="newPasswordConfirm"
                            label="Confirm New Password"
                            type="password"
                            variant='outlined'
                            name='newPasswordConfirm'
                            value={newPasswordConfirm}
                            onChange={(e) => setNewPasswordConfirm(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            error={!newPasswordConfirmValid}
                            helperText={newPasswordConfirmValid ? '' : 'Passwords must match.'}
                            onKeyPress={handleKeyPress}
                        />                        
                    </Grid>
                </Grid>

                <DialogActions>
                    <Button onClick={() => handleClose()} color="primary">
                        Cancel
                    </Button>

                    <Button 
                        color="primary" 
                        variant='contained'
                        onClick={handleConfirm}
                        disabled={buttonIsDisabled}
                        ref={changePasswordButtonRef}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </DialogContent>            
        </Dialog>
        )
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChangePassword));
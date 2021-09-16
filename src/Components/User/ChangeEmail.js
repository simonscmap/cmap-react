import React from 'react';
import { connect } from 'react-redux';

import { Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import colors from '../../enums/colors';

import { changeEmailRequestSend } from '../../Redux/actions/user';
import { hideChangeEmailDialog } from '../../Redux/actions/ui';

const mapStateToProps = (state, ownProps) => ({
    user: state.user
})

const mapDispatchToProps = {
    changeEmailRequestSend,
    hideChangeEmailDialog
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

const testEmail = (email) => {
    return /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(email);
};

const ChangePassword = (props) => {
    const { classes } = props;

    const [password, setpassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [emailConfirm, setEmailConfirm] = React.useState('')

    const resetFields = () => {
        setpassword('');
        setEmail('');
        setEmailConfirm('');
    }

    const handleClose = () => {
        resetFields();
        props.hideChangeEmailDialog();
    }

    const handleConfirm = () => {
        props.changeEmailRequestSend(email, password, props.user.username);
    }
    
    const changeEmailButtonRef = React.useRef();

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
            changeEmailButtonRef.current.click();
        }
    }

    const emailValid = Boolean(testEmail(email) || !email);
    const emailConfirmValid = Boolean(!emailConfirm || email === emailConfirm); 

    const buttonIsDisabled = Boolean(!email || !emailConfirm || !emailValid || !emailConfirmValid);

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
            <DialogTitle id="form-dialog-title">Change Email</DialogTitle>
            <DialogContent>                
                <DialogContentText>
                    Please enter your account password, and new email address.
                </DialogContentText>

                <Grid container className={classes.formWrapper}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="normal"
                            id="currentPassword"
                            label="Password"
                            type="password"
                            variant='outlined'
                            name='currentPassword'
                            value={password}
                            onChange={(e) => setpassword(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onKeyPress={handleKeyPress}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            id="email"
                            label="New Email"
                            type="text"
                            variant='outlined'
                            name='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            error={!emailValid}
                            helperText={!emailValid ? 'Please enter a valid email address' : ''}
                        />                        
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            margin="normal"
                            id="emailConfirm"
                            label="Confirm Email"
                            type="text"
                            variant='outlined'
                            name='emailConfirm'
                            value={emailConfirm}
                            onChange={(e) => setEmailConfirm(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            onKeyPress={handleKeyPress}
                            error={!emailConfirmValid}
                            helperText={emailConfirmValid ? '' : 'Email addresses must match.'}                            
                        />                        
                    </Grid>
                </Grid>

                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>

                        <Button 
                            color="primary" 
                            variant='contained'
                            onClick={handleConfirm}
                            ref={changeEmailButtonRef}
                            disabled={buttonIsDisabled}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
            </DialogContent>            
        </Dialog>
        )
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChangePassword));
import React from 'react';
import { connect } from 'react-redux';

import { Paper, Button, Typography, TextField } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import { recoverPasswordRequestSend } from '../../Redux/actions/user';

const styles = (theme) => ({
    paper: {
        width: '60%',
        margin: '10% auto',
        height: '40vh'
    },

    description: {
        paddingTop: '110px'
    },

    emailSentDescription: {
        padding: '140px 70px 0 70px'
    },

    sendButton: {
        marginLeft: '8px',
        marginTop: '9px',
        height: '41px'
    },

    formWrapper: {
        marginTop: '24px'
    }
})

const mapDispatchToProps = {
    recoverPasswordRequestSend
}

const ForgotPass = (props) => {
    const { classes } = props;

    const [email, setEmail] = React.useState('');
    const [emailWasSent, setEmailWasSent] = React.useState(false);

    const handleChange = event => {
        setEmail(event.target.value);
    }

    const handleSubmit = event => {
        setEmailWasSent(true);
        props.recoverPasswordRequestSend(email);
    }

    const handleKeyPress = event => {
        if (event.key === 'Enter') {
          handleSubmit();
        }
    }

    const valid = email === '' || /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(email);

    return (
        <Paper className={classes.paper}>
            {emailWasSent ? 
                <Typography className={classes.emailSentDescription}>
                    An email has been sent to {email}. If you don't received anything from us within the next few minutes please check your spam folder.
                </Typography>
            :
                <React.Fragment>
                    <Typography className={classes.description}>
                        Enter your email address below to recover your username and password.
                    </Typography>
            
                    <div className={classes.formWrapper}>
                        <TextField
                            autoFocus
                            margin="normal"
                            id="email"
                            type="text"
                            variant='outlined'
                            name='email'                        
                            value={email}
                            onChange={handleChange}
                            error={!valid}
                            helperText={valid ? '' : 'Please enter a valid email address'}
                            onKeyPress={handleKeyPress}
                        />
                        <Button 
                            color='primary' 
                            variant='contained' 
                            className={classes.sendButton} 
                            onClick={handleSubmit}
                            disabled={Boolean(!valid || !email.length)}
                        >
                            Submit
                        </Button>
                    </div>               
                </React.Fragment>
            }
        </Paper>                
    )    
}

export default connect(null, mapDispatchToProps)(withStyles(styles)(ForgotPass));
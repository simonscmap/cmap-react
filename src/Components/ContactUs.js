import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { Typography, TextField, Paper, Grid, Button } from '@material-ui/core';

import { snackbarOpen } from '../Redux/actions/ui';
import { contactUsRequestSend } from '../Redux/actions/user';

const styles = (theme) => ({
    root: {
        color: 'white',
        width: '65vw',
        marginTop: theme.spacing(18),
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: theme.spacing(8),
        padding: theme.spacing(2)
    },

    header: {
        color: theme.palette.primary.main,
        marginBottom: theme.spacing(2)
    },
    
    description: {
        marginBottom: theme.spacing(3)
    },

    textField: {
        marginLeft: 0,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },

    messageTextField: {
        width: '100%'
    },

    submitButton: {
        marginTop: theme.spacing(2),
        color: 'white'
    }
})

const mapStateToProps = (state, ownProps) => ({
    user: state.user
});

const mapDispatchToProps = {
    contactUsRequestSend,
    snackbarOpen
};

class ContactUs extends Component {

    constructor(props){
        super(props);
        this.state = {
            name: props.user ? props.user.firstName + ' ' + props.user.lastName : '',
            email: props.user ? props.user.email : '',
            subject: '',
            message: ''
        }
    }

    handleChange = (event) => {
        this.setState({...this.state, [event.target.name]: event.target.value});
    }

    handleSubmit = () => {
        let payload = {...this.state};
        var invalid = false;
        Object.keys(payload).forEach(key => {
            payload[key] = payload[key].trim();
            if(payload[key].length < 1) invalid = true;
        });

        if(invalid) {
            this.props.snackbarOpen('Please complete all fields');
            return;
        }
        
        this.props.contactUsRequestSend(payload);
    }

    render() {
        const { classes } = this.props;

        return (
            <Paper className={classes.root} elevation={6}>
                <Typography variant='h4' className={classes.header} align='left'>
                    Contact Us
                </Typography>
    
                <Typography variant='body2' className={classes.description} align='left'>
                    Have a question or feedback? Fill out the form below to contact a member of the Simons CMAP team.
                </Typography>

                <Grid container>
                    <Grid item container direction='column' justify='flex-start' xs={12} md={3}>
                        <TextField
                            name='name'
                            label='Name'
                            value={this.state.name}
                            onChange={this.handleChange}
                            className={classes.textField}
                            variant='outlined'
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            name='email'
                            label='Email'
                            value={this.state.email}
                            onChange={this.handleChange}
                            className={classes.textField}
                            variant='outlined'
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        <TextField
                            name='subject'
                            label='Subject'
                            value={this.state.subject}
                            onChange={this.handleChange}
                            className={classes.textField}
                            variant='outlined'
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={9}>
                        <TextField
                            placeholder='Your message...'
                            value={this.state.message}
                            className={classes.messageTextField}
                            name='message'
                            onChange={this.handleChange}
                            multiline
                            rows='10'
                            variant='outlined'
                        />
                    </Grid>
                </Grid>
                <Button 
                    variant='contained' 
                    color='primary'
                    className={classes.submitButton}
                    onClick={this.handleSubmit}
                >
                    Submit
                </Button>
    
            </Paper>
        )
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContactUs));
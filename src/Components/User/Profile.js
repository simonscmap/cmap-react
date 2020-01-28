import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { IconButton, Tooltip, Paper, Button, TextField, Typography, Grid } from '@material-ui/core';
import { Edit } from '@material-ui/icons';

import { updateUserInfoRequestSend } from '../../Redux/actions/user';

import LoadingSpinner from '../UI/LoadingSpinner';
import states from '../../Enums/asyncRequestStates';
import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({
    user: state.user
})

const mapDispatchToProps = {
    updateUserInfoRequestSend
}

const styles = theme => ({
    root: {
        width: '60vw',
        margin: `${theme.spacing(16)}px auto 0 auto`,
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },

    textField: {
        margin: theme.spacing(1),
        width: '80%'
    },

    buttonGrid: {
        marginTop: theme.spacing(1)
    },

    editButton: {
        float: 'right',
        display: 'inline-block',
        marginTop: '-16px'
    },

    header: {
        paddingLeft: theme.spacing(3),
        display: 'inline-block',
        marginTop: '-4px',
        float: 'left'
    }
})

const userProperties = {
    firstName: {
        label:'First Name',
        name: 'firstName',
        type: 'text',
        requirement: 'Must be 2 or more alphabetical characters.',
    },

    lastName: {
        label:'Last Name',
        name: 'lastName',
        type: 'text',
        requirement: 'Must be 2 or more alphabetical characters.',
    },

    institute: {
        label:'Institute',
        name: 'institute',
        type: 'text',
        requirement: 'Maximum length is 150 characters.',
    },

    department: {
        label:'Department',
        name: 'department',
        type: 'text',
        requirement: 'Maximum length is 150 characters.',
    },

    country: {
        label:'Country',
        name: 'country',
        type: 'text',
        requirement: 'Maximum length is 150 characters.',
    }
}

const userToState = (user) => ({
    editable: false,
    firstName: {
        value: user.firstName,
        valid: true
    },

    lastName: {
        value: user.lastName,
        valid: true
    },
    institute: {
        value: user.institute || '',
        valid: true
    },
    department: {
        value: user.department || '',
        valid: true
    },
    country: {
        value: user.country || '',
        valid: true
    },
    email: {
        value: user.email || '',
        valid: true
    }
})

class Profile extends Component {

    constructor(props){
        super(props);
        if(!props.user) return;

        this.state = {
            ...userToState(props.user),
            editable: false,
            infoHasChanged: false
        }
    }

    handleChange = (event) => {
        let newValue = event.target.value;
        let fieldName = event.target.name;
        let valid = this.handleValidation(fieldName, newValue);
        this.setState({
            ...this.state,
            infoHasChanged: true,
            [fieldName]: {
                value: newValue,
                valid
            }
        })
    };

    handleValidation = (fieldName, newValue) => {
        let value = newValue.trim();
        let pattern = /$^/;

        switch(fieldName){
            case 'firstName':
                pattern = /^[A-Za-z ]{2,40}$/;
                break;
            case 'lastName':
                pattern = /^[A-Za-z ]{2,40}$/;
                break;
            case 'email':
                pattern = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/;
                break;
            case 'institute':
                pattern = /^.{0,150}$/
                break;
            case 'department':
                pattern = /^.{0,150}$/
                break;
            case 'country':
                pattern = /^.{0,150}$/
                break;
            default:
                break;
        }
        return pattern.test(value);
    }

    handleEdit = () => {
        this.setState({...this.state, editable: true})
    }

    handleCancel = () => {
        this.setState({...userToState(this.props.user), editable: false, infoHasChanged: false})
    }

    handleConfirm = () => {
        this.props.updateUserInfoRequestSend({
            firstName: this.state.firstName.value.trim(),
            lastName: this.state.lastName.value.trim(),
            institute: this.state.institute.value.trim(),
            department: this.state.department.value.trim(),
            country: this.state.country.value.trim()
        })
    }

    render(){
        if(!this.props.user) {
            window.location.href = "/login";
            return '';
        }

        const { classes } = this.props;
        const { editable, infoHasChanged } = this.state;

        let formIsValid = true;
        Object.keys(userProperties).forEach((property) => {
            if(!this.state[property].valid) formIsValid = false;
        })

        return (
            <Paper className={classes.root} elevation={6}>

                <Typography variant='h5' align='left' className={classes.header}>
                    Profile
                </Typography>

                <Tooltip title='Edit Information'>
                    <IconButton className={classes.editButton} color="primary" onClick={this.handleEdit} disableFocusRipple disableRipple>
                            <Edit/>
                    </IconButton>
                </Tooltip>

                <Grid container spacing={1}>
                    {
                        Object.keys(userProperties).map((property, index) => (
                            <Grid key={index} item xs={6}>
                                <TextField
                                    name={property}
                                    label={userProperties[property].label}
                                    value={this.state[property].value}
                                    error={!this.state[property].valid}
                                    helperText={this.state[property].valid ? '' : userProperties[property].requirement}
                                    key={index}
                                    onChange={this.handleChange}
                                    inputProps={{
                                        readOnly: !editable
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    className={classes.textField}
                                />
                            </Grid>
                        ))
                    }

                    <Grid item xs={6}>
                        <TextField
                            name='email'
                            label= 'Email'
                            value={this.state.email.value}
                            inputProps={{
                                readOnly: true
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            className={classes.textField}
                        />
                    </Grid>
                </Grid>

                { editable &&
                    <Grid className={classes.buttonGrid} container>
                            <Grid item xs={9}></Grid>
                            <Grid item xs={1}>
                                <Button onClick={this.handleCancel}>Cancel</Button>

                            </Grid>

                            <Grid item xs={2}>
                                <Button
                                    onClick={this.handleConfirm}
                                    variant="contained"
                                    color="primary"
                                    disabled={!infoHasChanged || !formIsValid}
                                >
                                    Confirm
                                </Button>
                            </Grid>
                    </Grid>
                }

            </Paper>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Profile));
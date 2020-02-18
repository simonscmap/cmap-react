import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { Stepper, Step, StepLabel, Button, Typography, CircularProgress, Paper } from '@material-ui/core';

import RegistrationCard from './RegistrationCard';

import { registrationNextActiveStep, registrationPreviousActiveStep } from '../../Redux/actions/ui';
import { userRegistrationRequestSend, userValidationRequestSend } from '../../Redux/actions/user';

import states from '../../Enums/asyncRequestStates';

const styles = theme => ({
    root: {
        width: '60%',
        margin: '10% auto'
    },
    button: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    },
    instructionsPaper: {
        width: '60%',
        margin: '5% auto',
        padding: '24px'
    },
    registrationCard: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

    textField: {
        margin:theme.spacing(1),
        width: 200
    },

    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },

    bottomError: {
        color: theme.palette.primary.main,
        marginTop: theme.spacing(1)
    }
});

const mapStateToProps = (state, ownProps) => ({
    registrationActiveStep: state.registrationActiveStep,
    userValidationState: state.userValidationState,
    userRegistrationState: state.userRegistrationState
})

const mapDispatchToProps = {
    registrationNextActiveStep,
    registrationPreviousActiveStep,

    userRegistrationRequestSend,

    userValidationRequestSend
}

// const getSteps = () => ['Your Information', 'Optional Organization Info', 'Security'];
const getSteps = () => ['Your Information', 'Optional Organization Info'];
const getCardInfo = () => ([
    {
        firstName: {
            label:'First Name*',
            name: 'firstName',
            type: 'text',
            requirement: 'Must be 2 or more alphabetical characters.',
            optional: false
        },
        lastName: {
            label:'Last Name*',
            name: 'lastName',
            type: 'text',
            requirement: 'Must be 2 or more alphabetical characters.',
            optional: false
        },
        username: {
            label:'Username*',
            name: 'username',
            type: 'text',
            requirement: 'Must be 6 to 20 alphanumeric characters.',
            optional: false
        },
        email: {
            label:'Email Address*',
            name: 'email',
            type: 'email',
            requirement: 'Must be a valid email address.',
            optional: false
        }
    },
    {
        institute: {
            label:'Institute',
            name: 'institute',
            type: 'text',
            requirement: 'Maximum length is 150 characters.',
            optional: true
        },
        department: {
            label:'Department',
            name: 'department',
            type: 'text',
            requirement: 'Maximum length is 150 characters.',
            optional: true
        },
        country: {
            label:'Country',
            name: 'country',
            type: 'text',
            requirement: 'Maximum length is 150 characters.',
            optional: true
        }
    }
])

const buttonRef = React.createRef();

class RegistrationStepper extends Component {
    constructor(props){
        super(props);

        let cards = []
        getCardInfo().forEach(card => {
            let newCard = {};
            Object.keys(card).forEach(key => {
                newCard[key] = {
                    value: '',
                    valid: true,
                    optional: card[key].optional
                }
            })
            cards.push(newCard);
        })

        this.state = {
            cards
        }
    }

    validateField = (name, rawValue) => {
        let value = rawValue.trim();
        let pattern = /$^/;
        switch(name){
            case 'firstName':
                pattern = /^[A-Za-z ]{2,40}$/;
                break;
            case 'lastName':
                pattern = /^[A-Za-z ]{2,40}$/;
                break;
            case 'username':
                pattern = /^[A-Za-z0-9 ]{6,20}$/;
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
            case 'password':
                pattern = /^(?=.*[0-9])(?=.*[.!@#$%^&*])[a-zA-Z0-9.!@#$%^&*]{8,32}$/
                this.setState(previousState => {
                    let newCardState = [...previousState.cards];
                    newCardState[2].confirmPassword.valid = Boolean(newCardState[2].confirmPassword.value === value);
                    return {cards: newCardState};
                })
                break;
            case 'confirmPassword':
                return this.state.cards[2].password.value === value;
            default:
                break;
        }
        return pattern.test(value);
    }

    processStateToActionPayload = () => {
        let actionPayload = {};
        this.state.cards.forEach(card => {
            Object.keys(card).forEach(cardKey => {
                actionPayload[cardKey] = card[cardKey].value;
            })
        })
        return actionPayload;
    }

    currentCardIsValid = () => {
        let currentCard = this.state.cards[this.props.registrationActiveStep];
        for(let key in currentCard){
            if(currentCard[key].optional) continue;
            if(!currentCard[key].value || !currentCard[key].valid) return false;
        }
        return true;
    }

    handleNext = () => {
        const activeStep = this.props.registrationActiveStep;
        
        switch(activeStep){
            case 0:
                // API request to validate username and email address
                let username= this.state.cards[0].username.value;
                let email= this.state.cards[0].email.value;
                this.props.userValidationRequestSend(username, email);
                break;
            // case 1:
            //     this.props.registrationNextActiveStep();
            //     break;
            case 1:
                // API request to register user
                this.props.userRegistrationRequestSend(this.processStateToActionPayload())
                break;
            default:
                this.props.registrationNextActiveStep();
                break;


        }
    };

    handleBack = () => {
        this.props.registrationPreviousActiveStep();
    };

    handleChange = (event) => {
        let newValue = event.target.value;
        let fieldName = event.target.name;
        let valid = this.validateField(fieldName, newValue);
        this.setState(previousState => {
            let cards = [...previousState.cards];
            cards[this.props.registrationActiveStep][fieldName] = {
                ...cards[this.props.registrationActiveStep][fieldName],
                value: newValue,
                valid
            }
            return {cards};
        })
    };

    render() {
        const { classes } = this.props;
        const steps = getSteps();
        const activeStep = this.props.registrationActiveStep;
        const cardInfoArray = getCardInfo();

        return (
            <React.Fragment>
                <div className={classes.root}>
                    
                    <Stepper activeStep={activeStep}>
                    {steps.map((label, index) => {
                        return (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                        );
                    })}
                    </Stepper>
                    <div>
                    {activeStep === steps.length ? (
                        <Paper className={classes.instructionsPaper}>
                            <Typography className={classes.instructions}>
                                We've sent you an email with a link for finalizing your registration and choosing a password. If you don't receive the email within the next few minute please check your spam folder.
                            </Typography>
                        </Paper>
                    ) : (
                        <div>
                            <RegistrationCard 
                                inputFieldState={{...this.state.cards[this.props.registrationActiveStep]}} 
                                inputFieldInfo={{...cardInfoArray[this.props.registrationActiveStep]}}
                                onChange={this.handleChange}
                                buttonRef={buttonRef}
                            />
                            <div>
                                <Button
                                onClick={activeStep === 0 ? this.props.handleHideStepper : this.handleBack}
                                className={classes.button}
                                >
                                    Back
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={this.handleNext}
                                    className={classes.button}
                                    disabled={!this.currentCardIsValid() || this.props.userValidationState === states.inProgress}
                                    ref={buttonRef}
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                                {this.props.userValidationState === states.inProgress && <CircularProgress size={24} className= {classes.buttonProgress} />}
                                {this.props.userValidationState === states.failed && <Typography className={classes.bottomError}>That username or email is already in use.</Typography>}
                                {this.props.userRegistrationState === states.failed && <Typography className={classes.bottomError}>Registration failed. Please try again.</Typography>}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </React.Fragment>
        );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RegistrationStepper));
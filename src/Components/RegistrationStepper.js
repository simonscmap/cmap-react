import React, {Component} from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import RegistrationCard from './RegistrationCard';
import TopNavBar from './TopNavBar';

import { registrationNextActiveStep, registrationPreviousActiveStep } from '../Redux/actions/ui';
import { userRegistrationRequestSend, userValidationRequestSend } from '../Redux/actions/user';

import states from '../asyncRequestStates';

const styles = theme => ({
    root: {
        width: '60%',
        margin: '5% auto'
    },
    button: {
        marginRight: theme.spacing(1),
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
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

const getSteps = () => ['Your Information', 'Optional Organization Info', 'Security'];
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
    },
    {
        password: {
            label:'Password*',
            name: 'password',
            type: 'password',            
            requirement: 'Must be 8 to 32 characters with 1 number and 1 special character.',
            optional: false
        },
        confirmPassword: {
            label:'Confirm Password*',
            name: 'confirmPassword',
            type: 'password',            
            requirement: 'Passwords must match.',
            optional: false
        }
    }
])

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
                pattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
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
        console.log('action payload')
        console.log(actionPayload)
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
            case 1:
                this.props.registrationNextActiveStep();
                break;
            case 2:
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
                <TopNavBar/>
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
                        <div>
                        <Typography className={classes.instructions}>
                            Registration Completed!
                        </Typography>
                        </div>
                    ) : (
                        <div>
                            <RegistrationCard 
                                inputFieldState={{...this.state.cards[this.props.registrationActiveStep]}} 
                                inputFieldInfo={{...cardInfoArray[this.props.registrationActiveStep]}}
                                onChange={this.handleChange}
                            />
                            <div>
                                <Button
                                disabled={activeStep === 0}
                                onClick={this.handleBack}
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
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                                {this.props.userValidationState === states.inProgress && <CircularProgress size={24} className= {classes.buttonProgress} />}
                                {this.props.userValidationState === states.failed && <p>That username or email is already in use. Please enter a different username or email address.</p>}
                                {this.props.userRegistrationState === states.failed && <p>Registration failed. Please try again.</p>}
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
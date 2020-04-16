import React, { Component } from 'react';

import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import { Paper, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Divider, Grid, Tooltip} from '@material-ui/core';

import { keyRetrievalRequestSend, keyCreationRequestSend } from '../../Redux/actions/user';
import { snackbarOpen } from '../../Redux/actions/ui';

import CopyableText from '../UI/CopyableText';

import states from '../../Enums/asyncRequestStates';
import colors from '../../Enums/colors';

const mapStateToProps = (state, ownProps) => ({
    apiKeys: state.apiKeys,
    apiKeyCreationState: state.apiKeyCreationState
})

const mapDispatchToProps = {
    keyRetrievalRequestSend,
    keyCreationRequestSend,
    snackbarOpen
}

const styles = theme => ({
    root: {
        width: '800px',
        marginTop: theme.spacing(3),
        margin:'auto',
        paddingTop: theme.spacing(2)
      },
    table: {
        minWidth: 700,
    },
    apiKeyTableHeader: {
        marginBottom: theme.spacing(2),
    },

    showChildOnHover: {
        '& span': {
            visibility: 'hidden',
        },
        '&:hover span': {
            visibility: 'visible'
        },
    },

    warningCaption: {
        color: colors.primary,
        fontSize: '11px',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    wrapper: {
        marginTop: theme.spacing(15)
    }
})

class ApiKeyManagement extends Component {
    constructor(props){
        super(props);
        this.state = {
            description: 'API Access'
        }
    }

    componentDidMount = () => {
        if(!this.props.apiKeys) this.props.keyRetrievalRequestSend();
    }


    handleClick = () => {
        this.props.keyCreationRequestSend(this.state.description);
    }

    handleChange = (event) => {
        this.setState({...this.state, description: event.target.value})
    }

    render(){
        const { classes } = this.props;

        return (
            
            <div className={classes.wrapper}>
                {this.props.apiKeys ?
                    <Paper className={classes.root} elevation={6}>             
                        <Typography variant="subtitle1" className={classes.apiKeyTableHeader}>
                            Your API Key
                        </Typography>
                        <Divider/>
                        <Table className={classes.table}>
                            <TableHead>
                            <TableRow>
                                <TableCell variant='head' align='center'>Description</TableCell>
                                <TableCell variant='head' align='center'>Key (hover mouse to view)</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>            
                                {this.props.apiKeys.map((apiKey, index) => (
                                    <TableRow key={index}>
                                        <TableCell align='center'>{apiKey.Description}</TableCell>
                                        <TableCell align='center' className={classes.showChildOnHover}>
                                            <CopyableText text={apiKey.Api_Key} tooltipPlacement='right'/>
                                        </TableCell>
                                    </TableRow>
                                ))   
                                }  
                            </TableBody>
                        </Table>
                        <Typography variant='caption' className={classes.warningCaption}>
                            This API key is a unique identifier, and should not be shared.
                        </Typography>
                    </Paper>
                    : ''
                }
                <Paper className={classes.root} elevation={6}>
                    <Typography variant="body2">
                        Generate a new API key
                    </Typography>
                    <Grid container={true} alignItems='center' justify='center' spacing={4}>
                        <Grid item>
                            <Tooltip placement='bottom' title='Optionally Add a Custom Description'>
                                <TextField
                                    margin="normal"
                                    id="description"
                                    type="text"
                                    variant='outlined'
                                    name='description'
                                    value={this.state.description}
                                    onChange={this.handleChange}
                                    placeholder='Key Description'
                                    className={classes.descriptionField}
                                    autoComplete='off'
                                />
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" disabled={this.state.description.length < 1} color="primary" onClick={this.handleClick}>
                                Generate API Key
                            </Button>
                        </Grid>
                    </Grid>
                    
                    {this.props.apiKeyCreationState === states.failed ? <span>Key creation failed</span> : ''}
                </Paper>
            </div>    
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ApiKeyManagement));
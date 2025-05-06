import { TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { nominateNewDataRequestSend } from '../../Redux/actions/user';
import { GreenButton } from '../Home/buttons';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    '& > *': {
      marginBottom: '1em',
      minWidth: '340px',
    },
  },
};

const emailIsValid = (email) => {
  // rough check of a valid email address
  let ixAt = email && email.indexOf('@') > 0;
  let ixExt = email && ixAt && email.indexOf('.', ixAt) > ixAt + 1;
  let validEmail = email && ixAt && ixExt;
  return validEmail;
};

const isValid = (payload) => {
  let noEmptyFields = Object.entries(payload)
    .map(([, value]) => {
      return value && value.length > 0;
    })
    .every((result) => result);

  let { emailAddr: email } = payload;

  let validEmail = emailIsValid(email);

  return noEmptyFields && validEmail;
};

const trimObjectValues = (payload) => {
  let trimmedEntries = Object.entries(payload).map(([key, value]) => {
    return [key, value && value.trim()];
  });

  return Object.fromEntries(trimmedEntries);
};

const mapStateToProps = ({ user }) => ({
  user,
});

const NominateDataForm = ({ classes, user }) => {
  let dispatch = useDispatch();

  let loggedInUserName = user ? `${user.firstName} ${user.lastName}` : '';
  let [name, setName] = useState(loggedInUserName);
  let [emailAddr, setEmailAddr] = useState(user ? user.email : '');
  let [msgBody, setMsgBody] = useState('');
  let [datasetName, setDatasetName] = useState('');
  let [datasetURL, setDatasetURL] = useState('');

  let message = `Dataset Name: ${datasetName}
      \nDataset Website: ${datasetURL}
      \n
      \nDescription:\n${msgBody}`;

  let fields = {
    name,
    emailAddr,
    datasetName,
    datasetURL,
    msgBody,
  };

  let trimmedFields = trimObjectValues(fields);

  let hasValidPayload = isValid(trimmedFields);

  let submit = () => {
    let payload = {
      name,
      email: emailAddr,
      message,
    };
    // TODO: upon successful request, hide the form and show a thank you
    if (hasValidPayload) {
      dispatch(nominateNewDataRequestSend(payload));
    }
    // NOTE: button should be disabled on any invalid form state,
    // so this check is redundant, and does no require an 'else'
  };

  return (
    <div>
      <div className={classes.container}>
        <TextField
          name="name"
          label="Your Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          name="email"
          label="Email"
          value={emailAddr}
          onChange={(event) => setEmailAddr(event.target.value)}
          variant="outlined"
          error={emailAddr && emailAddr.length > 5 && !emailIsValid(emailAddr)}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          name="dataset_name"
          label="Dataset Name"
          value={datasetName}
          onChange={(event) => setDatasetName(event.target.value)}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          name="dataset_url"
          label="Dataset Website"
          value={datasetURL}
          onChange={(event) => setDatasetURL(event.target.value)}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Typography variant="body1" style={{ margin: '1em 0 2em 0.2em' }}>
          Please describe the dataset you would like to nominate, and include
          any information you deem pertitent with respect to the benefit and
          importance of the data in question.
        </Typography>
        <TextField
          placeholder="Please describe the dataset"
          value={msgBody}
          name="message"
          label="Description"
          onChange={(event) => setMsgBody(event.target.value)}
          multiline
          rows="10"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <GreenButton
          variant="contained"
          color="primary"
          className={classes.submitButton}
          onClick={submit}
          disabled={!hasValidPayload}
        >
          Submit
        </GreenButton>
      </div>
    </div>
  );
};

export default connect(mapStateToProps)(withStyles(styles)(NominateDataForm));

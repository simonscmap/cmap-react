import { TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { contactUsRequestSend } from '../Redux/actions/user';
import Banner from './Common/Banner';
import Page from './Common/Page';
import { GreenButton } from './Home/buttons';
import requestStates from '../enums/asyncRequestStates';
import Spacer from './Common/Spacer';
import Spinner from './UI/Spinner';

const styles = {
  contactContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    '& > *': {
      marginBottom: '1em',
      minWidth: '340px',
    },
  },
};

const mapStateToProps = (state) => ({
  user: state.user,
});

// rough check to ensure no field is empty
const isValid = (payload) => {
  return Object.entries(payload)
    .map(([, value]) => {
      return value && value.length > 0;
    })
    .every((result) => result);
};

const trimObjectValues = (payload) => {
  let trimmedEntries = Object.entries(payload).map(([key, value]) => {
    return [key, value && value.trim()];
  });

  return Object.fromEntries(trimmedEntries);
};

const ContactForm = ({ user, classes }) => {
  let dispatch = useDispatch();

  let [name, setName] = useState(
    user ? `${user.firstName} ${user.lastName}` : '',
  );
  let [emailAddr, setEmailAddr] = useState(user ? user.email : '');
  let [msgBody, setMsgBody] = useState('');

  let submit = () => {
    let preliminaryPayload = {
      name: name,
      email: emailAddr,
      message: msgBody,
    };

    let trimmedPayload = trimObjectValues(preliminaryPayload);

    // TODO: upon successful request, hide the form and show a thank you

    if (isValid(trimmedPayload)) {
      dispatch(contactUsRequestSend(trimmedPayload));
    }
  };

  return (
    <div>
      <div className={classes.contactContainer}>
        <TextField
          name="name"
          label="Name"
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
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          placeholder="Your message..."
          value={msgBody}
          name="message"
          onChange={(event) => setMsgBody(event.target.value)}
          multiline
          rows="10"
          variant="outlined"
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <GreenButton
          variant="contained"
          color="primary"
          className={classes.submitButton}
          onClick={submit}
        >
          Submit
        </GreenButton>
      </div>
    </div>
  );
};

const ConnectedContactForm = connect(
  mapStateToProps,
)(withStyles(styles)(ContactForm));

const mapStateToProps2 = (state) => ({
  contactUs: state.contactUs,
});

const ContactPageContent = connect(mapStateToProps2)(({ contactUs }) => {
  switch (contactUs.requestState) {
    case requestStates.notTried:
      return <ConnectedContactForm />;
    case requestStates.inProgress:
      return (
        <Spacer>
          <Spinner />
        </Spacer>
      );
    case requestStates.succeeded:
      return (
        <Spacer>
          <Typography>Thank you, your message has been sent!</Typography>
        </Spacer>
      );
    case requestStates.failed:
      return (
        <Spacer>
          <Typography>
            Oops! There was an error proccesing the message. Please try again,
            or email us directly at <code>simonscmap@uw.edu</code>
          </Typography>
        </Spacer>
      );
    default:
      return <Typography>Oops! Something went wrong.</Typography>;
  }
});

const Hero = ({ children }) => {
  return (
    <div>
      <Typography variant="subtitle1" align="left">
        Have a question or feedback? Fill out the form below to contact a member
        of the Simons CMAP team.
      </Typography>

      <Banner variant="blue" style={{ transition: 'height 300ms ease-out' }}>
        {children}
      </Banner>
    </div>
  );
};

const ContactPage = () => (
  <Page
    pageTitle="Contact Us"
    heroContent={
      <Hero>
        <ContactPageContent />
      </Hero>
    }
  ></Page>
);

export default ContactPage;

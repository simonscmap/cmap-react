import { Typography } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import Banner from '../Common/Banner';
import Page from '../Common/Page';
import Spacer from '../Common/Spacer';
import Spinner from '../UI/Spinner';
import requestStates from '../../enums/asyncRequestStates';

import NominateDataForm from './NominateDataForm';

const mapStateToProps = (state) => ({
  nominate: state.nominateNewData,
});

const NominateDataContent = connect(mapStateToProps)(({ nominate }) => {
  switch (nominate.requestState) {
    case requestStates.notTried:
      return <NominateDataForm />;
    case requestStates.inProgress:
      return (
        <Spacer>
          <Spinner />
        </Spacer>
      );
    case requestStates.succeeded:
      return (
        <Spacer>
          <Typography>
            Thank you, your message has been sent. We will review your
            nomination and reach out to you shortly.
          </Typography>
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
        Do you know of a <em>public</em> dataset that you think should be added
        to Simons CMAP? Please nominate the dataset using the form below.
      </Typography>
      <Banner variant="blue" style={{ transition: 'height 300ms ease-out' }}>
        {children}
      </Banner>
    </div>
  );
};

const NominateNewDataPage = () => (
  <Page
    pageTitle="Nominate New Data"
    heroContent={
      <Hero>
        <NominateDataContent />
      </Hero>
    }
  ></Page>
);

export default NominateNewDataPage;

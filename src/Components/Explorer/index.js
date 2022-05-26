import { Button, withStyles } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { catalogSearch } from '../../Redux/catalog/search';
import { makeAsyncAction } from '../../Redux/helpers';

let [, reqbinStatus200Actions] = makeAsyncAction('reqbin', 'Status200');
let [, reqbinStatus300Actions] = makeAsyncAction('reqbin', 'Status300');
let [, reqbinStatus400Actions] = makeAsyncAction('reqbin', 'Status400');
let [, reqbinStatus500Actions] = makeAsyncAction('reqbin', 'Status500');
let [, testEmailActions] = makeAsyncAction('testEmail', 'test');

const mapDispatch = {
  search: catalogSearch.makeRequest,
  get200: reqbinStatus200Actions.makeRequest,
  get300: reqbinStatus300Actions.makeRequest,
  get400: reqbinStatus400Actions.makeRequest,
  get500: reqbinStatus500Actions.makeRequest,
  testEmail: testEmailActions.makeRequest,
};

const connector = connect(null, mapDispatch);

const styles = () => ({
  container: {
    margin: '100px auto',
  },
});

const MyComponent = ({
  search,
  get200,
  get300,
  get400,
  get500,
  testEmail,
  classes,
}) => {
  return (
    <div className={classes.container}>
      <p>Test Epic</p>
      <Button
        onClick={() =>
          search(
            '?hasDepth=any&keywords=oxygen&latEnd=90&latStart=-90&lonEnd=180&lonStart=-180&timeEnd=2022-04-09&timeStart=1900-01-01',
          )
        }
        color="primary"
        variant="container"
      >
        Search
      </Button>
      <Button onClick={() => get200()}>Get 200</Button>
      <Button onClick={() => get300()}>Get 300</Button>
      <Button onClick={() => get400()}>Get 400</Button>
      <Button onClick={() => get500()}>Get 500</Button>
      <Button
        onClick={() =>
          testEmail({
            data: {
              // 'rmarohl3@uw.edu','tansy@uw.edu','dharing@uw.edu','mdehghan@uw.edu','armbrust@uw.edu'
              recipients: ['test@anthanes.com'],
              templateName: 'userComment',
              mockData: {
                datasetName: 'TEST_DATASET_NAME',
                userMessage: 'here is a message\nthat splits across lines',
              },
            },
          })
        }
      >
        Test Email
      </Button>
    </div>
  );
};

export default connector(withStyles(styles)(MyComponent));

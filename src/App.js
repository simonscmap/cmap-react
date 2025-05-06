import DateFnsUtils from '@date-io/date-fns';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './Components/UI/ErrorBoundary';
import GlobalUIComponentWrapper from './Components/UI/GlobalUIComponentWrapper';
import Docs from './Documentation/sidebar';
import { toggleShowHelp, windowResize } from './Redux/actions/ui';
import { ingestCookies } from './Redux/actions/user';
import { ServicesInit } from './Services/Init.js';
import './Stylesheets/App.scss';
import './Stylesheets/intro-custom.css';
import theme from './Components/theme';
import Navigation from './Components/Navigation';
import FourOhFour from './Components/FourOhFour';

// Lasy loaded components
const About = lazy(() => import('./Components/About.js'));
const ApiKeyManagement = lazy(
  () => import('./Components/User/ApiKeyManagement'),
);
const Catalog = lazy(() => import('./Components/Catalog/Catalog'));
const Gallery = lazy(() => import('./Components/Gallery'));
const Galleries = lazy(() => import('./Components/Gallery/Galleries'));
const ChoosePassword = lazy(() => import('./Components/User/ChoosePassword'));
const ContactUs = lazy(() => import('./Components/Contact'));
const CruiseFullPage = lazy(
  () => import('./Components/Catalog/CruiseFullPage'),
);
const DataSubmission = lazy(
  () => import('./Components/DataSubmission/DataSubmission'),
);
const DatasetDetailPage = lazy(
  () => import('./Components/Catalog/DatasetDetailPage'),
);
const ForgotPass = lazy(() => import('./Components/User/ForgotPass'));
const Home = lazy(() => import('./Components/Home'));
const Login = lazy(() => import('./Components/User/Login'));
const Profile = lazy(() => import('./Components/User/Profile'));
const ProgramIndex = lazy(() => import('./Components/Catalog/Programs/Index'));
const ProgramDetailPage = lazy(
  () => import('./Components/Catalog/Programs/ProgramDetailPage'),
);
const Register = lazy(() => import('./Components/User/Register'));
const Visualization = lazy(
  () => import('./Components/Visualization/Visualization'),
);
const SinglePlot = lazy(() => import('./Components/Visualization/SinglePlot'));
const NewsDashboard = lazy(() => import('./Components/Admin/News/Dashboard'));
const Cite = lazy(() => import('./Components/Cite'));
const SubscriptionsPage = lazy(
  () => import('./Components/User/Subscriptions/Subscriptions'),
);

const mapDispatchToProps = {
  toggleShowHelp,
  windowResize,
  ingestCookies,
};

class App extends Component {
  componentDidMount = () => {
    window.onresize = this.handleResize;
    this.props.ingestCookies();
  };

  debouncedResize = debounce(200, this.props.windowResize);

  handleResize = () => {
    this.debouncedResize(window.innerHeight, window.innerWidth);
  };

  render() {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div className="App">
          <MuiThemeProvider theme={theme}>
            <ErrorBoundary>
              <GoogleOAuthProvider clientId="739716651449-7rbvsac1okk8mkd4g1mti8tnhdk1m3a8.apps.googleusercontent.com">
                <BrowserRouter>
                  <ServicesInit />
                  <GlobalUIComponentWrapper />
                  <Navigation />
                  <Suspense fallback={''}>
                    <Switch>
                      {/* HOME */}
                      <Route exact path="/">
                        <Home />
                      </Route>
                      {/* DATA */}
                      <Route exact path="/catalog">
                        <Catalog />
                      </Route>
                      <Route
                        path="/catalog/datasets/:dataset"
                        component={DatasetDetailPage}
                      ></Route>
                      <Route
                        path="/catalog/cruises/:cruiseName"
                        component={CruiseFullPage}
                      ></Route>
                      <Route exact path="/programs">
                        <ProgramIndex />
                      </Route>
                      <Route
                        path="/programs/:programName"
                        component={ProgramDetailPage}
                      ></Route>
                      <Route path="/visualization">
                        <Visualization />
                      </Route>
                      <Route path="/plot">
                        <SinglePlot />
                      </Route>
                      <Route
                        path="/datasubmission"
                        component={DataSubmission}
                      ></Route>
                      <Route
                        path="/admin/news"
                        component={NewsDashboard}
                      ></Route>

                      {/* ABOUT */}
                      <Route exact path="/contact">
                        <ContactUs />
                      </Route>
                      <Route path="/about">
                        <About />
                      </Route>
                      <Route path="/how-to-cite">
                        <Cite />
                      </Route>

                      <Route exact path="/documentation">
                        <Docs />
                      </Route>
                      <Route exact path="/gallery">
                        <Gallery />
                      </Route>
                      <Route path="/gallery/:slug" component={Galleries} />

                      {/* USER */}
                      <Route exact path="/login">
                        <Login />
                      </Route>
                      <Route exact path="/register">
                        <Register />
                      </Route>
                      <Route exact path="/profile">
                        <Profile />
                      </Route>
                      <Route
                        exact
                        path="/apikeymanagement"
                        component={ApiKeyManagement}
                      />
                      <Route exact path="/forgotpass">
                        <ForgotPass />
                      </Route>
                      <Route path="/choosepassword">
                        <ChoosePassword />
                      </Route>
                      <Route exact path="/subscriptions">
                        <SubscriptionsPage />
                      </Route>
                      <Route path="*">
                        <FourOhFour />
                      </Route>
                    </Switch>
                  </Suspense>
                </BrowserRouter>
              </GoogleOAuthProvider>
            </ErrorBoundary>
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default connect(null, mapDispatchToProps)(App);

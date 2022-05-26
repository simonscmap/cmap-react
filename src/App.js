import DateFnsUtils from '@date-io/date-fns';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Component, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import ErrorBoundary from './Components/UI/ErrorBoundary';
import GlobalUIComponentWrapper from './Components/UI/GlobalUIComponentWrapper';
import Docs from './Documentation/sidebar';
import { toggleShowHelp, windowResize } from './Redux/actions/ui';
import { ingestCookies, initializeGoogleAuth } from './Redux/actions/user';
import { ServicesInit } from './Services/Init.js';
import './Stylesheets/App.scss';
import './Stylesheets/intro-custom.css';
import theme from './Components/theme';
import Navigation from './Components/Navigation';
import FourOhFour from './Components/FourOhFour';

// Lasy loaded components
const About = lazy(() => import('./Components/About.js'));
const ApiKeyManagement = lazy(() =>
  import('./Components/User/ApiKeyManagement'),
);
const Catalog = lazy(() => import('./Components/Catalog/Catalog'));
const Gallery = lazy(() => import('./Components/Gallery'));
const Galleries = lazy(() => import('./Components/Gallery/Galleries'));
const ChoosePassword = lazy(() => import('./Components/User/ChoosePassword'));
const ContactUs = lazy(() => import('./Components/Contact'));
const CruiseFullPage = lazy(() =>
  import('./Components/Catalog/CruiseFullPage'),
);
const DataSubmission = lazy(() =>
  import('./Components/DataSubmission/DataSubmission'),
);
const DatasetFullPage = lazy(() =>
  import('./Components/Catalog/DatasetFullPage'),
);
const ForgotPass = lazy(() => import('./Components/User/ForgotPass'));
const Home = lazy(() => import('./Components/Home'));
const Login = lazy(() => import('./Components/User/Login'));
const Profile = lazy(() => import('./Components/User/Profile'));
const Register = lazy(() => import('./Components/User/Register'));
const SearchResults = lazy(() => import('./Components/Catalog/SearchResults'));
const Visualization = lazy(() =>
  import('./Components/Visualization/Visualization'),
);
const NewsDashboard = lazy(() => import('./Components/Admin/News/Dashboard'));
const Cite = lazy(() => import('./Components/Cite'));
const Spinner = lazy(() => import('./Components/UI/Spinner'));

const mapDispatchToProps = {
  initializeGoogleAuth,
  toggleShowHelp,
  windowResize,
  ingestCookies,
};

class App extends Component {
  componentDidMount = () => {
    this.props.initializeGoogleAuth();
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
                      component={DatasetFullPage}
                    ></Route>
                    <Route
                      path="/catalog/cruises/:cruiseName"
                      component={CruiseFullPage}
                    ></Route>
                    <Route path="/visualization">
                      <Visualization />
                    </Route>
                    <Route
                      path="/datasubmission"
                      component={DataSubmission}
                    ></Route>
                    <Route path="/admin/news" component={NewsDashboard}></Route>

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

                    {/* TEST */}
                    <Route path="/spinner">
                      <Spinner message={'test'} />
                    </Route>
                    <Route path="*">
                      <FourOhFour />
                    </Route>
                  </Switch>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </MuiThemeProvider>
        </div>
      </MuiPickersUtilsProvider>
    );
  }
}

export default connect(null, mapDispatchToProps)(App);

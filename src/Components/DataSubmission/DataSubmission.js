// const App = () => (
//     <BrowserRouter>
//       {/* here's a div */}
//       <div>
//         {/* here's a Route */}
//         <Route path="/tacos" component={Tacos} />
//       </div>
//     </BrowserRouter>
//   );
  
//   // when the url matches `/tacos` this component renders
//   const Tacos = ({ match }) => (
//     // here's a nested div
//     <div>
//       {/* here's a nested Route,
//           match.url helps us make a relative path */}
//       <Route path={match.url + "/carnitas"} component={Carnitas} />
//     </div>
//   );
import React from 'react';

import { Route, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles';

import ValidationTool from './ValidationTool';
import SubmissionGuide from './SubmissionGuide';

const styles = (theme) => ({
    root: {
        paddingTop: '70px'
    }
})

const DataSubmission = (props) => {
    const { classes, match } = props;
    console.log(match)
    return (
        <div className={classes.root}>
            <Switch>          
              <Route exact path={match.url + '/guide'} component={ SubmissionGuide } />
              <Route exact path={match.url + '/validationtool'} component={ ValidationTool } />
            </Switch>
        </div>
    )
}

export default withStyles(styles)(DataSubmission);
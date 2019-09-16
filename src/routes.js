import React from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import Home from './Components/Home';
import Catalog from './Components/Catalog';
import Register from './Components/Register';
import Visualization from './Components/Visualization';
import GlobalUIComponentWrapper from './Components/GlobalUIComponentWrapper';

export default props => (
    <BrowserRouter>
      <GlobalUIComponentWrapper/>
      <Switch>          
        <Route exact path='/apikeymanagement' component={ Home } />
        <Route exact path='/' component={ Catalog } />
        <Route exact path='/register' component={ Register } />
        <Route exact path='/visualization' component={ Visualization } />
      </Switch>
    </BrowserRouter>
  )
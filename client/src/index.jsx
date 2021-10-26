import React from 'react';
import ReactDOM from 'react-dom';
import jwt_decode from 'jwt-decode';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import * as FullStory from '@fullstory/browser';
FullStory.init({ orgId: '164EXE' });

// core components
import Admin from './layouts/Admin';
import Auth from './layouts/Auth';
import './styles/css/main.css';

// utilities
import { setCurrentUser, logoutUser } from './actions/authActions';
import store from './store';

const findToken = () => {
  let cookieToken;

  if (document.cookie.indexOf('token=') !== -1) {
    cookieToken = document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('token'))
      .split('=')[1];
  } else {
    cookieToken = null;
  }

  if (cookieToken) {
    return cookieToken;
  }

  let localStorageToken = localStorage.jwtToken;

  if (localStorageToken) {
    return localStorageToken;
  }
};

if (findToken()) {
  const cookieToken = findToken();
  const decoded = jwt_decode(cookieToken);
  store.dispatch(setCurrentUser(decoded));
  const { id, name, email, org } = decoded;
  FullStory.identify(id, { displayName: name, email: email, org_str: org });
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = '/auth/login-page';
  }
}

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <PrivateRoute path='/admin' component={Admin} />
        <Route path='/auth' component={Auth} />
        <Redirect from='/' to='/auth' />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

import jwt_decode from 'jwt-decode';
import {
  CLEAR_ERRORS,
  GET_ERRORS,
  GET_CURRENT_USER,
  SET_CURRENT_USER,
  USER_LOADING,
  GOOGLE_AUTH_USER,
} from './types';

import * as FullStory from '@fullstory/browser';

let API_URL = '';

if (process.env.NODE_ENV === 'development') {
  API_URL = require('../config/config').API_URL;
} else {
  API_URL = `https://shftr-api.herokuapp.com`;
}

// loading user
export const setUserLoading = loading => {
  return {
    type: USER_LOADING,
    payload: loading,
  };
};

const fsIdentify = ({ id, name, email, org }) => {
  FullStory.identify(id, { displayName: name, email: email, org_str: org });
};

// Registration
export const registerUser = (userData, history) => dispatch => {
  dispatch(setUserLoading(true));

  let options = {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  fetch(`/api/users/register`, options)
    .then(response => {
      if (response.status >= 400) {
        throw response;
      }
      return response.json();
    })
    .then(data => {
      dispatch(setUserLoading(false));
      history.push('/auth/login-page');
      dispatch({
        type: CLEAR_ERRORS,
        payload: '',
      });
    })
    .catch(error => {
      dispatch({
        type: GET_ERRORS,
        payload: error,
      });
      dispatch(setUserLoading(false));
    });
};

// Login and get user token
export const loginUser = userData => dispatch => {
  dispatch(setUserLoading(true));

  let options = {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  fetch(`/api/users/login`, options)
    .then(response => {
      if (response.status >= 400) {
        throw response;
      }
      return response.json();
    })
    .then(data => {
      const { token } = data;
      localStorage.setItem('jwtToken', token);
      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
      fsIdentify(decoded);
      dispatch(setUserLoading(false));
      dispatch({
        type: CLEAR_ERRORS,
        payload: '',
      });
    })
    .catch(error => {
      dispatch({
        type: GET_ERRORS,
        payload: error,
      });
      dispatch(setUserLoading(false));
    });
};

// set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// Get user
export const getCurrentUser = () => dispatch => {
  dispatch(setUserLoading(true));
  fetch(`/api/user/currentuser`, {
    method: 'GET',
    credentials: 'include',
  })
    .then(response => response.json())
    .then(data => {
      if (data.name && data.org && data.id && data.email) {
        fsIdentify(data);
      }

      dispatch({
        type: GET_CURRENT_USER,
        payload: data,
      });
      dispatch(setUserLoading(false));
      dispatch({
        type: CLEAR_ERRORS,
        payload: '',
      });
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
      dispatch(setUserLoading(false));
    });
};

// Login with oAuth
export const loginUserWithOauth = token => dispatch => {
  dispatch(setUserLoading(true));
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      credentials: 'include',
    },
  };

  fetch(`/api/users/currentUser`, options)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('error:\n', error);
    });
};

// Google Authing
export const doGoogleAuth = () => dispatch => {
  dispatch(setUserLoading(true));
  window.location.href = `/auth/google`;
};

// log out user
export const logoutUser = () => dispatch => {
  localStorage.removeItem('jwtToken');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  dispatch(setCurrentUser({}));
  dispatch(setUserLoading(false));
  dispatch({
    type: CLEAR_ERRORS,
    payload: '',
  });
};

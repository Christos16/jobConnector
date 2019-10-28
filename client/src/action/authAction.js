import { GET_ERRORS, SET_CURRENT_USER } from './types';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import jwt_decode from 'jwt-decode';

// Register User
//Should be good to create the actions that you want then the components

export const registerUser = (userData, history) => dispatch => {
  axios
    .post('api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login - Get User Token

export const loginUser = userData => dispatch => {
  axios
    .post('/api/users/login', userData)
    .then(res => {
      //Save to localStorage because we need the token in Auth just like in postman
      //In order to access private routes
      const { token } = res.data;
      //Set token to ls which only take strings and we can store it directly because data is in strings
      localStorage.setItem('jwtToken', token);
      //Set token to Auth Header
      setAuthToken(token);
      //Since the token above contains also the user info such as name,id, gravatar...
      //We have to use a module named jwtdecoded
      //Also will contains the date and expiration of the token 3600 one hour

      const decoded = jwt_decode(token);
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Set logged in User

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

//Log user out

export const logoutUser = () => dispatch => {
  // Remove from locale Storage
  localStorage.removeItem('jwtToken');
  //Remove auth header for future requests;
  setAuthToken(false);
  //Set current user to {} which will set isAuthenticated to false

  dispatch(setCurrentUser({}));
};

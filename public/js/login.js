/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
import axios from 'axios';
import { errMsg } from './errMsg';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        location.assign('/');
      }, 100);
    }
  } catch (err) {
    window.setTimeout(() => {
      const className = '.end__form__input';
      errMsg(err.response.data.message, className, 'beforeend');
    }, 1000);
    // eslint-disable-next-line no-alert
  }
};

export const logout = async () => {
  try {
    console.log('clicked');
    const res = await axios({
      method: 'get',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        location.reload(true);
        location.assign('/');
      }, 300);
    }
  } catch (err) {
    console.log(err.response);
    alert('Something is wrong!');
  }
};

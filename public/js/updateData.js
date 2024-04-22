/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
import axios from 'axios';
import { errMsg } from './errMsg';

// eslint-disable-next-line import/prefer-default-export
export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatepassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateUserData';
    const res = await axios({
      method: 'patch',
      url,
      data,
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    let className;
    if (type === 'password') className = '.btn--save-password';
    else className = '.btn--green';
    window.setTimeout(() => {
      errMsg(err.response.data.message, className, 'beforebegin');
    }, 1000);
  }
};

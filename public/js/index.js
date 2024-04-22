/* eslint-disable no-undef */
import { login, logout } from './login';
import { updateData } from './updateData';

const loginBtn = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateSettings = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');

if (loginBtn)
  loginBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateSettings) {
  updateSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const data = {
      email,
      name,
    };
    updateData(data, 'data');
  });
}

if (updatePassword) {
  updatePassword.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;
    const data = { password, newPassword, newPasswordConfirm };
    updateData(data, 'password');
  });
}

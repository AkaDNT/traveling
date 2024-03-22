/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
const loginBtn = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const login = async (email, password) => {
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
    // eslint-disable-next-line no-alert
    const markup = `<div class="errMsg">Wrong email or password</div>`;
    document
      .querySelector('.end__form__input')
      .insertAdjacentHTML('beforeend', markup);
  }
};

const logout = async () => {
  try {
    console.log('clicked');
    const res = await axios({
      method: 'get',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err.response);
    alert('Something is wrong!');
  }
};

if (loginBtn)
  loginBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

/* eslint-disable no-undef */
/* eslint-disable import/prefer-default-export */
export const errMsg = (type, className, position) => {
  const existErr = document.querySelector('.errMsg');
  if (existErr) existErr.remove();
  const markup = `<div class="errMsg">${type}</div>`;
  document.querySelector(className).insertAdjacentHTML(position, markup);
};

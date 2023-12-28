const nodemailer = require('nodemailer');

const sendMail = async function (options) {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '01d3150c640218',
      pass: '653791a4c331c7',
    },
  });
  const mailOptions = {
    from: 'd.akant@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;

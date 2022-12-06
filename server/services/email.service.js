import config from '../config';
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

var transporter = nodemailer.createTransport(
  smtpTransport({
    port: config.mailPort,
    host: config.mailHost,
    secure: true,
    auth: {
      user: config.mailUsername,
      pass: config.mailPassword,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  })
);

const sendMail = (to, subject, html, attachment=null) => {
  const mailOptions = {
    from: config.mailSender,
    to: to,
    subject: subject,
    generateTextFromHTML: true,
    html: html,
    attachment: attachment
  };
  transporter.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
  });
}
export default sendMail;
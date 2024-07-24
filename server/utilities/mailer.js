const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, text) {
  const mail = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    let message = await transporter.sendMail(mail);
    console.log("Email envoyé:" + message.response);
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de message; veuillez rééssayer: ",
      error
    );
  }
}

module.exports = sendEmail;

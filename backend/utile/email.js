const { Resend } = require("resend");
const env = require("../config/env");

const resend = new Resend(env.RESEND_API_KEY);

// async, quand nous avons des fonctionnalités qui prennent du temps, pour éviter de bloquer le site pendant que ça tourne en arrière plan
const sendEmail = async function ({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: "Me <admin@avisetoiles.com>",
      to,
      subject,
      html,
    });
    if (data) {
      return data;
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = sendEmail;

const nodemailer = require("nodemailer")
const dotenv = require("dotenv").config()


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: process.env.TEST_EMAIL_PORT,
    auth: {
        user: process.env.TEST_EMAIL,
        pass: process.env.TEST_EMAIL_PASSWORD
    }
});

async function sendEmail(to, subject, text) {


    try {
        await transporter.sendMail({

            from: process.env.TEST_EMAIL,
            to: to,
            subject,
            text
        })
    }
    catch (err) {
        console.log(err)
    }
}
module.exports = { sendEmail }
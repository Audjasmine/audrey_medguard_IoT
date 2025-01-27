import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true, 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: true
    }
})

export const sendMail = async (data) => {
    const { sender, receipients, subject, message } = data;

    return await transporter.sendMail({
        from: sender,
        to: receipients,
        html: message,
        subject: subject,
        text: message,
    })
}
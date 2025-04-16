import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if(error) {
        console.log(error);
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
});

export const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        return;
    } catch (error) {
        throw error;
    }
};
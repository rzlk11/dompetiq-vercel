import OTP from "../models/OTPModel.js";
import { sendEmail } from "./Email.js";
import argon2 from "argon2";


const generateOTP = async () => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        return otp;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const sendOTP = async ({ email, subject, message, duration = 1 }) => {
    try {
        if (!(email && subject && message)) {
            throw new Error("Provide values for email, subject, and message!");
        }

        await OTP.destroy({ where: { email } });

        const generatedOTP = await generateOTP();

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject,
            html: `<p>${message}</p><p style="color:tomato;font-size:25px;letter-spacing:2px;"><b>${generatedOTP}</b></p><p>This code <b>expires in ${duration} hour(s)</b>.</p>`,
        };
        await sendEmail(mailOptions);

        const hashedOTP = await argon2.hash(generatedOTP);

        const createOTP = await OTP.create({
            email,
            otp: hashedOTP,
            expiresAt: Date.now() + 3600000 * +duration,
        });

        return createOTP;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const deleteOTP = async (email) => {
    try {
        await OTP.destroy({
            where:{
                email: email,
            },
        });
        return ("OTP Deleted");
    } catch (error) {
        throw Error( error.message );
    }
};
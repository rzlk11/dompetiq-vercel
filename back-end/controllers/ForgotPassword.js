import Users from "../models/UserModel.js"
import { sendOTP, deleteOTP } from "./OTP.js";
import argon from 'argon2';

export const sendPasswordResetOTPEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await Users.findOne({ where: { email } });
        if(!existingUser) return res.status(404).json({error: "There's no account for the provided email."});

        // if(!existingUser.verified) {
        //     throw Error("Email hasn't been verified yet. Check your inbox.");
        // }

        const otpDetails = {
            email,
            subject: "Password Reset",
            message: "Enter the code below to reset your password.",
            duration: 1
        };

        const createdOTP = await sendOTP(otpDetails);
        return res.status(200).json(createdOTP);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if(!(email && newPassword)) return res.status(400).json({ error: "Empty credentials are not allowed" });

        if(newPassword.length < 8) {
            return res.status(400).json({ error: "Password is too short!" });
        }

        const hashedNewPassword = await argon.hash(newPassword);

        await Users.update(
            {
                password: hashedNewPassword,
            },
            {
                where: {
                    email,
                },
            }
        );

        await deleteOTP(email);
        return res.status(200).json({ email, passwordReset: true });

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};
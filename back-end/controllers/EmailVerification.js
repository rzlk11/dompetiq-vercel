import Users from "../models/UserModel.js";
import { deleteOTP, sendOTP } from "./OTP.js";

export const sendEmailVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if(!email) return res.status(400).json({ error: "Provide the email!" })
        const existingUser = await Users.findOne({
            where: {
                email: email,
            },
        });
        if(!existingUser) return res.status(404).json({error: "User with this email is not found"});

        const otpDetails = {
            email,
            subject: "Email Verification",
            message: "Verify your email with the code below",
            duration: 1
        };
        const createdOTP = await sendOTP(otpDetails);
        if(!createdOTP) return res.status(400).json({error: "Failed to create and send OTP"});
        return res.status(200).json("OTP Created & Sent");
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

export const verifyUserEmail = async (req, res) => {
    try {
        const { email } = req.body;

        await deleteOTP(email);
        return res.status(200).json({ email, verified: true });
    }
    catch(error) {
        return res.status(500).json({ error: error.message });
    }
};
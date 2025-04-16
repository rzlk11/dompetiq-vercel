import OTP from "../models/OTPModel.js";
import argon from 'argon2';

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        if(!(email && otp)) {
            return res.status(400).json({ error: "Provide values for email and OTP!" });
        }

        //ensure otp record exists
        const matchedOTPRecord = await OTP.findOne({
            where:{
                email,
            },
        });

        if(!matchedOTPRecord) return res.status(404).json({ error: "No OTP records found" });

        const { expiresAt } = matchedOTPRecord;

        //check if the code has expired
        if(expiresAt < Date.now()) {
            await OTP.destroy({
                where:{
                    email,
                },
            });
            return res.status(400).json({ error: "Code has expired. Request for a new one." });
        }

        //if not expired yet, verify the otp
        const hashedOTP = matchedOTPRecord.otp;
        const validOTP = await argon.verify(hashedOTP, otp);
        if(!validOTP) {
            return res.status(400).json({ error: "OTP doesn't match" });
        }
        next();
    } catch (error) {
        return res.status(400).json({ error:error.message });
    }
};
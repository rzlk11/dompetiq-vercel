import express from 'express';
import { verifyOTP } from '../middleware/verifyOTP.js';
import { sendEmailVerificationOTP, verifyUserEmail } from '../controllers/EmailVerification.js';

const router = express.Router();

router.post("/email-verification", sendEmailVerificationOTP);
router.post("/verify-email-verification-otp", verifyOTP, verifyUserEmail);

export default router;
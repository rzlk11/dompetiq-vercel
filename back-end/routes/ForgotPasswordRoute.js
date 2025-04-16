import express from 'express';
import { sendPasswordResetOTPEmail, resetPassword } from '../controllers/ForgotPassword.js';

const router = express.Router();

router.post("/forgot-password", sendPasswordResetOTPEmail);
router.post("/reset-password", resetPassword);

export default router;
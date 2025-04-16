import express from 'express';
import { verifyOTP } from '../middleware/verifyOTP.js';

const router = express.Router();

router.post("/verify-otp", verifyOTP, (req, res) => {
    res.status(200).json({ valid:true });
});

export default router;
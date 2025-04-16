import express from 'express';
import {
    login,
    logOut,
    Me
} from '../controllers/Auth.js';

const router = express.Router();

// menampilkan data user yang sedang login
router.get('/me', Me);

// route login
router.post('/login', login);

// route logout
router.delete('/logout', logOut);

export default router;
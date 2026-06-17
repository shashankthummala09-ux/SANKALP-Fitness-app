import { Router } from 'express';
import { register, login, logout, getMe, updateLanguage } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/language', authenticate, updateLanguage);

export default router;

import { Router } from 'express';
import { 
  getAdminDashboard, 
  createGym, updateGym, deleteGym,
  createTrainer, updateTrainer, deleteTrainer 
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes under authentication
router.use(authenticate);

// Admin dashboard summary stats
router.get('/dashboard', getAdminDashboard);

// Gym management
router.post('/gyms', createGym);
router.put('/gyms/:id', updateGym);
router.delete('/gyms/:id', deleteGym);

// Trainer management
router.post('/trainers', createTrainer);
router.put('/trainers/:id', updateTrainer);
router.delete('/trainers/:id', deleteTrainer);

export default router;

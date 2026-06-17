import { Router } from 'express';
import {
  createOrUpdateGoal,
  getGoalDashboard,
  logWeight,
  getWeightHistory,
  updateSankalpText,
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes in this router
router.use(authenticate);

// Onboarding goal creation / updates
router.post('/onboarding', createOrUpdateGoal);

// Dashboard goal metrics widget
router.get('/dashboard', getGoalDashboard);

// Update weight log
router.post('/weight', logWeight);

// Weight logs history
router.get('/history', getWeightHistory);

// Update sankalp vow text
router.put('/sankalp', updateSankalpText);

export default router;

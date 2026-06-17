import { Router } from 'express';
import { logMeasurements, getMeasurementHistory } from '../controllers/measurement.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes inside this router
router.use(authenticate);

// Log new measurements
router.post('/', logMeasurements);

// Retrieve measurements history
router.get('/', getMeasurementHistory);

export default router;

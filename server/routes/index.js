import { Router } from 'express';
import auth from '../middleware/auth.middleware.js';
import authRoutes from './auth.route';
import pointRoutes from './point.route';

const router = Router();
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.status(200).send({ message: 'OK' }),
);

router.use('/auth', authRoutes);
router.use('/point', auth, pointRoutes);

export default router;
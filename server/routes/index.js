import { Router } from 'express';
import auth, { checkRole } from '../middleware/auth.middleware.js';
import authRoutes from './auth.route';
import pointRoutes from './point.route';
import statRoutes from './stat.route';

const router = Router();
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.status(200).send({ message: 'OK' }),
);

router.use('/auth', authRoutes);
router.use('/point', auth, pointRoutes);
router.use('/stat', auth, checkRole(1), statRoutes);

export default router;
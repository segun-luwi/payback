import { Router } from 'express';
import register, { login, verification } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verifyEmail', verification);

export default router;
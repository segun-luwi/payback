import { Router } from 'express';
import register, { login, verification, adminLogin } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/adminLogin', adminLogin);
router.post('/verifyEmail', verification);

export default router;
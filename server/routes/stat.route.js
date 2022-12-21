import { Router } from 'express';
import { userSignIns, userSignUps, totalUsers, scanReceipts } from '../controllers/stat.controller';

const router = Router();

router.get('/receipts', scanReceipts);
router.get('/users', totalUsers);
router.get('/userSignIns', userSignIns);
router.get('/userSignUps', userSignUps);

export default router;
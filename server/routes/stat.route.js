import { Router } from 'express';
import { userSignIns, userSignUps, totalUsers, scanReceipts } from '../controllers/stat.controller';

const router = Router();

router.post('/receipts', scanReceipts);
router.post('/users', totalUsers);
router.post('/userSignIns', userSignIns);
router.post('/userSignUps', userSignUps);

export default router;
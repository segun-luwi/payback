import { Router } from 'express';
import { userSignIns, totalUsersByAge, totalUsers, totalUsersByLocation, totalUsersByGender, scanReceipts, totalPurchaseByLocation } from '../controllers/stat.controller';

const router = Router();

router.get('/receipts', scanReceipts);
router.get('/users', totalUsers);
router.get('/usersByLocation', totalUsersByLocation);
router.get('/usersByGender', totalUsersByGender);
router.get('/userSignIns', userSignIns);
router.get('/usersByAge', totalUsersByAge);
router.get("/purchaseByLocation", totalPurchaseByLocation);

export default router;
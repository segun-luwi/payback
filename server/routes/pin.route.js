import { Router } from 'express';
import { generatePins, addPoints } from '../controllers/pin.controller';

const router = Router();

router.post('/generate', generatePins);
router.post('/addPoints', addPoints);

export default router;
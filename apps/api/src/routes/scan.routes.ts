import { Router } from 'express';
import { verifyBottleScan } from '../controllers/scan.controller';

const router = Router();
router.post('/scan/verify', verifyBottleScan);
export default router;

import { Router } from 'express';
import { getUserByQrId, getImpactAnalytics } from '../controllers/user.controller';

const router = Router();
router.get('/user/:qrId', getUserByQrId);
router.get('/analytics/impact', getImpactAnalytics);
export default router;

import { Router } from 'express';
import { getUserByQrId, getImpactAnalytics } from '../controllers/user.controller';

const router = Router();
router.get('/analytics/impact', getImpactAnalytics);
router.get('/:qrId', getUserByQrId);
export default router;

import { Router } from 'express';
import { handleWithdraw } from '../controllers/wallet.controller';

const router = Router();

router.post('/wallet/withdraw', handleWithdraw);

export default router;
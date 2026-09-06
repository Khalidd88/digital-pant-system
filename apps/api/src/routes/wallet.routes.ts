import { Router } from 'express';
import { handleWithdraw, topupWallet } from '../controllers/wallet.controller';

const router = Router();

router.post('/wallet/withdraw', handleWithdraw);
router.post('/wallet/withdraw', handleWithdraw);
router.post('/wallet/topup', topupWallet);

export default router;
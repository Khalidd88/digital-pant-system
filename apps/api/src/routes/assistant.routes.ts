import { Router } from 'express';
const router = Router();

router.post('/chat', (req, res) => {
  res.json({
    success: true,
    reply: "Halo! PANTRA Assistant siap membantu seputar penukaran botol dan saldo kas warung.",
  });
});

export default router;

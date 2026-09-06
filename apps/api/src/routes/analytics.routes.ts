import { Router } from 'express';
const router = Router();

router.get('/impact', (req, res) => {
  res.json({
    success: true,
    data: { totalBottles: 1420, co2SavedKg: 28.4, activeWarga: 84 },
  });
});

export default router;

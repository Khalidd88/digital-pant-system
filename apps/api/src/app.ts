import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import scanRoutes from './routes/scan.routes';

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Root endpoint untuk cek status & daftar rute
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'Digital Pant System (PANTRA) API',
    endpoints: {
      health: '/health',
      getUser: 'GET /api/user/:qrId',
      verifyScan: 'POST /api/scan/verify',
      impactAnalytics: 'GET /api/analytics/impact'
    }
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'online', system: 'Digital Pant System Backend' });
});

app.use('/api', userRoutes);
app.use('/api', scanRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack || err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
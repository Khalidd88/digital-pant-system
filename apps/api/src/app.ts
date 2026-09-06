import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import scanRoutes from './routes/scan.routes';
import assistantRoutes from './routes/assistant.routes';
import walletRoutes from './routes/wallet.routes';

const app: Application = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Root endpoint untuk cek status & daftar rute
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'online',
    system: 'Digital Pant System (PANTRA) API',
    endpoints: {
      health: 'GET /health',
      authLogin: 'POST /api/auth/login',
      getUser: 'GET /api/user/:qrId',
      verifyScan: 'POST /api/scan/verify',
      impactAnalytics: 'GET /api/analytics/impact',
      assistantChat: 'POST /api/assistant/chat',
      walletWithdraw: 'POST /api/wallet/withdraw'
    }
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'online', system: 'Digital Pant System Backend' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', scanRoutes);
app.use('/api', assistantRoutes);
app.use('/api', walletRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack || err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
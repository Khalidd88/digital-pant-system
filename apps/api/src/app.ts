import express, { type Request, type Response } from 'express';
import cors from 'cors';

// Import router/controllers yang ada di project kamu
// Sesuaikan import di bawah jika ada nama router yang berbeda di folder routes
let scanRoutes: any;
let authRoutes: any;
let userRoutes: any;
let analyticsRoutes: any;
let assistantRoutes: any;
let walletRoutes: any;

try { scanRoutes = require('./routes/scan.routes').default || require('./routes/scan.routes'); } catch (e) {}
try { authRoutes = require('./routes/auth.routes').default || require('./routes/auth.routes'); } catch (e) {}
try { userRoutes = require('./routes/user.routes').default || require('./routes/user.routes'); } catch (e) {}
try { analyticsRoutes = require('./routes/analytics.routes').default || require('./routes/analytics.routes'); } catch (e) {}
try { assistantRoutes = require('./routes/assistant.routes').default || require('./routes/assistant.routes'); } catch (e) {}
try { walletRoutes = require('./routes/wallet.routes').default || require('./routes/wallet.routes'); } catch (e) {}

const app = express();

// 1. CORS Terbuka Penuh untuk Vercel & Origin Manapun
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// Pre-flight request handler
app.options('*', cors());

// 2. Body Parser ukuran besar untuk transfer Base64 foto kamera
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Health & Index Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'Digital Pant System (PANTRA) API',
    endpoints: {
      health: 'GET /health',
      authLogin: 'POST /api/auth/login',
      getUser: 'GET /api/user/:qrId',
      verifyScan: 'POST /api/scan/verify',
      detectBottle: 'POST /api/scan/detect',
      impactAnalytics: 'GET /api/analytics/impact',
      assistantChat: 'POST /api/assistant/chat',
      walletWithdraw: 'POST /api/wallet/withdraw',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. Pasang Rute API
if (scanRoutes) app.use('/api/scan', scanRoutes);
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/user', userRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (assistantRoutes) app.use('/api/assistant', assistantRoutes);
if (walletRoutes) app.use('/api/wallet', walletRoutes);

// 5. Fallback Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
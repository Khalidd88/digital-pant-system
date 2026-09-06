import { Router } from 'express';
import { handleAssistantChat } from '../controllers/assistant.controller';

const router = Router();

// Wajib arahkan ke handleAssistantChat agar Gemini dan Prisma dieksekusi
router.post('/chat', handleAssistantChat);

export default router;
import { Router } from 'express';
import { handleAssistantChat } from '../controllers/assistant.controller';

const router = Router();

router.post('/assistant/chat', handleAssistantChat);

export default router;
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getOrCreateConversation, getMyConversations,
  getMessages, sendMessage,
} from '../controllers/chatController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;

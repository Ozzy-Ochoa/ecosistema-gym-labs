import { Router, Request, Response } from 'express';
import { getAuthenticatedUserId } from './auth';
import { readUserPartition, writeUserPartition } from '../database/db';

const router = Router();

// 1. Get Chat Messages
router.get('/', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const conversationId = req.query.conversationId as string;
  let messages = partition.messages || [];

  if (conversationId) {
    messages = messages.filter((m: any) => m.conversationId === conversationId);
  }

  return res.json({
    conversations: [],
    messages,
  });
});

// 2. Send Message
router.post('/messages', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { conversationId, receiverId, receiverName, text, attachmentName, attachmentType } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Mensagem não pode ser vazia' });
  }

  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  const newMessage = {
    id: `msg-${Date.now()}`,
    conversationId: conversationId || `conv_${receiverId || 'direct'}`,
    senderId: userId,
    senderName: partition.user.name,
    senderRole: partition.user.role,
    receiverId: receiverId || '',
    receiverName: receiverName || 'Contato',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    read: true,
    attachmentName,
    attachmentType,
  };

  if (!partition.messages) partition.messages = [];
  partition.messages.push(newMessage);
  writeUserPartition(userId, partition);

  return res.status(201).json({ message: newMessage });
});

// 3. Mark Conversation as Read
router.patch('/conversations/:id/read', (req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const conversationId = req.params.id;
  const partition = readUserPartition(userId);
  if (!partition) return res.status(404).json({ error: 'User partition missing' });

  if (partition.messages) {
    partition.messages.forEach((m: any) => {
      if (m.conversationId === conversationId && m.receiverId === userId) {
        m.read = true;
      }
    });
    writeUserPartition(userId, partition);
  }

  return res.json({ success: true });
});

export default router;

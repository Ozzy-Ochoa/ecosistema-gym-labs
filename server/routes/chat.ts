import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { ChatRepository } from '../repositories/ChatRepository';
import { AuditRepository } from '../repositories/AuditRepository';

const router = Router();

// 1. Get Conversations & Messages
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversationId = req.query.conversationId as string;

    const conversations = await ChatRepository.getConversations(userId);

    let messages: any[] = [];
    if (conversationId) {
      try {
        messages = await ChatRepository.getMessages(conversationId, userId);
      } catch (err: any) {
        if (err.message === 'FORBIDDEN_NOT_PARTICIPANT') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Acesso negado: o usuário não é participante desta conversa',
            },
          });
        }
        throw err;
      }
    }

    return res.json({
      success: true,
      conversations,
      messages,
    });
  } catch (err: any) {
    console.error('Error fetching chat data:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao carregar mensagens no banco relacional' },
    });
  }
});

// 2. Send Message (Enforces Participant Verification)
router.post('/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const senderId = req.userId!;
    let { conversationId, receiverId, text, content, attachmentName, attachmentType } = req.body;
    const msgContent = (content || text || '').trim();

    if (!msgContent) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'O conteúdo da mensagem não pode ser vazio' },
      });
    }

    // Se conversationId não foi passado mas receiverId sim, obter/criar conversa direta
    if (!conversationId && receiverId) {
      const conv = await ChatRepository.getOrCreateDirectConversation(senderId, receiverId);
      conversationId = conv.id;
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'conversationId ou receiverId é obrigatório' },
      });
    }

    try {
      const message = await ChatRepository.sendMessage(
        conversationId,
        senderId,
        receiverId || 'system',
        msgContent,
        attachmentName ? { name: attachmentName, type: attachmentType || 'document' } : undefined
      );

      await AuditRepository.logEvent(
        senderId,
        'CHAT_MESSAGE_CREATED',
        message.id,
        { conversationId },
        { ip: req.ip, userAgent: req.headers['user-agent'] as string }
      );

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_NOT_PARTICIPANT') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acesso negado: você não tem permissão para enviar mensagens nesta conversa',
          },
        });
      }
      throw err;
    }
  } catch (err: any) {
    console.error('Error sending message:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao persistir mensagem no banco de dados' },
    });
  }
});

// 3. Mark Conversation as Read
router.patch('/conversations/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const conversationId = req.params.id;

    await ChatRepository.markAsRead(conversationId, userId);

    return res.json({
      success: true,
      message: 'Conversa marcada como lida',
    });
  } catch (err: any) {
    console.error('Error marking conversation read:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro ao atualizar status de leitura' },
    });
  }
});

export default router;

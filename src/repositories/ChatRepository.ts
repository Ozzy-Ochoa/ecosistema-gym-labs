import { IChatRepository } from './interfaces/IChatRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { ChatMessage } from '../types/ecosystem';
import { chatApi } from '../api/chat.api';

export class ChatRepository implements IChatRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getMessages(conversationId?: string): ChatMessage[] {
    return this.localStore.getChatMessages(conversationId);
  }

  public async sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    try {
      const res = await chatApi.sendMessage({
        conversationId: message.conversationId,
        receiverId: message.receiverId,
        receiverName: message.receiverName,
        text: message.text,
        attachmentName: message.attachmentName,
        attachmentType: message.attachmentType,
      });

      if (res.success && res.data?.message) {
        const rawMsg = res.data.message as any;
        const confirmed: ChatMessage = {
          id: rawMsg.id,
          conversationId: rawMsg.conversationId,
          senderId: rawMsg.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole,
          receiverId: rawMsg.receiverId || rawMsg.recipientId || message.receiverId,
          receiverName: message.receiverName,
          text: rawMsg.text || rawMsg.content || message.text,
          timestamp: rawMsg.timestamp || rawMsg.createdAt || new Date().toISOString(),
          read: Boolean(rawMsg.read),
          attachmentName: rawMsg.attachmentName,
          attachmentType: rawMsg.attachmentType,
        };
        this.localStore.sendChatMessage(confirmed);
        return confirmed;
      }
    } catch (err) {
      console.warn('[ChatRepository] API indisponível, armazenando localmente:', err);
    }

    // Fallback local imediato
    return this.localStore.sendChatMessage(message);
  }

  public async markAsRead(conversationId: string, currentUserId: string): Promise<void> {
    try {
      await chatApi.markAsRead(conversationId);
    } catch (err) {
      console.warn('[ChatRepository] API indisponível para markAsRead:', err);
    }
    this.localStore.markChatAsRead(conversationId, currentUserId);
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await chatApi.getMessages();
      return res.success;
    } catch {
      return false;
    }
  }
}

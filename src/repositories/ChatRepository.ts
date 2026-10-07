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
    const saved = this.localStore.sendChatMessage(message);

    try {
      await chatApi.sendMessage(saved);
    } catch {
      // Local fallback preservado
    }

    return saved;
  }

  public async markAsRead(conversationId: string, currentUserId: string): Promise<void> {
    this.localStore.markChatAsRead(conversationId, currentUserId);

    try {
      await chatApi.markAsRead(conversationId);
    } catch {
      // Local fallback preservado
    }
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

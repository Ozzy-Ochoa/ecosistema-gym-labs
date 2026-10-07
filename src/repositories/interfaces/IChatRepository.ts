import { ChatMessage } from '../../types/ecosystem';

export interface IChatRepository {
  getMessages(conversationId?: string): ChatMessage[];
  sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage>;
  markAsRead(conversationId: string, currentUserId: string): Promise<void>;
  syncRemote(): Promise<boolean>;
}

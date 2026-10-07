import { db } from '../../src/db/index';
import {
  conversations,
  conversationParticipants,
  messages,
  messageReads,
} from '../../src/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export class ChatRepository {
  public static async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const list = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);
    return list.length > 0;
  }

  public static async getConversations(userId: string) {
    // Busca conversas onde o usuário é participante
    const userParts = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    if (userParts.length === 0) return [];

    const convIds = userParts.map((p) => p.conversationId);
    const convs = await Promise.all(
      convIds.map(async (cid) => {
        const c = await db.select().from(conversations).where(eq(conversations.id, cid)).limit(1);
        const participants = await db
          .select()
          .from(conversationParticipants)
          .where(eq(conversationParticipants.conversationId, cid));
        const lastMsg = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, cid))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return {
          ...c[0],
          participants: participants.map((p) => p.userId),
          lastMessage: lastMsg[0] || null,
        };
      })
    );

    return convs.filter(Boolean);
  }

  public static async getOrCreateDirectConversation(userA: string, userB: string) {
    // Checa se já existe conversa entre os dois
    const allA = await db
      .select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userA));

    for (const pa of allA) {
      const match = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, pa.conversationId),
            eq(conversationParticipants.userId, userB)
          )
        )
        .limit(1);

      if (match.length > 0) {
        const conv = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, pa.conversationId))
          .limit(1);
        return conv[0];
      }
    }

    // Cria nova conversa
    const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.transaction(async (tx) => {
      await tx.insert(conversations).values({
        id: convId,
        type: 'DIRECT',
        studentContextId: userB,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(conversationParticipants).values([
        {
          id: `cp-${convId}-${userA}`,
          conversationId: convId,
          userId: userA,
          unreadCount: 0,
          joinedAt: now,
        },
        {
          id: `cp-${convId}-${userB}`,
          conversationId: convId,
          userId: userB,
          unreadCount: 0,
          joinedAt: now,
        },
      ]);
    });

    const created = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
    return created[0];
  }

  public static async getMessages(conversationId: string, requestingUserId: string) {
    // Validação estrita de participante
    const ok = await this.isParticipant(conversationId, requestingUserId);
    if (!ok) {
      throw new Error('FORBIDDEN_NOT_PARTICIPANT');
    }

    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));
  }

  public static async sendMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    content: string,
    attachment?: { name: string; type: string }
  ) {
    // Validação estrita de participante
    const ok = await this.isParticipant(conversationId, senderId);
    if (!ok) {
      throw new Error('FORBIDDEN_NOT_PARTICIPANT');
    }

    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.transaction(async (tx) => {
      await tx.insert(messages).values({
        id,
        conversationId,
        senderId,
        recipientId,
        content,
        attachmentName: attachment?.name || null,
        attachmentType: attachment?.type || null,
        read: false,
        createdAt: now,
      });

      await tx
        .update(conversations)
        .set({ updatedAt: now })
        .where(eq(conversations.id, conversationId));
    });

    const list = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return list[0];
  }

  public static async markAsRead(conversationId: string, userId: string) {
    const now = new Date();
    await db
      .update(messages)
      .set({ read: true })
      .where(and(eq(messages.conversationId, conversationId), eq(messages.recipientId, userId)));

    await db
      .update(conversationParticipants)
      .set({ unreadCount: 0 })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );

    return { success: true };
  }
}

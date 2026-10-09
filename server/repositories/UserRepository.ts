import { db } from '../../src/db/index';
import { users, profiles, roles, userRoles } from '../../src/db/schema';
import { eq, or } from 'drizzle-orm';

export interface UserCreateDTO {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  pinHash?: string;
  recoveryKeyHash?: string;
  role?: string;
  isDemo?: boolean;
}

export class UserRepository {
  public static async findByEmail(email: string) {
    const list = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return list[0] || null;
  }

  public static async findById(id: string) {
    const list = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return list[0] || null;
  }

  public static async createUser(dto: UserCreateDTO) {
    const now = new Date();
    return db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: dto.id,
        email: dto.email.toLowerCase().trim(),
        name: dto.name,
        passwordHash: dto.passwordHash || null,
        pinHash: dto.pinHash || null,
        recoveryKeyHash: dto.recoveryKeyHash || null,
        status: 'ACTIVE',
        jurisdiction: 'BR',
        language: 'pt',
        timezone: 'America/Sao_Paulo',
        unitSystem: 'METRIC',
        isDemo: Boolean(dto.isDemo),
        createdAt: now,
        updatedAt: now,
      });

      // Profile inicial
      await tx.insert(profiles).values({
        id: `prf-${dto.id}`,
        userId: dto.id,
        provenanceType: dto.isDemo ? 'DEMO' : 'REAL',
        createdAt: now,
        updatedAt: now,
      }).catch(() => {});

      // Atribuir papel padrão
      const roleName = (dto.role || 'USER').toUpperCase();
      await tx.insert(userRoles).values({
        id: `ur-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: dto.id,
        roleName: ['USER', 'COACH', 'NUTRITIONIST', 'GYM', 'ADMIN'].includes(roleName) ? roleName : 'USER',
        assignedAt: now,
      }).catch(() => {});

      const created = await tx
        .select()
        .from(users)
        .where(eq(users.id, dto.id))
        .limit(1);
      return created[0] || null;
    });
  }

  public static async updateUser(id: string, partial: Partial<typeof users.$inferInsert>) {
    await db
      .update(users)
      .set({ ...partial, updatedAt: new Date() })
      .where(eq(users.id, id));
    return this.findById(id);
  }

  public static async getProfile(userId: string) {
    const list = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    return list[0] || null;
  }

  public static async upsertProfile(userId: string, data: Partial<typeof profiles.$inferInsert>) {
    const existing = await this.getProfile(userId);
    if (existing) {
      await db
        .update(profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
    } else {
      await db.insert(profiles).values({
        id: `prf-${userId}`,
        userId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return this.getProfile(userId);
  }

  public static async getUserRoles(userId: string): Promise<string[]> {
    const list = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return list.map((r) => r.roleName);
  }
}

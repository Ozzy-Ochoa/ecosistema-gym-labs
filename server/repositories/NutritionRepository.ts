import { db } from '../../src/db/index';
import { nutritionPlans, meals, hydrationLogs, mealItems } from '../../src/db/schema';
import { eq, desc } from 'drizzle-orm';

export class NutritionRepository {
  public static async getPlans(userId: string) {
    return db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.userId, userId))
      .orderBy(desc(nutritionPlans.createdAt));
  }

  public static async createPlan(data: {
    id?: string;
    userId: string;
    prescribedById?: string;
    title: string;
    calorieTargetKcal: number;
    proteinTargetGrams: number;
    carbsTargetGrams: number;
    fatsTargetGrams: number;
    waterTargetMl: number;
  }) {
    const id = data.id || `nplan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(nutritionPlans).values({
      id,
      userId: data.userId,
      prescribedById: data.prescribedById || null,
      title: data.title,
      calorieTargetKcal: data.calorieTargetKcal,
      proteinTargetGrams: data.proteinTargetGrams,
      carbsTargetGrams: data.carbsTargetGrams,
      fatsTargetGrams: data.fatsTargetGrams,
      waterTargetMl: data.waterTargetMl,
      status: 'ACTIVE',
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const list = await db.select().from(nutritionPlans).where(eq(nutritionPlans.id, id)).limit(1);
    return list[0];
  }

  public static async getMeals(userId: string) {
    return db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.consumedAt));
  }

  public static async createMeal(data: {
    id?: string;
    userId: string;
    planId?: string;
    name: string;
    consumedAt?: Date;
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatsGrams?: number;
    itemsJson?: any;
    provenanceType?: string;
  }) {
    const id = data.id || `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();

    await db.insert(meals).values({
      id,
      userId: data.userId,
      planId: data.planId || null,
      name: data.name,
      consumedAt: data.consumedAt || now,
      calories: data.calories || 0,
      proteinGrams: data.proteinGrams || 0,
      carbsGrams: data.carbsGrams || 0,
      fatsGrams: data.fatsGrams || 0,
      itemsJson: data.itemsJson || [],
      provenanceType: data.provenanceType || 'REAL',
      createdAt: now,
    });

    const list = await db.select().from(meals).where(eq(meals.id, id)).limit(1);
    return list[0];
  }

  public static async getHydration(userId: string) {
    return db
      .select()
      .from(hydrationLogs)
      .where(eq(hydrationLogs.userId, userId))
      .orderBy(desc(hydrationLogs.recordedAt));
  }

  public static async logHydration(userId: string, amountMl: number) {
    const id = `hyd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(hydrationLogs).values({
      id,
      userId,
      amountMl,
      recordedAt: new Date(),
    });
    const list = await db.select().from(hydrationLogs).where(eq(hydrationLogs.id, id)).limit(1);
    return list[0];
  }
}

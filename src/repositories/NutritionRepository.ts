import { INutritionRepository } from './interfaces/INutritionRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { MealEntry, HydrationLog } from '../types/nutrition';
import { nutritionApi } from '../api/nutrition.api';
import { createMetricValue } from '../types/provenance';

export class NutritionRepository implements INutritionRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getMeals(): MealEntry[] {
    return this.localStore.getMeals();
  }

  public async addMeal(meal: MealEntry): Promise<void> {
    // 1. Tentar persistência remota (PostgreSQL) primeiro
    try {
      const res = await nutritionApi.logMeal(meal);
      if (res.success) {
        // 2. Retorno confirmado -> atualiza cache local como SYNCED
        this.localStore.addMeal({ ...meal, syncStatus: 'SYNCED' });
        return;
      }
    } catch (err) {
      console.warn('[NutritionRepository] API/PostgreSQL indisponível, gravando local com status PENDING:', err);
    }

    // 3. Fallback Offline: local cache com status PENDING
    this.localStore.addMeal({ ...meal, syncStatus: 'PENDING' });
  }

  public getHydration(): HydrationLog[] {
    return this.localStore.getHydration();
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await nutritionApi.getNutritionLogs();
      const logs = res.data?.nutritionLogs || (res.data as any)?.meals;
      if (res.success && Array.isArray(logs)) {
        logs.forEach((m: any) => {
          this.localStore.addMeal({
            id: m.id,
            userId: m.userId || 'current',
            mealType: m.mealType || 'LUNCH',
            name: m.name,
            loggedAt: typeof m.consumedAt === 'string' ? m.consumedAt : (m.loggedAt || new Date().toISOString()),
            items: m.items || [],
            totalCalories: createMetricValue(Number(m.calories) || 0, 'kcal', (m.provenanceType as any) || 'REAL'),
            totalProteinG: createMetricValue(Number(m.proteinGrams) || 0, 'g', (m.provenanceType as any) || 'REAL'),
            totalCarbsG: createMetricValue(Number(m.carbsGrams) || 0, 'g', (m.provenanceType as any) || 'REAL'),
            totalFatsG: createMetricValue(Number(m.fatsGrams) || 0, 'g', (m.provenanceType as any) || 'REAL'),
            syncStatus: 'SYNCED',
          });
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

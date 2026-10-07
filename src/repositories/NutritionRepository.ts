import { INutritionRepository } from './interfaces/INutritionRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { MealEntry, HydrationLog } from '../types/nutrition';
import { nutritionApi } from '../api/nutrition.api';

export class NutritionRepository implements INutritionRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getMeals(): MealEntry[] {
    return this.localStore.getMeals();
  }

  public async addMeal(meal: MealEntry): Promise<void> {
    this.localStore.addMeal(meal);

    try {
      await nutritionApi.logMeal(meal);
    } catch {
      // Local fallback preservado
    }
  }

  public getHydration(): HydrationLog[] {
    return this.localStore.getHydration();
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await nutritionApi.getNutritionLogs();
      return res.success;
    } catch {
      return false;
    }
  }
}

import { MealEntry, HydrationLog } from '../../types/nutrition';

export interface INutritionRepository {
  getMeals(): MealEntry[];
  addMeal(meal: MealEntry): Promise<void>;
  getHydration(): HydrationLog[];
  syncRemote(): Promise<boolean>;
}

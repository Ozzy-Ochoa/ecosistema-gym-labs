import { DataProvenance, MetricValue } from './provenance';
import { SyncStatus } from './api';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSizeGrams: number;
  servingUnitName: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG?: number;
  isVerified: boolean;
  provenance: DataProvenance;
}

export interface MealItem {
  food: FoodItem;
  quantity: number; // multiplier of serving
}

export interface MealEntry {
  id: string;
  userId: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'PRE_WORKOUT' | 'POST_WORKOUT';
  name: string;
  loggedAt: string;
  items: MealItem[];
  totalCalories: MetricValue<number>;
  totalProteinG: MetricValue<number>;
  totalCarbsG: MetricValue<number>;
  totalFatsG: MetricValue<number>;
  syncStatus?: SyncStatus;
}

export interface HydrationLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  consumedMl: number;
  estimatedTargetMl: MetricValue<number>;
}

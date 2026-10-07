import { IWorkoutRepository } from './interfaces/IWorkoutRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { TrainingSession, DayAttendance, UserWorkoutRoutine, Exercise } from '../types/training';
import { workoutsApi } from '../api/workouts.api';

export class WorkoutRepository implements IWorkoutRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getSessions(): TrainingSession[] {
    return this.localStore.getTrainingSessions();
  }

  public async saveSession(session: TrainingSession): Promise<void> {
    // 1. Persistência local imediata
    this.localStore.addTrainingSession(session);

    // 2. Sincronização remota em segundo plano
    try {
      await workoutsApi.logWorkout({
        id: session.id,
        title: session.title,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationMinutes: session.durationMinutes,
        sessionRpe: session.sessionRpe,
        exercises: session.exercises,
      });
    } catch {
      // Local fallback preservado
    }
  }

  public getAttendance(): DayAttendance[] {
    return this.localStore.getAttendanceLogs();
  }

  public getRoutine(): UserWorkoutRoutine {
    return this.localStore.getUserWorkoutRoutine();
  }

  public async saveRoutine(routine: UserWorkoutRoutine): Promise<void> {
    this.localStore.saveUserWorkoutRoutine(routine);
  }

  public getExercises(): Exercise[] {
    return this.localStore.getExercises();
  }

  public async addCustomExercise(exercise: Exercise): Promise<void> {
    this.localStore.addCustomExercise(exercise);
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await workoutsApi.getWorkouts();
      return Boolean(res.success && res.data?.workouts);
    } catch {
      return false;
    }
  }
}

import { IWorkoutRepository } from './interfaces/IWorkoutRepository';
import { GymLabsDataStore } from './GymLabsDataStore';
import { TrainingSession, DayAttendance, UserWorkoutRoutine, Exercise } from '../types/training';
import { workoutsApi } from '../api/workouts.api';
import { createMetricValue } from '../types/provenance';

export class WorkoutRepository implements IWorkoutRepository {
  private localStore: GymLabsDataStore;

  constructor(localStore?: GymLabsDataStore) {
    this.localStore = localStore || GymLabsDataStore.getInstance();
  }

  public getSessions(): TrainingSession[] {
    // Retorna cache local rápido
    return this.localStore.getTrainingSessions();
  }

  public async saveSession(session: TrainingSession): Promise<void> {
    // 1. Tentar persistência remota como Fonte Oficial (PostgreSQL via API)
    try {
      const res = await workoutsApi.logWorkout({
        id: session.id,
        title: session.title,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationMinutes: session.durationMinutes,
        sessionRpe: session.sessionRpe,
        exercises: session.exercises,
      });

      if (res.success && res.data?.workout) {
        // 2. Retorno confirmado do PostgreSQL -> Atualiza cache local como SYNCED
        const confirmed: TrainingSession = {
          ...session,
          syncStatus: 'SYNCED',
        };
        this.localStore.addTrainingSession(confirmed);
        return;
      }
    } catch (err) {
      console.warn('[WorkoutRepository] API/PostgreSQL indisponível, armazenando localmente com status PENDING:', err);
    }

    // 3. Fallback Offline: salvar local com status PENDING
    const pendingSession: TrainingSession = {
      ...session,
      syncStatus: 'PENDING',
    };
    this.localStore.addTrainingSession(pendingSession);
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
    try {
      const res = await workoutsApi.addCustomExercise({
        name: exercise.name,
        pattern: exercise.pattern,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        equipment: exercise.equipment,
        evidenceNotes: exercise.evidenceNotes,
      });
      if (res.success) {
        this.localStore.addCustomExercise({ ...exercise, syncStatus: 'SYNCED' });
        return;
      }
    } catch {}
    this.localStore.addCustomExercise({ ...exercise, syncStatus: 'PENDING' });
  }

  public async syncRemote(): Promise<boolean> {
    try {
      const res = await workoutsApi.getWorkouts();
      if (res.success && res.data?.workouts) {
        // Sincronizar cache local com o PostgreSQL
        res.data.workouts.forEach((w: any) => {
          this.localStore.addTrainingSession({
            id: w.id,
            userId: w.userId || 'current',
            title: w.title,
            startedAt: typeof w.startedAt === 'string' ? w.startedAt : new Date(w.startedAt).toISOString(),
            endedAt: typeof w.endedAt === 'string' ? w.endedAt : new Date(w.endedAt).toISOString(),
            durationMinutes: w.durationMinutes,
            sessionRpe: w.sessionRpe,
            exercises: w.exercisesJson || [],
            calculatedVolumeKg: createMetricValue(0, 'kg', (w.provenanceType as any) || 'REAL'),
            calculatedLoadUnits: createMetricValue((w.durationMinutes || 60) * (w.sessionRpe || 8), 'AU', (w.provenanceType as any) || 'REAL'),
            provenance: (w.provenanceType as any) || 'REAL',
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
